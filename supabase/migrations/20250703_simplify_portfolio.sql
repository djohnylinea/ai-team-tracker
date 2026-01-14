-- Migration: Simplify Portfolio System
-- Remove L1/L2/L3 levels, make portfolio categories org-editable like tools

-- Step 1: Drop dependent objects first
DROP TABLE IF EXISTS portfolio_ratings CASCADE;
DROP TABLE IF EXISTS portfolio_levels CASCADE;
DROP TABLE IF EXISTS portfolio_families CASCADE;
DROP TYPE IF EXISTS portfolio_level CASCADE;

-- Step 2: Create new portfolio_categories table (org-level catalog, like awareness_areas but per-org)
CREATE TABLE portfolio_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, key)
);

-- Step 3: Create simplified portfolio_ratings (no levels, just category + rating 0-5)
CREATE TABLE portfolio_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES portfolio_categories(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, category_id)
);

-- Step 4: Create indexes
CREATE INDEX idx_portfolio_categories_org ON portfolio_categories(org_id);
CREATE INDEX idx_portfolio_ratings_member ON portfolio_ratings(member_id);
CREATE INDEX idx_portfolio_ratings_category ON portfolio_ratings(category_id);

-- Step 5: Enable RLS
ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_ratings ENABLE ROW LEVEL SECURITY;

-- Step 6: Create permissive policies (local supervisor mode)
CREATE POLICY "portfolio_categories_select" ON portfolio_categories FOR SELECT USING (true);
CREATE POLICY "portfolio_categories_insert" ON portfolio_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "portfolio_categories_update" ON portfolio_categories FOR UPDATE USING (true);
CREATE POLICY "portfolio_categories_delete" ON portfolio_categories FOR DELETE USING (true);

CREATE POLICY "portfolio_ratings_select" ON portfolio_ratings FOR SELECT USING (true);
CREATE POLICY "portfolio_ratings_insert" ON portfolio_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "portfolio_ratings_update" ON portfolio_ratings FOR UPDATE USING (true);
CREATE POLICY "portfolio_ratings_delete" ON portfolio_ratings FOR DELETE USING (true);

-- Step 7: Create upsert function for ratings
CREATE OR REPLACE FUNCTION upsert_portfolio_rating(
  p_org_id UUID,
  p_member_id UUID,
  p_category_id UUID,
  p_rating INTEGER
)
RETURNS portfolio_ratings AS $$
DECLARE
  v_rating portfolio_ratings;
BEGIN
  INSERT INTO portfolio_ratings (org_id, member_id, category_id, rating, updated_at)
  VALUES (p_org_id, p_member_id, p_category_id, p_rating, NOW())
  ON CONFLICT (member_id, category_id)
  DO UPDATE SET rating = p_rating, updated_at = NOW()
  RETURNING * INTO v_rating;
  
  RETURN v_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
