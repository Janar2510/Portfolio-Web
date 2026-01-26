-- ============================================================
-- CONSOLIDATED CRM SCHEMA MIGRATION
-- Apply this entire script in Supabase Dashboard SQL Editor
-- ============================================================
--
-- This combines all three migration files:
-- 1. 20260126160000_crm_unified_schema.sql
-- 2. 20260126161000_fix_array_defaults.sql  
-- 3. 20260126162000_fix_activities_constraint.sql
--
-- Run this as ONE script in: Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================
-- PART 1: CORE SCHEMA EXTENSIONS
-- ============================================

-- Extend CONTACTS table
ALTER TABLE public.contacts 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'owner',
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS primary_email TEXT,
  ADD COLUMN IF NOT EXISTS additional_emails TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS primary_phone TEXT,
  ADD COLUMN IF NOT EXISTS additional_phones TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_activity_at TIMESTAMPTZ;

-- Add CHECK constraint on visibility (if not exists)
DO $$ BEGIN
  ALTER TABLE public.contacts ADD CONSTRAINT contacts_visibility_check 
    CHECK (visibility IN ('owner','team','company'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Migrate existing contact data
UPDATE public.contacts 
SET owner_user_id = user_id,
    primary_email = email,
    primary_phone = phone,
    visibility = COALESCE(visibility, 'owner'),
    additional_emails = COALESCE(additional_emails, '{}'),
    additional_phones = COALESCE(additional_phones, '{}')
WHERE owner_user_id IS NULL;

-- Extend COMPANIES table
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'owner',
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_activity_at TIMESTAMPTZ;

-- Add CHECK constraint
DO $$ BEGIN
  ALTER TABLE public.companies ADD CONSTRAINT companies_visibility_check 
    CHECK (visibility IN ('owner','team','company'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Migrate existing company data
UPDATE public.companies 
SET owner_user_id = user_id,
    visibility = COALESCE(visibility, 'owner')
WHERE owner_user_id IS NULL;

-- Extract domain from website
UPDATE public.companies
SET domain = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(website, '^https?://', ''), '/.*$', ''))
WHERE website IS NOT NULL 
  AND domain IS NULL
  AND website ~ '^https?://';

-- Extend DEALS table
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'owner',
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.profiles(id);

DO $$ BEGIN
  ALTER TABLE public.deals ADD CONSTRAINT deals_visibility_check 
    CHECK (visibility IN ('owner','team','company'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

UPDATE public.deals 
SET owner_user_id = user_id,
    visibility = COALESCE(visibility, 'owner')
WHERE owner_user_id IS NULL;

-- Extend CRM_ACTIVITIES table
ALTER TABLE public.crm_activities
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS calendar_event_id TEXT,
  ADD COLUMN IF NOT EXISTS participants JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Backfill participants
UPDATE public.crm_activities
SET participants = COALESCE(participants, '[]')
WHERE participants IS NULL;

-- Remove old CHECK constraint
ALTER TABLE public.crm_activities DROP CONSTRAINT IF EXISTS crm_activities_check;
ALTER TABLE public.crm_activities DROP CONSTRAINT IF EXISTS crm_activities_entity_check;

-- Don't add a new constraint - allow standalone activities

-- ============================================
-- PART 2: NEW TABLES
-- ============================================

-- EMAIL_LINKS table
CREATE TABLE IF NOT EXISTS public.email_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email_id, contact_id, company_id, deal_id)
);

ALTER TABLE public.email_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email links" ON public.email_links;
CREATE POLICY "Users can view own email links"
  ON public.email_links FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own email links" ON public.email_links;
CREATE POLICY "Users can create own email links"
  ON public.email_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own email links" ON public.email_links;
CREATE POLICY "Users can delete own email links"
  ON public.email_links FOR DELETE
  USING (auth.uid() = user_id);

-- CRM_AUDIT_LOG table
CREATE TABLE IF NOT EXISTS public.crm_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  changes JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.crm_audit_log ADD CONSTRAINT audit_entity_type_check
    CHECK (entity_type IN ('contact', 'company', 'deal', 'activity', 'email_link'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.crm_audit_log ADD CONSTRAINT audit_action_check
    CHECK (action IN ('created', 'updated', 'deleted', 'restored', 'linked', 'unlinked', 'merged'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.crm_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.crm_audit_log;
CREATE POLICY "Users can view own audit logs"
  ON public.crm_audit_log FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert audit logs" ON public.crm_audit_log;
CREATE POLICY "System can insert audit logs"
  ON public.crm_audit_log FOR INSERT
  WITH CHECK (true);

-- ============================================
-- PART 3: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_contacts_email 
  ON public.contacts(user_id, LOWER(primary_email)) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_deleted 
  ON public.contacts(user_id, deleted_at) 
  WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_last_activity 
  ON public.contacts(user_id, last_activity_at DESC NULLS LAST) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_company 
  ON public.contacts(company_id) 
  WHERE deleted_at IS NULL AND company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_domain 
  ON public.companies(user_id, LOWER(domain)) 
  WHERE deleted_at IS NULL AND domain IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_name 
  ON public.companies(user_id, LOWER(name)) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_companies_deleted 
  ON public.companies(user_id, deleted_at) 
  WHERE deleted_at IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_domain_unique 
  ON public.companies(user_id, LOWER(domain)) 
  WHERE deleted_at IS NULL AND domain IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activities_company 
  ON public.crm_activities(company_id) 
  WHERE company_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_activities_calendar 
  ON public.crm_activities(user_id, calendar_event_id) 
  WHERE calendar_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activities_due_date 
  ON public.crm_activities(user_id, due_date) 
  WHERE due_date IS NOT NULL AND is_completed = FALSE AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_email_links_email ON public.email_links(email_id);
CREATE INDEX IF NOT EXISTS idx_email_links_contact ON public.email_links(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_links_company ON public.email_links(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_links_deal ON public.email_links(deal_id) WHERE deal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.crm_audit_log(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.crm_audit_log(user_id, created_at DESC);

-- ============================================
-- PART 4: AUDIT TRIGGER FUNCTIONS
-- ============================================

-- Drop old functions first to ensure fresh install
DROP FUNCTION IF EXISTS public.log_contact_audit() CASCADE;
DROP FUNCTION IF EXISTS public.log_company_audit() CASCADE;

CREATE OR REPLACE FUNCTION public.log_contact_audit()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_changes JSONB;
  v_user_id UUID;
BEGIN
  -- Use the contact's user_id instead of auth.uid() to handle migrations
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_changes := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_action := 'deleted';
    ELSIF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
      v_action := 'restored';
    ELSE
      v_action := 'updated';
    END IF;
    v_changes := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_changes := to_jsonb(OLD);
  END IF;

  INSERT INTO public.crm_audit_log (user_id, entity_type, entity_id, action, changes)
  VALUES (v_user_id, 'contact', COALESCE(NEW.id, OLD.id), v_action, v_changes);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_company_audit()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_changes JSONB;
  v_user_id UUID;
BEGIN
  -- Use the company's user_id instead of auth.uid()
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_changes := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_action := 'deleted';
    ELSIF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
      v_action := 'restored';
    ELSE
      v_action := 'updated';
    END IF;
    v_changes := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_changes := to_jsonb(OLD);
  END IF;

  INSERT INTO public.crm_audit_log (user_id, entity_type, entity_id, action, changes)
  VALUES (v_user_id, 'company', COALESCE(NEW.id, OLD.id), v_action, v_changes);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 5: TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS contact_audit_trigger ON public.contacts;
CREATE TRIGGER contact_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_audit();

DROP TRIGGER IF EXISTS company_audit_trigger ON public.companies;
CREATE TRIGGER company_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.log_company_audit();

-- ============================================
-- PART 6: UPDATE RLS POLICIES
-- ============================================

-- Update crm_activities RLS to handle new schema
DROP POLICY IF EXISTS "Users can view own activities" ON public.crm_activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.crm_activities;
DROP POLICY IF EXISTS "Users can update own activities" ON public.crm_activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON public.crm_activities;

CREATE POLICY "Users can view own activities"
  ON public.crm_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON public.crm_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON public.crm_activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON public.crm_activities FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 7: GRANTS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_links TO authenticated;
GRANT SELECT ON public.crm_audit_log TO authenticated;
GRANT INSERT ON public.crm_audit_log TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;

-- ============================================================
-- MIGRATION COMPLETE!
-- ============================================================
-- Verify with:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'crm_activities' 
-- AND column_name IN ('company_id', 'calendar_event_id');
-- ============================================================
