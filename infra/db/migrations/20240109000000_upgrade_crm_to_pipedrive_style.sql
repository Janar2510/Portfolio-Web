-- Migration: Upgrade CRM to Pipedrive-style system
-- Description: Adds comprehensive Pipedrive-inspired features: custom fields, multiple pipelines, 
-- products, leads, labels, notes, files, filters, goals, workflows, and changelog

-- ===========================================
-- CUSTOM FIELDS SYSTEM
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'organization', 'deal', 'activity', 'product')),
  field_key TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_name_et TEXT,
  field_type TEXT NOT NULL CHECK (field_type IN (
    'text', 'textarea', 'number', 'monetary', 'date', 'datetime',
    'single_select', 'multi_select', 'phone', 'email', 'url',
    'person', 'organization', 'user', 'address', 'boolean'
  )),
  options JSONB DEFAULT '[]',
  is_required BOOLEAN DEFAULT FALSE,
  is_searchable BOOLEAN DEFAULT TRUE,
  is_visible_in_list BOOLEAN DEFAULT TRUE,
  is_visible_in_detail BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  field_group TEXT DEFAULT 'custom',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entity_type, field_key)
);

-- ===========================================
-- ORGANIZATIONS (upgrade from companies)
-- ===========================================

-- Create new organizations table with enhanced fields
CREATE TABLE IF NOT EXISTS public.crm_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address JSONB DEFAULT '{}',
  label_ids UUID[] DEFAULT '{}',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  custom_fields JSONB DEFAULT '{}',
  visible_to TEXT DEFAULT 'owner' CHECK (visible_to IN ('owner', 'team', 'everyone')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- PERSONS (upgrade from contacts)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE SET NULL,
  job_title TEXT,
  emails JSONB DEFAULT '[]',  -- [{value, label, primary}]
  phones JSONB DEFAULT '[]',  -- [{value, label, primary}]
  marketing_status TEXT DEFAULT 'no_consent',
  label_ids UUID[] DEFAULT '{}',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  custom_fields JSONB DEFAULT '{}',
  visible_to TEXT DEFAULT 'owner',
  avatar_url TEXT,
  last_activity_at TIMESTAMPTZ,
  next_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- PIPELINES & STAGES (enhanced)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_et TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  deal_probability_enabled BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_et TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  rotten_days INTEGER,
  rotten_flag BOOLEAN DEFAULT TRUE,
  stage_type TEXT DEFAULT 'normal' CHECK (stage_type IN ('normal', 'won', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- DEALS (enhanced)
-- ===========================================

-- Note: We'll keep the existing deals table but add new fields via ALTER
-- For now, create a new enhanced deals table structure
-- Migration script will handle data migration

CREATE TABLE IF NOT EXISTS public.crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value DECIMAL(15,2),
  currency TEXT DEFAULT 'EUR',
  pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id),
  stage_id UUID NOT NULL REFERENCES public.crm_pipeline_stages(id),
  person_id UUID REFERENCES public.crm_persons(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'deleted')),
  won_time TIMESTAMPTZ,
  lost_time TIMESTAMPTZ,
  close_time TIMESTAMPTZ,
  lost_reason TEXT,
  expected_close_date DATE,
  probability INTEGER,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
  label_ids UUID[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  visible_to TEXT DEFAULT 'owner',
  stage_order INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  next_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

-- ===========================================
-- PRODUCTS
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  unit_price DECIMAL(15,2),
  currency TEXT DEFAULT 'EUR',
  unit TEXT DEFAULT 'unit',
  tax_percentage DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  custom_fields JSONB DEFAULT '{}',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_deal_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.crm_products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  tax_percentage DECIMAL(5,2) DEFAULT 0,
  sum DECIMAL(15,2),
  comments TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ACTIVITIES (enhanced)
-- ===========================================

-- Note: We'll enhance the existing crm_activities table
-- This creates the enhanced structure

CREATE TABLE IF NOT EXISTS public.crm_activities_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'call', 'meeting', 'task', 'deadline', 'email', 'lunch'
  )),
  subject TEXT NOT NULL,
  note TEXT,
  due_date DATE,
  due_time TIME,
  duration_minutes INTEGER,
  location TEXT,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.crm_persons(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE CASCADE,
  lead_id UUID,
  participant_ids UUID[] DEFAULT '{}',
  is_done BOOLEAN DEFAULT FALSE,
  done_at TIMESTAMPTZ,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  busy_flag BOOLEAN DEFAULT TRUE,
  reminder_minutes_before INTEGER,
  reminder_sent BOOLEAN DEFAULT FALSE,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- LEADS
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_name TEXT,
  person_name TEXT,
  organization_name TEXT,
  email TEXT,
  phone TEXT,
  expected_value DECIMAL(15,2),
  currency TEXT DEFAULT 'EUR',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  label_ids UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'archived')),
  converted_deal_id UUID REFERENCES public.crm_deals(id),
  converted_at TIMESTAMPTZ,
  converted_person_id UUID REFERENCES public.crm_persons(id),
  converted_organization_id UUID REFERENCES public.crm_organizations(id),
  custom_fields JSONB DEFAULT '{}',
  last_activity_at TIMESTAMPTZ,
  next_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- LABELS
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'organization', 'deal', 'lead')),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7B8A',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entity_type, name)
);

-- ===========================================
-- NOTES
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.crm_persons(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT FALSE,
  mentioned_user_ids UUID[] DEFAULT '{}',
  visible_to TEXT DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- FILES
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.crm_persons(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE CASCADE,
  note_id UUID REFERENCES public.crm_notes(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.crm_activities_enhanced(id) ON DELETE CASCADE,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- FILTERS
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('deal', 'person', 'organization', 'activity', 'lead', 'product')),
  name TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]',
  visible_columns TEXT[] DEFAULT '{}',
  sort_field TEXT,
  sort_direction TEXT DEFAULT 'asc',
  filter_type TEXT DEFAULT 'user' CHECK (filter_type IN ('system', 'user', 'shared')),
  is_default BOOLEAN DEFAULT FALSE,
  shared_with UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- GOALS
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('deals_won', 'deals_started', 'revenue', 'activities_completed', 'activities_added')),
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  activity_type TEXT,
  target_value DECIMAL(15,2) NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  current_value DECIMAL(15,2) DEFAULT 0,
  last_calculated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- WORKFLOWS
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_entity TEXT NOT NULL CHECK (trigger_entity IN ('deal', 'person', 'organization', 'activity', 'lead')),
  trigger_event TEXT NOT NULL CHECK (trigger_event IN (
    'created', 'updated', 'stage_changed', 'status_changed', 
    'owner_changed', 'field_changed', 'activity_completed'
  )),
  trigger_conditions JSONB DEFAULT '[]',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.crm_workflows(id) ON DELETE CASCADE,
  trigger_entity_id UUID NOT NULL,
  trigger_entity_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  actions_executed JSONB DEFAULT '[]',
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CHANGELOG
-- ===========================================

CREATE TABLE IF NOT EXISTS public.crm_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'restored', 'merged')),
  changes JSONB DEFAULT '{}',
  changed_by UUID REFERENCES public.profiles(id),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_crm_organizations_user ON public.crm_organizations(user_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_crm_persons_user ON public.crm_persons(user_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_crm_persons_org ON public.crm_persons(organization_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_crm_deals_user ON public.crm_deals(user_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_crm_deals_pipeline ON public.crm_deals(pipeline_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON public.crm_deals(stage_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_crm_deals_status ON public.crm_deals(user_id, status) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_crm_activities_user ON public.crm_activities_enhanced(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_deal ON public.crm_activities_enhanced(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_due ON public.crm_activities_enhanced(due_date) WHERE is_done = FALSE;
CREATE INDEX IF NOT EXISTS idx_crm_leads_user ON public.crm_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_changelog_entity ON public.crm_changelog(entity_type, entity_id);

-- ===========================================
-- RLS POLICIES
-- ===========================================

ALTER TABLE public.crm_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_field_definitions_policy" ON public.crm_field_definitions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_organizations_policy" ON public.crm_organizations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_persons_policy" ON public.crm_persons FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_pipelines_policy" ON public.crm_pipelines FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_stages_policy" ON public.crm_pipeline_stages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_deals_policy" ON public.crm_deals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_products_policy" ON public.crm_products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_deal_products_policy" ON public.crm_deal_products FOR ALL
  USING (deal_id IN (SELECT id FROM public.crm_deals WHERE user_id = auth.uid()));
CREATE POLICY "crm_activities_enhanced_policy" ON public.crm_activities_enhanced FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_leads_policy" ON public.crm_leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_labels_policy" ON public.crm_labels FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_notes_policy" ON public.crm_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_files_policy" ON public.crm_files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_filters_policy" ON public.crm_filters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_goals_policy" ON public.crm_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "crm_workflows_policy" ON public.crm_workflows FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- DATA MIGRATION FUNCTIONS
-- ===========================================

-- Function to migrate companies to organizations
CREATE OR REPLACE FUNCTION migrate_companies_to_organizations()
RETURNS void AS $$
BEGIN
  INSERT INTO public.crm_organizations (
    id, user_id, name, address, custom_fields, created_at, updated_at
  )
  SELECT 
    id, user_id, name, 
    COALESCE(address, '{}'::jsonb),
    COALESCE(custom_fields, '{}'::jsonb),
    created_at, updated_at
  FROM public.companies
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate contacts to persons
CREATE OR REPLACE FUNCTION migrate_contacts_to_persons()
RETURNS void AS $$
BEGIN
  INSERT INTO public.crm_persons (
    id, user_id, name, first_name, last_name, organization_id,
    job_title, emails, phones, avatar_url, custom_fields,
    last_activity_at, created_at, updated_at
  )
  SELECT 
    c.id, c.user_id,
    COALESCE(c.first_name || ' ' || COALESCE(c.last_name, ''), c.first_name) as name,
    c.first_name, c.last_name,
    c.company_id as organization_id,
    c.job_title,
    CASE WHEN c.email IS NOT NULL THEN 
      jsonb_build_array(jsonb_build_object('value', c.email, 'label', 'work', 'primary', true))
    ELSE '[]'::jsonb END as emails,
    CASE WHEN c.phone IS NOT NULL THEN 
      jsonb_build_array(jsonb_build_object('value', c.phone, 'label', 'work', 'primary', true))
    ELSE '[]'::jsonb END as phones,
    c.avatar_url,
    COALESCE(c.custom_fields, '{}'::jsonb),
    c.last_contacted_at as last_activity_at,
    c.created_at, c.updated_at
  FROM public.contacts c
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to create default pipeline from existing stages
CREATE OR REPLACE FUNCTION create_default_pipeline_from_stages()
RETURNS void AS $$
DECLARE
  new_pipeline_id UUID;
  user_record RECORD;
  stage_record RECORD;
BEGIN
  -- Create a default pipeline for each user who has stages
  FOR user_record IN SELECT DISTINCT user_id FROM public.pipeline_stages
  LOOP
    -- Get or create default pipeline
    SELECT id INTO new_pipeline_id
    FROM public.crm_pipelines
    WHERE user_id = user_record.user_id AND is_default = true
    LIMIT 1;
    
    IF new_pipeline_id IS NULL THEN
      INSERT INTO public.crm_pipelines (user_id, name, name_et, is_active, is_default, sort_order)
      VALUES (user_record.user_id, 'Sales Pipeline', 'Müügitoru', true, true, 0)
      RETURNING id INTO new_pipeline_id;
    END IF;
    
    -- Migrate stages to new pipeline
    FOR stage_record IN 
      SELECT * FROM public.pipeline_stages WHERE user_id = user_record.user_id ORDER BY sort_order
    LOOP
      INSERT INTO public.crm_pipeline_stages (
        pipeline_id, user_id, name, sort_order, probability, stage_type
      )
      VALUES (
        new_pipeline_id,
        stage_record.user_id,
        stage_record.name,
        stage_record.sort_order,
        COALESCE(stage_record.probability, 0),
        CASE 
          WHEN stage_record.is_won THEN 'won'
          WHEN stage_record.is_lost THEN 'lost'
          ELSE 'normal'
        END
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate deals to new structure
CREATE OR REPLACE FUNCTION migrate_deals_to_crm_deals()
RETURNS void AS $$
DECLARE
  deal_record RECORD;
  new_stage_id UUID;
  new_person_id UUID;
  new_org_id UUID;
BEGIN
  FOR deal_record IN 
    SELECT d.*, ps.user_id
    FROM public.deals d
    JOIN public.pipeline_stages ps ON d.stage_id = ps.id
  LOOP
    -- Find corresponding stage in new pipeline
    SELECT cps.id INTO new_stage_id
    FROM public.crm_pipeline_stages cps
    JOIN public.crm_pipelines cp ON cps.pipeline_id = cp.id
    WHERE cp.user_id = deal_record.user_id
      AND cps.name = (SELECT name FROM public.pipeline_stages WHERE id = deal_record.stage_id)
    LIMIT 1;
    
    -- Find corresponding person
    IF deal_record.contact_id IS NOT NULL THEN
      SELECT id INTO new_person_id FROM public.crm_persons WHERE id = deal_record.contact_id;
    END IF;
    
    -- Find corresponding organization
    IF deal_record.company_id IS NOT NULL THEN
      SELECT id INTO new_org_id FROM public.crm_organizations WHERE id = deal_record.company_id;
    END IF;
    
    -- Insert into new deals table
    IF new_stage_id IS NOT NULL THEN
      INSERT INTO public.crm_deals (
        id, user_id, title, value, currency, pipeline_id, stage_id,
        person_id, organization_id, status, expected_close_date,
        probability, stage_order, created_at, updated_at
      )
      VALUES (
        deal_record.id,
        deal_record.user_id,
        deal_record.title,
        deal_record.value,
        deal_record.currency,
        (SELECT pipeline_id FROM public.crm_pipeline_stages WHERE id = new_stage_id),
        new_stage_id,
        new_person_id,
        new_org_id,
        CASE 
          WHEN EXISTS (SELECT 1 FROM public.pipeline_stages WHERE id = deal_record.stage_id AND is_won = true) THEN 'won'
          WHEN EXISTS (SELECT 1 FROM public.pipeline_stages WHERE id = deal_record.stage_id AND is_lost = true) THEN 'lost'
          ELSE 'open'
        END,
        deal_record.expected_close_date,
        deal_record.probability,
        deal_record.sort_order,
        deal_record.created_at,
        deal_record.updated_at
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute migrations (commented out - run manually after verifying)
-- SELECT migrate_companies_to_organizations();
-- SELECT migrate_contacts_to_persons();
-- SELECT create_default_pipeline_from_stages();
-- SELECT migrate_deals_to_crm_deals();
