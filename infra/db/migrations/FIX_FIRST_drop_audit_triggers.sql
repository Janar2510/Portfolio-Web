-- Quick fix: Drop old audit triggers and recreate with proper user_id handling
-- Run this FIRST, then re-run the full consolidated script

-- Step 1: Drop old triggers to stop errors immediately
DROP TRIGGER IF EXISTS contact_audit_trigger ON public.contacts;
DROP TRIGGER IF EXISTS company_audit_trigger ON public.companies;

-- Step 2: Drop old functions
DROP FUNCTION IF EXISTS public.log_contact_audit() CASCADE;
DROP FUNCTION IF EXISTS public.log_company_audit() CASCADE;

-- Step 3: Recreate functions with proper logic
CREATE OR REPLACE FUNCTION public.log_contact_audit()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_changes JSONB;
  v_user_id UUID;
BEGIN
  -- Use the contact's user_id from the record itself
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  
  -- Skip if no user_id (shouldn't happen but prevents errors)
  IF v_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
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
  -- Use the company's user_id from the record itself
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  
  -- Skip if no user_id
  IF v_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
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

-- Step 4: Recreate triggers
CREATE TRIGGER contact_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_contact_audit();

CREATE TRIGGER company_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.log_company_audit();

-- Done! Now re-run the full consolidated script
