-- Seed default portfolio categories (EKA, AGT, TQA, DMI, PADS)
-- Run this in Supabase SQL Editor

-- First, get the org_id (assuming single org setup)
DO $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get the first organization
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found. Please run seed.ts first.';
  END IF;
  
  -- Insert categories if they don't already exist
  INSERT INTO portfolio_categories (org_id, key, name, description)
  VALUES 
    (v_org_id, 'EKA', 'Expert Knowledge Assistants', 'RAG chatbots for instant access to expert knowledge (rules, policies, procedures)'),
    (v_org_id, 'AGT', 'Agents & Workflow Automation', 'AI that takes actions, moves work forward, orchestrates steps across systems'),
    (v_org_id, 'TQA', 'Testing & Quality Automation', 'AI-assisted tools that test systems, bots, and data to catch issues earlier'),
    (v_org_id, 'DMI', 'Data & Migration Intelligence', 'AI to understand, cleanse, and transform data during implementations'),
    (v_org_id, 'PADS', 'Predictive Analytics & Decision Support', 'Data and AI to improve how we assess options and make decisions')
  ON CONFLICT (org_id, key) DO NOTHING;
  
  RAISE NOTICE 'Portfolio categories seeded successfully for org %', v_org_id;
END $$;

-- Verify the categories were added
SELECT key, name, description FROM portfolio_categories ORDER BY key;
