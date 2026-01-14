-- =============================================
-- AI Team Work Tracker - RPC Functions
-- =============================================
-- Run this AFTER schema.sql and policies.sql

-- =============================================
-- CREATE TOOL AND SEED RATINGS FOR ALL MEMBERS
-- =============================================
-- This function creates a new tool and automatically creates
-- ratings for all team members in the organization with a default rating

CREATE OR REPLACE FUNCTION create_tool_and_seed_ratings(
  p_org_id UUID,
  p_category_key TEXT,
  p_tool_name TEXT,
  p_default_rating INTEGER DEFAULT 1
)
RETURNS tools AS $$
DECLARE
  v_tool tools;
  v_current_role user_role;
BEGIN
  -- Check permissions
  SELECT role INTO v_current_role FROM profiles WHERE id = auth.uid();
  
  IF v_current_role NOT IN ('ADMIN', 'MANAGER') THEN
    RAISE EXCEPTION 'Only ADMIN or MANAGER can create tools';
  END IF;
  
  -- Verify org_id matches current user's org
  IF p_org_id != get_current_org_id() THEN
    RAISE EXCEPTION 'Cannot create tools in another organization';
  END IF;
  
  -- Validate rating
  IF p_default_rating < 1 OR p_default_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  
  -- Insert the tool
  INSERT INTO tools (org_id, category_key, tool_name)
  VALUES (p_org_id, p_category_key, p_tool_name)
  RETURNING * INTO v_tool;
  
  -- Create ratings for all team members in the org
  INSERT INTO tool_ratings (org_id, member_id, tool_id, rating)
  SELECT 
    p_org_id,
    tm.id,
    v_tool.id,
    p_default_rating
  FROM team_members tm
  WHERE tm.org_id = p_org_id;
  
  RETURN v_tool;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DELETE TOOL AND ALL RELATED RATINGS
-- =============================================
-- This function deletes a tool and all its ratings (cascade)

CREATE OR REPLACE FUNCTION delete_tool_and_ratings(
  p_org_id UUID,
  p_tool_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_role user_role;
BEGIN
  -- Check permissions
  SELECT role INTO v_current_role FROM profiles WHERE id = auth.uid();
  
  IF v_current_role NOT IN ('ADMIN', 'MANAGER') THEN
    RAISE EXCEPTION 'Only ADMIN or MANAGER can delete tools';
  END IF;
  
  -- Verify org_id matches current user's org
  IF p_org_id != get_current_org_id() THEN
    RAISE EXCEPTION 'Cannot delete tools in another organization';
  END IF;
  
  -- Verify tool belongs to this org
  IF NOT EXISTS (SELECT 1 FROM tools WHERE id = p_tool_id AND org_id = p_org_id) THEN
    RAISE EXCEPTION 'Tool not found or does not belong to this organization';
  END IF;
  
  -- Delete ratings first (should cascade, but being explicit)
  DELETE FROM tool_ratings WHERE tool_id = p_tool_id AND org_id = p_org_id;
  
  -- Delete the tool
  DELETE FROM tools WHERE id = p_tool_id AND org_id = p_org_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HANDLE NEW USER SIGNUP
-- =============================================
-- Trigger function to create profile and optionally bootstrap org

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_is_first_user BOOLEAN;
BEGIN
  -- Check if this is the first user (no organizations exist)
  SELECT NOT EXISTS (SELECT 1 FROM organizations) INTO v_is_first_user;
  
  IF v_is_first_user THEN
    -- Create the first organization
    INSERT INTO organizations (name) 
    VALUES ('Default Organization')
    RETURNING id INTO v_org_id;
    
    -- Create profile as ADMIN
    INSERT INTO profiles (id, org_id, email, full_name, role)
    VALUES (
      NEW.id,
      v_org_id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      'ADMIN'
    );
  ELSE
    -- Get the first organization (single-org MVP)
    SELECT id INTO v_org_id FROM organizations LIMIT 1;
    
    -- Create profile as VIEWER (admin can upgrade later)
    INSERT INTO profiles (id, org_id, email, full_name, role)
    VALUES (
      NEW.id,
      v_org_id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      'VIEWER'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- UPSERT TOOL RATING
-- =============================================
-- Update or insert a tool rating for a member

CREATE OR REPLACE FUNCTION upsert_tool_rating(
  p_member_id UUID,
  p_tool_id UUID,
  p_rating INTEGER
)
RETURNS tool_ratings AS $$
DECLARE
  v_rating tool_ratings;
  v_org_id UUID;
BEGIN
  -- Validate rating
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  
  -- Get org_id from member
  SELECT org_id INTO v_org_id FROM team_members WHERE id = p_member_id;
  
  -- Check permission
  IF NOT can_edit_member(p_member_id) AND get_current_role() NOT IN ('ADMIN', 'MANAGER') THEN
    RAISE EXCEPTION 'Not authorized to edit this member''s ratings';
  END IF;
  
  -- Upsert
  INSERT INTO tool_ratings (org_id, member_id, tool_id, rating)
  VALUES (v_org_id, p_member_id, p_tool_id, p_rating)
  ON CONFLICT (member_id, tool_id)
  DO UPDATE SET rating = p_rating
  RETURNING * INTO v_rating;
  
  RETURN v_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UPSERT PORTFOLIO RATING
-- =============================================

CREATE OR REPLACE FUNCTION upsert_portfolio_rating(
  p_member_id UUID,
  p_family_key TEXT,
  p_level portfolio_level,
  p_rating INTEGER
)
RETURNS portfolio_ratings AS $$
DECLARE
  v_rating portfolio_ratings;
  v_org_id UUID;
BEGIN
  -- Validate rating
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  
  -- Get org_id from member
  SELECT org_id INTO v_org_id FROM team_members WHERE id = p_member_id;
  
  -- Check permission
  IF NOT can_edit_member(p_member_id) AND get_current_role() NOT IN ('ADMIN', 'MANAGER') THEN
    RAISE EXCEPTION 'Not authorized to edit this member''s ratings';
  END IF;
  
  -- Upsert
  INSERT INTO portfolio_ratings (org_id, member_id, family_key, level, rating)
  VALUES (v_org_id, p_member_id, p_family_key, p_level, p_rating)
  ON CONFLICT (member_id, family_key, level)
  DO UPDATE SET rating = p_rating
  RETURNING * INTO v_rating;
  
  RETURN v_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UPSERT AWARENESS RATING
-- =============================================

CREATE OR REPLACE FUNCTION upsert_awareness_rating(
  p_member_id UUID,
  p_area_key TEXT,
  p_rating INTEGER
)
RETURNS awareness_ratings AS $$
DECLARE
  v_rating awareness_ratings;
  v_org_id UUID;
BEGIN
  -- Validate rating
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  
  -- Get org_id from member
  SELECT org_id INTO v_org_id FROM team_members WHERE id = p_member_id;
  
  -- Check permission
  IF NOT can_edit_member(p_member_id) AND get_current_role() NOT IN ('ADMIN', 'MANAGER') THEN
    RAISE EXCEPTION 'Not authorized to edit this member''s ratings';
  END IF;
  
  -- Upsert
  INSERT INTO awareness_ratings (org_id, member_id, area_key, rating)
  VALUES (v_org_id, p_member_id, p_area_key, p_rating)
  ON CONFLICT (member_id, area_key)
  DO UPDATE SET rating = p_rating
  RETURNING * INTO v_rating;
  
  RETURN v_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
