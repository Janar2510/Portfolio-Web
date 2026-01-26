-- Fix RLS policies for deals table
-- Ensure RLS is enabled
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can insert own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can delete own deals" ON public.deals;

-- Re-create policies
CREATE POLICY "Users can view own deals"
  ON public.deals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deals"
  ON public.deals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals"
  ON public.deals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals"
  ON public.deals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Ensure authenticated role has permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
