
-- Diagnostic function to check auth state from within Postgres
CREATE OR REPLACE FUNCTION public.get_auth_diag()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'auth_uid', auth.uid(),
    'role', current_role,
    'jwt_claims', auth.jwt(),
    'is_authenticated', (auth.role() = 'authenticated')
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Robust profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_display_name TEXT;
  profile_locale TEXT;
BEGIN
  -- Extract and sanitize display name
  profile_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name', 
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Extract and sanitize locale (ensure it's one of the allowed values)
  profile_locale := COALESCE(NEW.raw_user_meta_data->>'locale', 'en');
  IF profile_locale NOT IN ('en', 'et') THEN
    profile_locale := 'en';
  END IF;

  -- Insert profile with safety
  BEGIN
    INSERT INTO public.profiles (id, display_name, locale)
    VALUES (NEW.id, profile_display_name, profile_locale)
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Insert settings with safety
  BEGIN
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create settings for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger to be sure
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure permissions
GRANT EXECUTE ON FUNCTION public.get_auth_diag() TO authenticated, anon;
