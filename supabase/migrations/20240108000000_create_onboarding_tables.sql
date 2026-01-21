-- Migration: Create Onboarding System tables
-- Description: Onboarding progress tracking, events, tooltips, and feature checklist

-- Onboarding progress tracking
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Overall status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Current position
  current_step INTEGER DEFAULT 1,
  current_substep INTEGER DEFAULT 0,
  
  -- Step completion tracking (JSONB for flexibility)
  steps_completed JSONB DEFAULT '{
    "welcome": false,
    "profile": false,
    "template": false,
    "customize": false,
    "content": false,
    "tour": false,
    "publish": false
  }',
  
  -- User selections during onboarding
  user_type TEXT,  -- 'freelancer', 'agency', 'business', 'creative'
  primary_goal TEXT,  -- 'portfolio', 'clients', 'both'
  selected_template_id UUID REFERENCES public.portfolio_templates(id),
  
  -- Analytics
  time_spent_seconds INTEGER DEFAULT 0,
  steps_skipped TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Onboarding events for analytics
CREATE TABLE IF NOT EXISTS public.onboarding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,  -- 'step_started', 'step_completed', 'step_skipped', 'help_clicked', 'template_previewed'
  step_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contextual tooltips tracking (which have been dismissed)
CREATE TABLE IF NOT EXISTS public.tooltip_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tooltip_id TEXT NOT NULL,  -- e.g., 'dashboard_intro', 'kanban_drag', 'crm_pipeline'
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tooltip_id)
);

-- Feature discovery checklist
CREATE TABLE IF NOT EXISTS public.feature_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Portfolio features
  portfolio_created BOOLEAN DEFAULT FALSE,
  first_page_added BOOLEAN DEFAULT FALSE,
  first_block_added BOOLEAN DEFAULT FALSE,
  styles_customized BOOLEAN DEFAULT FALSE,
  site_published BOOLEAN DEFAULT FALSE,
  
  -- Project features
  first_project_created BOOLEAN DEFAULT FALSE,
  first_task_created BOOLEAN DEFAULT FALSE,
  task_completed BOOLEAN DEFAULT FALSE,
  
  -- CRM features
  first_contact_added BOOLEAN DEFAULT FALSE,
  first_deal_created BOOLEAN DEFAULT FALSE,
  deal_moved BOOLEAN DEFAULT FALSE,
  
  -- Email features
  email_connected BOOLEAN DEFAULT FALSE,
  first_email_sent BOOLEAN DEFAULT FALSE,
  
  -- Analytics
  analytics_viewed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user ON public.onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_status ON public.onboarding_progress(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_user ON public.onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_type ON public.onboarding_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tooltip_dismissals_user ON public.tooltip_dismissals(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_checklist_user ON public.feature_checklist(user_id);

-- RLS Policies
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tooltip_dismissals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own onboarding progress"
  ON public.onboarding_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own onboarding events"
  ON public.onboarding_events FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tooltip dismissals"
  ON public.tooltip_dismissals FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own feature checklist"
  ON public.feature_checklist FOR ALL USING (auth.uid() = user_id);

-- Auto-create onboarding records on profile creation
CREATE OR REPLACE FUNCTION public.create_onboarding_records()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.onboarding_progress (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.feature_checklist (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_profile_created_onboarding ON public.profiles;
CREATE TRIGGER on_profile_created_onboarding
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_onboarding_records();
