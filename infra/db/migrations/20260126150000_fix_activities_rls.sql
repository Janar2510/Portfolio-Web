-- Fix RLS policies for crm_activities table
-- Ensure RLS is enabled
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own activities" ON public.crm_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.crm_activities;
DROP POLICY IF EXISTS "Users can update own activities" ON public.crm_activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON public.crm_activities;

-- Re-create policies
CREATE POLICY "Users can view own activities"
  ON public.crm_activities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON public.crm_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON public.crm_activities
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON public.crm_activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Ensure authenticated role has permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;
