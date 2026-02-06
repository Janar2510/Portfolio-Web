-- Create onboarding progress tracking table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  current_step INTEGER DEFAULT 1,
  current_substep INTEGER DEFAULT 0,
  
  steps_completed JSONB DEFAULT '{
    "welcome": false,
    "profile": false,
    "template": false,
    "customize": false,
    "content": false,
    "tour": false,
    "publish": false
  }',
  
  user_type TEXT,
  primary_goal TEXT,
  selected_template_id TEXT,
  
  time_spent_seconds INTEGER DEFAULT 0,
  steps_skipped TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'onboarding_progress' AND policyname = 'Users can manage own onboarding progress'
  ) THEN
    CREATE POLICY "Users can manage own onboarding progress"
      ON public.onboarding_progress FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Auto-create record on user signup
CREATE OR REPLACE FUNCTION public.create_onboarding_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.onboarding_progress (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_user_created_onboarding ON public.users;
CREATE TRIGGER on_user_created_onboarding
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_onboarding_progress();

-- Create onboarding events table for tracking
CREATE TABLE IF NOT EXISTS public.onboarding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  step_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'onboarding_events' AND policyname = 'Users can insert own onboarding events'
  ) THEN
    CREATE POLICY "Users can insert own onboarding events"
      ON public.onboarding_events FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
