-- Migration: Add Drag & Drop Logic and Audit History
-- Description: Adds history tracking and atomic RPC functions for pipeline operations

-- 1. Enhance Deals Table
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_stage_id UUID REFERENCES public.pipeline_stages(id);

-- 2. Create Deal Stage History Table (Immutable Log)
CREATE TABLE public.deal_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL, -- Null if new deal
  to_stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  moved_at TIMESTAMPTZ DEFAULT NOW(),
  moved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Auditing
  duration_seconds INTEGER, -- Time spent in previous stage
  metadata JSONB DEFAULT '{}' -- Store context (speed, intent, automated?)
);

-- Enable RLS on History
ALTER TABLE public.deal_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deal history"
  ON public.deal_stage_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deals
      WHERE deals.id = deal_stage_history.deal_id
      AND deals.user_id = auth.uid()
    )
  );

-- 3. Atomic Function: Move Deal (Business Logic Core)
CREATE OR REPLACE FUNCTION public.move_deal_stage(
  p_deal_id UUID,
  p_new_stage_id UUID,
  p_new_sort_order INTEGER,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deal public.deals%ROWTYPE;
  v_old_stage_id UUID;
  v_stage_probability INTEGER;
  v_duration INTEGER;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  -- Lock row & Get current state
  SELECT * INTO v_deal FROM public.deals WHERE id = p_deal_id FOR UPDATE;

  -- Validation: Permission
  IF v_deal.user_id != v_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Validation: Locked State
  IF v_deal.is_locked THEN
    RAISE EXCEPTION 'Deal is locked and cannot be moved';
  END IF;

  v_old_stage_id := v_deal.stage_id;

  -- No-op if same stage (just reorder)
  IF v_old_stage_id = p_new_stage_id THEN
    UPDATE public.deals
    SET sort_order = p_new_sort_order,
        updated_at = NOW()
    WHERE id = p_deal_id;
    
    RETURN jsonb_build_object('success', true, 'action', 'reorder');
  END IF;

  -- Calculate Duration in previous stage
  IF v_deal.stage_entered_at IS NOT NULL THEN
    v_duration := EXTRACT(EPOCH FROM (NOW() - v_deal.stage_entered_at));
  ELSE
    v_duration := 0; 
  END IF;

  -- Get new stage probability
  SELECT probability INTO v_stage_probability
  FROM public.pipeline_stages
  WHERE id = p_new_stage_id;

  -- Update Deal
  UPDATE public.deals
  SET stage_id = p_new_stage_id,
      last_stage_id = v_old_stage_id,
      sort_order = p_new_sort_order,
      stage_entered_at = NOW(),
      probability = COALESCE(v_stage_probability, probability), -- Auto-update probability if stage dictates
      updated_at = NOW()
  WHERE id = p_deal_id;

  -- Log History
  INSERT INTO public.deal_stage_history (
    deal_id,
    from_stage_id,
    to_stage_id,
    moved_by,
    duration_seconds,
    metadata
  ) VALUES (
    p_deal_id,
    v_old_stage_id,
    p_new_stage_id,
    v_user_id,
    v_duration,
    p_metadata
  );

  RETURN jsonb_build_object(
    'success', true, 
    'action', 'move',
    'prev_stage', v_old_stage_id,
    'new_stage', p_new_stage_id
  );
END;
$$;

-- 4. Atomic Function: Reorder Pipeline Stages
CREATE OR REPLACE FUNCTION public.reorder_pipeline_stages(
  p_updates JSONB -- Array of {id: UUID, sort_order: INTEGER}
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item JSONB;
BEGIN
  -- Validate user owns these stages (simple check on first item for efficiency, strictly should check all)
  -- For strictness, the UPDATE will simply filter by user_id, so unauthorized updates won't happen.
  
  FOR item IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE public.pipeline_stages
    SET sort_order = (item->>'sort_order')::INTEGER
    WHERE id = (item->>'id')::UUID
    AND user_id = auth.uid();
  END LOOP;

  RETURN TRUE;
END;
$$;
