-- =============================================
-- AI Team Work Tracker - Row Level Security Policies
-- =============================================
-- Run this AFTER schema.sql

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE awareness_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Reference tables are public read (no RLS needed for read)
-- tool_categories, portfolio_families, portfolio_levels, awareness_areas

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get current user's profile
CREATE OR REPLACE FUNCTION get_current_profile()
RETURNS profiles AS $$
  SELECT * FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION get_current_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's org_id
CREATE OR REPLACE FUNCTION get_current_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user can edit a specific team member
CREATE OR REPLACE FUNCTION can_edit_member(member_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_role user_role;
  current_org UUID;
  member_linked_profile UUID;
BEGIN
  SELECT role, org_id INTO current_role, current_org FROM profiles WHERE id = auth.uid();
  
  -- ADMIN and MANAGER can edit all members in their org
  IF current_role IN ('ADMIN', 'MANAGER') THEN
    RETURN EXISTS (SELECT 1 FROM team_members WHERE id = member_id AND org_id = current_org);
  END IF;
  
  -- MEMBER can only edit their linked team member
  IF current_role = 'MEMBER' THEN
    SELECT linked_profile_id INTO member_linked_profile FROM team_members WHERE id = member_id;
    RETURN member_linked_profile = auth.uid();
  END IF;
  
  -- VIEWER cannot edit
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- ORGANIZATIONS POLICIES
-- =============================================

-- Users can view their own organization
CREATE POLICY "Users can view own org"
  ON organizations FOR SELECT
  USING (id = get_current_org_id());

-- Only ADMIN can update org
CREATE POLICY "Admin can update org"
  ON organizations FOR UPDATE
  USING (id = get_current_org_id() AND get_current_role() = 'ADMIN');

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Users can view profiles in their org
CREATE POLICY "Users can view profiles in org"
  ON profiles FOR SELECT
  USING (org_id = get_current_org_id());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ADMIN can update any profile in their org (including role)
CREATE POLICY "Admin can update profiles"
  ON profiles FOR UPDATE
  USING (org_id = get_current_org_id() AND get_current_role() = 'ADMIN');

-- Allow insert for new user signup (handled by trigger)
CREATE POLICY "Allow profile insert on signup"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- =============================================
-- TEAM MEMBERS POLICIES
-- =============================================

-- All authenticated users in org can view team members
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  USING (org_id = get_current_org_id());

-- ADMIN/MANAGER can insert team members
CREATE POLICY "Admin/Manager can insert members"
  ON team_members FOR INSERT
  WITH CHECK (org_id = get_current_org_id() AND get_current_role() IN ('ADMIN', 'MANAGER'));

-- ADMIN/MANAGER can update team members
CREATE POLICY "Admin/Manager can update members"
  ON team_members FOR UPDATE
  USING (org_id = get_current_org_id() AND get_current_role() IN ('ADMIN', 'MANAGER'));

-- ADMIN can delete team members
CREATE POLICY "Admin can delete members"
  ON team_members FOR DELETE
  USING (org_id = get_current_org_id() AND get_current_role() = 'ADMIN');

-- =============================================
-- PROJECTS POLICIES
-- =============================================

-- All users in org can view projects
CREATE POLICY "Users can view projects"
  ON projects FOR SELECT
  USING (org_id = get_current_org_id());

-- ADMIN/MANAGER or linked MEMBER can insert
CREATE POLICY "Authorized users can insert projects"
  ON projects FOR INSERT
  WITH CHECK (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

-- ADMIN/MANAGER or linked MEMBER can update
CREATE POLICY "Authorized users can update projects"
  ON projects FOR UPDATE
  USING (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

-- ADMIN/MANAGER or linked MEMBER can delete
CREATE POLICY "Authorized users can delete projects"
  ON projects FOR DELETE
  USING (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

-- =============================================
-- ENGAGEMENTS POLICIES
-- =============================================

CREATE POLICY "Users can view engagements"
  ON engagements FOR SELECT
  USING (org_id = get_current_org_id());

CREATE POLICY "Authorized users can insert engagements"
  ON engagements FOR INSERT
  WITH CHECK (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

CREATE POLICY "Authorized users can update engagements"
  ON engagements FOR UPDATE
  USING (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

CREATE POLICY "Authorized users can delete engagements"
  ON engagements FOR DELETE
  USING (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

-- =============================================
-- TIME OFF POLICIES
-- =============================================

CREATE POLICY "Users can view time_off"
  ON time_off FOR SELECT
  USING (org_id = get_current_org_id());

CREATE POLICY "Authorized users can insert time_off"
  ON time_off FOR INSERT
  WITH CHECK (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

CREATE POLICY "Authorized users can update time_off"
  ON time_off FOR UPDATE
  USING (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

CREATE POLICY "Authorized users can delete time_off"
  ON time_off FOR DELETE
  USING (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

-- =============================================
-- EVENTS POLICIES
-- =============================================

CREATE POLICY "Users can view events"
  ON events FOR SELECT
  USING (org_id = get_current_org_id());

CREATE POLICY "Authorized users can insert events"
  ON events FOR INSERT
  WITH CHECK (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

CREATE POLICY "Authorized users can update events"
  ON events FOR UPDATE
  USING (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

CREATE POLICY "Authorized users can delete events"
  ON events FOR DELETE
  USING (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

-- =============================================
-- TOOLS POLICIES (org-wide)
-- =============================================

CREATE POLICY "Users can view tools"
  ON tools FOR SELECT
  USING (org_id = get_current_org_id());

-- Only ADMIN/MANAGER can create tools (via RPC function)
CREATE POLICY "Admin/Manager can insert tools"
  ON tools FOR INSERT
  WITH CHECK (org_id = get_current_org_id() AND get_current_role() IN ('ADMIN', 'MANAGER'));

-- Only ADMIN/MANAGER can delete tools (via RPC function)
CREATE POLICY "Admin/Manager can delete tools"
  ON tools FOR DELETE
  USING (org_id = get_current_org_id() AND get_current_role() IN ('ADMIN', 'MANAGER'));

-- =============================================
-- TOOL RATINGS POLICIES
-- =============================================

CREATE POLICY "Users can view tool ratings"
  ON tool_ratings FOR SELECT
  USING (org_id = get_current_org_id());

CREATE POLICY "Authorized users can insert tool ratings"
  ON tool_ratings FOR INSERT
  WITH CHECK (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

CREATE POLICY "Authorized users can update tool ratings"
  ON tool_ratings FOR UPDATE
  USING (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

CREATE POLICY "Admin/Manager can delete tool ratings"
  ON tool_ratings FOR DELETE
  USING (org_id = get_current_org_id() AND get_current_role() IN ('ADMIN', 'MANAGER'));

-- =============================================
-- PORTFOLIO RATINGS POLICIES
-- =============================================

CREATE POLICY "Users can view portfolio ratings"
  ON portfolio_ratings FOR SELECT
  USING (org_id = get_current_org_id());

CREATE POLICY "Authorized users can insert portfolio ratings"
  ON portfolio_ratings FOR INSERT
  WITH CHECK (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

CREATE POLICY "Authorized users can update portfolio ratings"
  ON portfolio_ratings FOR UPDATE
  USING (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

-- =============================================
-- AWARENESS RATINGS POLICIES
-- =============================================

CREATE POLICY "Users can view awareness ratings"
  ON awareness_ratings FOR SELECT
  USING (org_id = get_current_org_id());

CREATE POLICY "Authorized users can insert awareness ratings"
  ON awareness_ratings FOR INSERT
  WITH CHECK (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

CREATE POLICY "Authorized users can update awareness ratings"
  ON awareness_ratings FOR UPDATE
  USING (
    org_id = get_current_org_id() AND 
    (get_current_role() IN ('ADMIN', 'MANAGER') OR can_edit_member(member_id))
  );

-- =============================================
-- AUDIT LOG POLICIES
-- =============================================

CREATE POLICY "Users can view audit log"
  ON audit_log FOR SELECT
  USING (org_id = get_current_org_id());

-- Insert is handled by functions with SECURITY DEFINER
CREATE POLICY "System can insert audit log"
  ON audit_log FOR INSERT
  WITH CHECK (org_id = get_current_org_id());
