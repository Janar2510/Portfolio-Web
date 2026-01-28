-- Fix RLS policies for contacts table to resolve 403 errors
-- Ensure RLS is enabled
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;

-- Re-create policies with correct definition
CREATE POLICY "Users can view own contacts"
  ON public.contacts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON public.contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON public.contacts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON public.contacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Ensure authenticated role has permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
