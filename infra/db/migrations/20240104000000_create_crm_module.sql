-- Migration: Create CRM Module tables
-- Description: Companies, contacts, pipeline stages, deals, activities, and follow-ups with RLS policies

-- Companies (optional, contacts can exist without)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  size TEXT,                            -- 'small', 'medium', 'large', 'enterprise'
  address JSONB,                        -- {street, city, country, postal}
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',      -- {linkedin, twitter, etc.}
  address JSONB,
  lead_source TEXT,                     -- 'referral', 'website', 'social', etc.
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales pipeline stages
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  probability INTEGER DEFAULT 0,        -- Win probability percentage
  is_won BOOLEAN DEFAULT FALSE,
  is_lost BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals/Opportunities
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id),
  title TEXT NOT NULL,
  value DECIMAL(12,2),
  currency TEXT DEFAULT 'EUR',
  expected_close_date DATE,
  actual_close_date DATE,
  probability INTEGER,
  notes TEXT,
  lost_reason TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM Activities (timeline events)
CREATE TABLE public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,          -- 'email', 'call', 'meeting', 'note', 'task'
  title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',          -- Type-specific data (email subject, call duration)
  is_completed BOOLEAN DEFAULT TRUE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (contact_id IS NOT NULL OR deal_id IS NOT NULL)
);

-- Follow-up reminders
CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (contact_id IS NOT NULL OR deal_id IS NOT NULL)
);

-- Create indexes for better query performance
CREATE INDEX idx_companies_user_id ON public.companies(user_id);
CREATE INDEX idx_companies_name ON public.companies(user_id, name);

CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_company_id ON public.contacts(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_contacts_email ON public.contacts(email) WHERE email IS NOT NULL;
CREATE INDEX idx_contacts_name ON public.contacts(user_id, first_name, last_name);
CREATE INDEX idx_contacts_tags ON public.contacts USING GIN(tags);
CREATE INDEX idx_contacts_last_contacted ON public.contacts(last_contacted_at) WHERE last_contacted_at IS NOT NULL;

CREATE INDEX idx_pipeline_stages_user_id ON public.pipeline_stages(user_id);
CREATE INDEX idx_pipeline_stages_sort_order ON public.pipeline_stages(user_id, sort_order);

CREATE INDEX idx_deals_user_id ON public.deals(user_id);
CREATE INDEX idx_deals_contact_id ON public.deals(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_deals_company_id ON public.deals(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_deals_stage_id ON public.deals(stage_id);
CREATE INDEX idx_deals_sort_order ON public.deals(stage_id, sort_order);
CREATE INDEX idx_deals_expected_close ON public.deals(expected_close_date) WHERE expected_close_date IS NOT NULL;
CREATE INDEX idx_deals_value ON public.deals(user_id, value) WHERE value IS NOT NULL;

CREATE INDEX idx_crm_activities_user_id ON public.crm_activities(user_id);
CREATE INDEX idx_crm_activities_contact_id ON public.crm_activities(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_crm_activities_deal_id ON public.crm_activities(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_crm_activities_type ON public.crm_activities(activity_type);
CREATE INDEX idx_crm_activities_created ON public.crm_activities(contact_id, created_at) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_crm_activities_created_deal ON public.crm_activities(deal_id, created_at) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_crm_activities_due_date ON public.crm_activities(due_date) WHERE due_date IS NOT NULL;

CREATE INDEX idx_follow_ups_user_id ON public.follow_ups(user_id);
CREATE INDEX idx_follow_ups_contact_id ON public.follow_ups(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_follow_ups_deal_id ON public.follow_ups(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_follow_ups_due_date ON public.follow_ups(due_date);
CREATE INDEX idx_follow_ups_completed ON public.follow_ups(is_completed) WHERE is_completed = FALSE;

-- Triggers for updated_at
CREATE TRIGGER set_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update contact's last_contacted_at when activity is created
CREATE OR REPLACE FUNCTION public.handle_contact_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contact_id IS NOT NULL AND NEW.is_completed = TRUE THEN
    UPDATE public.contacts
    SET last_contacted_at = NOW()
    WHERE id = NEW.contact_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_last_contacted
  AFTER INSERT ON public.crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_contact_activity();

-- Trigger to set completed_at when activity is marked as completed
CREATE OR REPLACE FUNCTION public.handle_activity_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    NEW.completed_at = NOW();
  ELSIF NEW.is_completed = FALSE AND OLD.is_completed = TRUE THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_activity_completed_at
  BEFORE UPDATE ON public.crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_activity_completion();

-- Trigger to set completed_at when follow-up is marked as completed
CREATE OR REPLACE FUNCTION public.handle_follow_up_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    NEW.completed_at = NOW();
  ELSIF NEW.is_completed = FALSE AND OLD.is_completed = TRUE THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_follow_up_completed_at
  BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_follow_up_completion();

-- Trigger to update deal's actual_close_date when moved to won stage
CREATE OR REPLACE FUNCTION public.handle_deal_won()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.pipeline_stages
    WHERE id = NEW.stage_id
    AND is_won = TRUE
  ) AND OLD.actual_close_date IS NULL THEN
    NEW.actual_close_date = CURRENT_DATE;
    NEW.probability = 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_deal_close_date
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deal_won();

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
-- Users can view their own companies
CREATE POLICY "Users can view own companies"
  ON public.companies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own companies
CREATE POLICY "Users can insert own companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own companies
CREATE POLICY "Users can update own companies"
  ON public.companies
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own companies
CREATE POLICY "Users can delete own companies"
  ON public.companies
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for contacts
-- Users can view their own contacts
CREATE POLICY "Users can view own contacts"
  ON public.contacts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own contacts
CREATE POLICY "Users can insert own contacts"
  ON public.contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own contacts
CREATE POLICY "Users can update own contacts"
  ON public.contacts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own contacts
CREATE POLICY "Users can delete own contacts"
  ON public.contacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pipeline_stages
-- Users can view their own pipeline stages
CREATE POLICY "Users can view own pipeline stages"
  ON public.pipeline_stages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own pipeline stages
CREATE POLICY "Users can insert own pipeline stages"
  ON public.pipeline_stages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pipeline stages
CREATE POLICY "Users can update own pipeline stages"
  ON public.pipeline_stages
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own pipeline stages
CREATE POLICY "Users can delete own pipeline stages"
  ON public.pipeline_stages
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for deals
-- Users can view their own deals
CREATE POLICY "Users can view own deals"
  ON public.deals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own deals
CREATE POLICY "Users can insert own deals"
  ON public.deals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own deals
CREATE POLICY "Users can update own deals"
  ON public.deals
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own deals
CREATE POLICY "Users can delete own deals"
  ON public.deals
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for crm_activities
-- Users can view their own activities
CREATE POLICY "Users can view own activities"
  ON public.crm_activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own activities
CREATE POLICY "Users can insert own activities"
  ON public.crm_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own activities
CREATE POLICY "Users can update own activities"
  ON public.crm_activities
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own activities
CREATE POLICY "Users can delete own activities"
  ON public.crm_activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for follow_ups
-- Users can view their own follow-ups
CREATE POLICY "Users can view own follow-ups"
  ON public.follow_ups
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own follow-ups
CREATE POLICY "Users can insert own follow-ups"
  ON public.follow_ups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own follow-ups
CREATE POLICY "Users can update own follow-ups"
  ON public.follow_ups
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own follow-ups
CREATE POLICY "Users can delete own follow-ups"
  ON public.follow_ups
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pipeline_stages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_ups TO authenticated;
