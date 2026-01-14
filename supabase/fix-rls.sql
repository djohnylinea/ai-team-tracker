-- Fix RLS circular dependency
-- The get_current_org_id() function needs to read from profiles,
-- but profiles has RLS that calls get_current_org_id() - circular!

-- Solution: Add a policy that allows users to read their OWN profile
-- This breaks the circular dependency since auth.uid() is always available

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());
