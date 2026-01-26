-- Migration: CRM Unified Schema - Phase 1
-- Description: Extends existing CRM tables with soft delete, visibility controls, 
--              email linking, calendar integration, and audit logging

-- ============================================
-- 1. EXTEND CONTACTS TABLE
-- ============================================
ALTER TABLE public.contacts 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'owner' CHECK (visibility IN ('owner','team','company')),
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS primary_email TEXT,
  ADD COLUMN IF NOT EXISTS additional_emails TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS primary_phone TEXT,
  ADD COLUMN IF NOT EXISTS additional_phones TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_activity_at TIMESTAMPTZ;

-- Migrate existing data
UPDATE public.contacts 
SET owner_user_id = user_id,
    primary_email = email,
    primary_phone = phone
WHERE owner_user_id IS NULL;

-- ============================================
-- 2. EXTEND COMPANIES TABLE
-- ============================================
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'owner' CHECK (visibility IN ('owner','team','company')),
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_activity_at TIMESTAMPTZ;

-- Migrate existing data
UPDATE public.companies 
SET owner_user_id = user_id
WHERE owner_user_id IS NULL;

-- Extract domain from website if available
UPDATE public.companies
SET domain = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(website, '^https?://', ''), '/.*$', ''))
WHERE website IS NOT NULL 
  AND domain IS NULL
  AND website ~ '^https?://';

-- ============================================
-- 3. EXTEND DEALS TABLE
-- ============================================
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'owner' CHECK (visibility IN ('owner','team','company')),
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.profiles(id);

UPDATE public.deals 
SET owner_user_id = user_id
WHERE owner_user_id IS NULL;

-- ============================================
-- 4. EXTEND CRM_ACTIVITIES TABLE
-- ============================================
ALTER TABLE public.crm_activities
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS calendar_event_id TEXT,
  ADD COLUMN IF NOT EXISTS participants JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Remove old CHECK constraint that required contact_id OR deal_id
ALTER TABLE public.crm_activities DROP CONSTRAINT IF EXISTS crm_activities_check;

-- Add new constraint: at least one of contact_id, deal_id, or company_id must be set
ALTER TABLE public.crm_activities 
  ADD CONSTRAINT crm_activities_entity_check 
  CHECK (contact_id IS NOT NULL OR deal_id IS NOT NULL OR company_id IS NOT NULL);

-- ============================================
-- 5. CREATE EMAIL_LINKS TABLE
-- ============================================
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

-- Enable RLS
ALTER TABLE public.email_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own email links"
  ON public.email_links
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own email links"
  ON public.email_links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own email links"
  ON public.email_links
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. CREATE CRM_AUDIT_LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.crm_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'company', 'deal', 'activity', 'email_link')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'restored', 'linked', 'unlinked', 'merged')),
  changes JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.crm_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own audit logs"
  ON public.crm_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert audit logs (handled by triggers)
CREATE POLICY "System can insert audit logs"
  ON public.crm_audit_log
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 7. CREATE INDEXES
-- ============================================

-- Contacts indexes
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

-- Companies indexes
CREATE INDEX IF NOT EXISTS idx_companies_domain 
  ON public.companies(user_id, LOWER(domain)) 
  WHERE deleted_at IS NULL AND domain IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_name 
  ON public.companies(user_id, LOWER(name)) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_companies_deleted 
  ON public.companies(user_id, deleted_at) 
  WHERE deleted_at IS NOT NULL;

-- Enforce domain uniqueness per user (when domain is set)
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_domain_unique 
  ON public.companies(user_id, LOWER(domain)) 
  WHERE deleted_at IS NULL AND domain IS NOT NULL;

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_company 
  ON public.crm_activities(company_id) 
  WHERE company_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_activities_calendar 
  ON public.crm_activities(user_id, calendar_event_id) 
  WHERE calendar_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activities_due_date 
  ON public.crm_activities(user_id, due_date) 
  WHERE due_date IS NOT NULL AND is_completed = FALSE AND deleted_at IS NULL;

-- Email links indexes
CREATE INDEX IF NOT EXISTS idx_email_links_email 
  ON public.email_links(email_id);

CREATE INDEX IF NOT EXISTS idx_email_links_contact 
  ON public.email_links(contact_id) 
  WHERE contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_links_company 
  ON public.email_links(company_id) 
  WHERE company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_links_deal 
  ON public.email_links(deal_id) 
  WHERE deal_id IS NOT NULL;

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_entity 
  ON public.crm_audit_log(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_user 
  ON public.crm_audit_log(user_id, created_at DESC);

-- ============================================
-- 8. CREATE AUDIT TRIGGER FUNCTIONS
-- ============================================

-- Function to log contact changes
CREATE OR REPLACE FUNCTION public.log_contact_audit()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_changes JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_changes := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if this is a soft delete
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_action := 'deleted';
    ELSIF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
      v_action := 'restored';
    ELSE
      v_action := 'updated';
    END IF;
    
    -- Calculate changes
    v_changes := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_changes := to_jsonb(OLD);
  END IF;

  INSERT INTO public.crm_audit_log (user_id, entity_type, entity_id, action, changes)
  VALUES (auth.uid(), 'contact', COALESCE(NEW.id, OLD.id), v_action, v_changes);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log company changes
CREATE OR REPLACE FUNCTION public.log_company_audit()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_changes JSONB;
BEGIN
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
    
    v_changes := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_changes := to_jsonb(OLD);
  END IF;

  INSERT INTO public.crm_audit_log (user_id, entity_type, entity_id, action, changes)
  VALUES (auth.uid(), 'company', COALESCE(NEW.id, OLD.id), v_action, v_changes);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. CREATE TRIGGERS
-- ============================================

-- Contact audit triggers
DROP TRIGGER IF EXISTS contact_audit_trigger ON public.contacts;
CREATE TRIGGER contact_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_audit();

-- Company audit triggers
DROP TRIGGER IF EXISTS company_audit_trigger ON public.companies;
CREATE TRIGGER company_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.log_company_audit();

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_links TO authenticated;
GRANT SELECT ON public.crm_audit_log TO authenticated;
GRANT INSERT ON public.crm_audit_log TO service_role;
