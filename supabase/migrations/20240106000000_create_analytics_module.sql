-- Migration: Create Analytics & A/B Testing Module tables
-- Description: Analytics events, A/B tests, and aggregated analytics with RLS policies

-- Portfolio page views (analytics events)
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.portfolio_sites(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.portfolio_pages(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,             -- 'pageview', 'click', 'form_submit'
  visitor_id TEXT,                      -- Anonymous visitor fingerprint
  session_id TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  country TEXT,
  device_type TEXT,
  browser TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Test experiments
CREATE TABLE public.ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.portfolio_sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_type TEXT NOT NULL,            -- 'page', 'block', 'style'
  target_id UUID,                       -- ID of page/block being tested
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  traffic_split INTEGER DEFAULT 50,     -- Percentage for variant B
  goal_type TEXT,                       -- 'pageview', 'click', 'form_submit'
  goal_target TEXT,                     -- Specific element or action
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Test variants
CREATE TABLE public.ab_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                   -- 'Control', 'Variant A', etc.
  is_control BOOLEAN DEFAULT FALSE,
  content_diff JSONB NOT NULL,          -- What's different in this variant
  visitors INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated analytics (daily rollups)
CREATE TABLE public.analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.portfolio_sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  pageviews INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  form_submissions INTEGER DEFAULT 0,
  avg_session_duration INTEGER,         -- Seconds
  bounce_rate DECIMAL(5,2),
  top_pages JSONB,
  top_referrers JSONB,
  devices JSONB,
  countries JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, date)
);

-- Create indexes for better query performance
CREATE INDEX idx_analytics_events_site_id ON public.analytics_events(site_id);
CREATE INDEX idx_analytics_events_page_id ON public.analytics_events(page_id) WHERE page_id IS NOT NULL;
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(site_id, event_type);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id) WHERE session_id IS NOT NULL;
-- High-priority combined indexes for common queries
CREATE INDEX idx_analytics_events_site_date ON public.analytics_events(site_id, created_at DESC);
CREATE INDEX idx_analytics_events_visitor ON public.analytics_events(visitor_id) WHERE visitor_id IS NOT NULL;
CREATE INDEX idx_analytics_events_utm ON public.analytics_events(site_id, utm_source, utm_campaign) WHERE utm_source IS NOT NULL;
CREATE INDEX idx_analytics_events_country ON public.analytics_events(site_id, country) WHERE country IS NOT NULL;
CREATE INDEX idx_analytics_events_device ON public.analytics_events(site_id, device_type) WHERE device_type IS NOT NULL;

CREATE INDEX idx_ab_experiments_user_id ON public.ab_experiments(user_id);
CREATE INDEX idx_ab_experiments_site_id ON public.ab_experiments(site_id);
CREATE INDEX idx_ab_experiments_status ON public.ab_experiments(site_id, status);
CREATE INDEX idx_ab_experiments_target ON public.ab_experiments(target_type, target_id) WHERE target_id IS NOT NULL;

CREATE INDEX idx_ab_variants_experiment_id ON public.ab_variants(experiment_id);
CREATE INDEX idx_ab_variants_control ON public.ab_variants(experiment_id, is_control) WHERE is_control = TRUE;

CREATE INDEX idx_analytics_daily_site_id ON public.analytics_daily(site_id);
CREATE INDEX idx_analytics_daily_date ON public.analytics_daily(site_id, date);
CREATE INDEX idx_analytics_daily_date_range ON public.analytics_daily(site_id, date DESC);

-- Trigger to update variant stats when analytics event matches experiment goal
CREATE OR REPLACE FUNCTION public.handle_ab_conversion()
RETURNS TRIGGER AS $$
DECLARE
  v_experiment_id UUID;
  v_variant_id UUID;
BEGIN
  -- Check if this event matches any running experiment's goal
  SELECT ab_experiments.id INTO v_experiment_id
  FROM public.ab_experiments
  WHERE ab_experiments.site_id = NEW.site_id
    AND ab_experiments.status = 'running'
    AND ab_experiments.goal_type = NEW.event_type
    AND (
      ab_experiments.goal_target IS NULL
      OR NEW.metadata->>'target' = ab_experiments.goal_target
    )
  LIMIT 1;

  IF v_experiment_id IS NOT NULL THEN
    -- Get the variant assigned to this visitor (stored in metadata)
    SELECT id INTO v_variant_id
    FROM public.ab_variants
    WHERE experiment_id = v_experiment_id
      AND id::text = NEW.metadata->>'variant_id';

    IF v_variant_id IS NOT NULL THEN
      UPDATE public.ab_variants
      SET conversions = conversions + 1
      WHERE id = v_variant_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ab_conversion
  AFTER INSERT ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ab_conversion();

-- Trigger to update variant visitor count
CREATE OR REPLACE FUNCTION public.handle_ab_visitor()
RETURNS TRIGGER AS $$
DECLARE
  v_experiment_id UUID;
  v_variant_id UUID;
BEGIN
  -- Only track pageview events for visitor counting
  IF NEW.event_type = 'pageview' AND NEW.metadata->>'variant_id' IS NOT NULL THEN
    v_variant_id := (NEW.metadata->>'variant_id')::UUID;
    
    -- Verify variant exists and belongs to a running experiment
    SELECT experiment_id INTO v_experiment_id
    FROM public.ab_variants
    WHERE id = v_variant_id;

    IF v_experiment_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.ab_experiments
      WHERE id = v_experiment_id
      AND status = 'running'
    ) THEN
      -- Only increment if this is the first pageview for this visitor in this session
      UPDATE public.ab_variants
      SET visitors = visitors + 1
      WHERE id = v_variant_id
      AND NOT EXISTS (
        SELECT 1 FROM public.analytics_events
        WHERE visitor_id = NEW.visitor_id
        AND session_id = NEW.session_id
        AND event_type = 'pageview'
        AND metadata->>'variant_id' = v_variant_id::text
        AND id != NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ab_visitor
  AFTER INSERT ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ab_visitor();

-- Enable Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
-- Users can view events for their own sites
CREATE POLICY "Users can view own site analytics"
  ON public.analytics_events
  FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM public.portfolio_sites WHERE user_id = auth.uid()
    )
  );

-- Anyone can insert events (for tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (TRUE);

-- RLS Policies for ab_experiments
-- Users can view their own experiments
CREATE POLICY "Users can view own experiments"
  ON public.ab_experiments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own experiments
CREATE POLICY "Users can insert own experiments"
  ON public.ab_experiments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own experiments
CREATE POLICY "Users can update own experiments"
  ON public.ab_experiments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own experiments
CREATE POLICY "Users can delete own experiments"
  ON public.ab_experiments
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ab_variants
-- Users can view variants of their own experiments
CREATE POLICY "Users can view own experiment variants"
  ON public.ab_variants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ab_experiments
      WHERE ab_experiments.id = ab_variants.experiment_id
      AND ab_experiments.user_id = auth.uid()
    )
  );

-- Users can insert variants to their own experiments
CREATE POLICY "Users can insert own experiment variants"
  ON public.ab_variants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ab_experiments
      WHERE ab_experiments.id = ab_variants.experiment_id
      AND ab_experiments.user_id = auth.uid()
    )
  );

-- Users can update variants of their own experiments
CREATE POLICY "Users can update own experiment variants"
  ON public.ab_variants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.ab_experiments
      WHERE ab_experiments.id = ab_variants.experiment_id
      AND ab_experiments.user_id = auth.uid()
    )
  );

-- Users can delete variants of their own experiments
CREATE POLICY "Users can delete own experiment variants"
  ON public.ab_variants
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.ab_experiments
      WHERE ab_experiments.id = ab_variants.experiment_id
      AND ab_experiments.user_id = auth.uid()
    )
  );

-- RLS Policies for analytics_daily
-- Users can view daily analytics for their own sites
CREATE POLICY "Users can view own site daily analytics"
  ON public.analytics_daily
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_sites
      WHERE portfolio_sites.id = analytics_daily.site_id
      AND portfolio_sites.user_id = auth.uid()
    )
  );

-- Service role can insert/update daily analytics (via edge function)
-- No INSERT/UPDATE policies for authenticated users - handled by edge function

-- Grant necessary permissions
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ab_experiments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ab_variants TO authenticated;
GRANT SELECT ON public.analytics_daily TO authenticated;
