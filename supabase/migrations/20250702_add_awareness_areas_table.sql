-- Migration: Ensure awareness_areas table has default data
-- Run this in your Supabase SQL Editor
-- NOTE: The awareness_areas table already exists with structure:
--   key TEXT PRIMARY KEY, label TEXT, description TEXT

-- Ensure default awareness areas exist (these are shared across all orgs)
INSERT INTO public.awareness_areas (key, label, description)
VALUES
  ('security', 'AI Security', 'Understanding of AI security risks and mitigations'),
  ('ethics', 'AI Ethics', 'Knowledge of ethical considerations in AI use'),
  ('policies', 'Company AI Policies', 'Familiarity with internal AI usage guidelines'),
  ('trends', 'AI Industry Trends', 'Awareness of latest AI developments'),
  ('sales', 'AI for Sales/Client Work', 'Applying AI to sales and client interactions'),
  ('speaking', 'AI Thought Leadership', 'Ability to speak about AI at events')
ON CONFLICT (key) DO NOTHING;
