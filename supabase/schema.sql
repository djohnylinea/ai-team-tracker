-- =============================================
-- AI Team Work Tracker - Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'MEMBER', 'VIEWER');
CREATE TYPE project_type AS ENUM ('AI Use Case', 'AI Community Center', 'Other AI Initiative');
CREATE TYPE project_status AS ENUM ('Active', 'Completed');
CREATE TYPE reuse_potential AS ENUM ('Internal', 'External');
CREATE TYPE event_type AS ENUM ('Speaker', 'Attended');
CREATE TYPE time_off_type AS ENUM ('Vacation', 'Conference', 'Sick Leave', 'Personal', 'Other');
CREATE TYPE portfolio_level AS ENUM ('L1', 'L2', 'L3');

-- =============================================
-- CORE TABLES
-- =============================================

-- Organizations (multi-tenant support)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'VIEWER',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  avatar_initials TEXT NOT NULL,
  linked_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DATA TABLES
-- =============================================

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type project_type NOT NULL,
  source TEXT,
  reusable reuse_potential NOT NULL DEFAULT 'Internal',
  status project_status NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagements
CREATE TABLE engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  client TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  allocation_percent INTEGER NOT NULL CHECK (allocation_percent >= 0 AND allocation_percent <= 200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Off
CREATE TABLE time_off (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  type time_off_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type event_type NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REFERENCE TABLES (seeded data)
-- =============================================

-- Tool Categories
CREATE TABLE tool_categories (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT
);

-- Tools (org-wide)
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_key TEXT NOT NULL REFERENCES tool_categories(key) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, category_key, tool_name)
);

-- Tool Ratings (per member)
CREATE TABLE tool_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, tool_id)
);

-- Portfolio Families
CREATE TABLE portfolio_families (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Portfolio Levels (reference)
CREATE TABLE portfolio_levels (
  level portfolio_level PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL
);

-- Portfolio Ratings (per member)
CREATE TABLE portfolio_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  family_key TEXT NOT NULL REFERENCES portfolio_families(key) ON DELETE CASCADE,
  level portfolio_level NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, family_key, level)
);

-- Awareness Areas
CREATE TABLE awareness_areas (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT
);

-- Awareness Ratings (per member)
CREATE TABLE awareness_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  area_key TEXT NOT NULL REFERENCES awareness_areas(key) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, area_key)
);

-- =============================================
-- AUDIT LOG (optional but recommended)
-- =============================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  actor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_table TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_profiles_org ON profiles(org_id);
CREATE INDEX idx_team_members_org ON team_members(org_id);
CREATE INDEX idx_team_members_linked ON team_members(linked_profile_id);
CREATE INDEX idx_projects_org ON projects(org_id);
CREATE INDEX idx_projects_member ON projects(member_id);
CREATE INDEX idx_engagements_org ON engagements(org_id);
CREATE INDEX idx_engagements_member ON engagements(member_id);
CREATE INDEX idx_time_off_org ON time_off(org_id);
CREATE INDEX idx_time_off_member ON time_off(member_id);
CREATE INDEX idx_time_off_dates ON time_off(start_date, end_date);
CREATE INDEX idx_events_org ON events(org_id);
CREATE INDEX idx_events_member ON events(member_id);
CREATE INDEX idx_tools_org ON tools(org_id);
CREATE INDEX idx_tool_ratings_member ON tool_ratings(member_id);
CREATE INDEX idx_tool_ratings_tool ON tool_ratings(tool_id);
CREATE INDEX idx_portfolio_ratings_member ON portfolio_ratings(member_id);
CREATE INDEX idx_awareness_ratings_member ON awareness_ratings(member_id);
CREATE INDEX idx_audit_log_org ON audit_log(org_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- =============================================
-- SEED REFERENCE DATA
-- =============================================

-- Tool Categories
INSERT INTO tool_categories (key, title, description) VALUES
  ('noCodeMinimal', 'AI No Code / Minimal Configuration Tools', 'Basic AI tools requiring minimal setup (e.g., ChatGPT, Claude, Gemini, Scribe, ElevenLabs)'),
  ('noCodeMore', 'AI No Code / More Configuration Tools', 'AI tools with extended customization (e.g., Custom GPTs, Copilot Studio, Lovable, Cursor, Bolt)'),
  ('lowCode', 'AI Low Code / Advanced Configuration', 'Workflow automation and integration platforms (e.g., AirOps, n8n, Make.com)'),
  ('proCode', 'AI Pro-Code Tools', 'Enterprise AI development platforms (e.g., Azure AI, Amazon Bedrock, Google Vertex)');

-- Portfolio Families
INSERT INTO portfolio_families (key, name, description) VALUES
  ('EKA', 'Expert Knowledge Assistants', 'RAG chatbots for instant access to expert knowledge (rules, policies, procedures)'),
  ('AGT', 'Agents & Workflow Automation', 'AI that takes actions, moves work forward, orchestrates steps across systems'),
  ('TQA', 'Testing & Quality Automation', 'AI-assisted tools that test systems, bots, and data to catch issues earlier'),
  ('DMI', 'Data & Migration Intelligence', 'AI to understand, cleanse, and transform data during implementations'),
  ('PADS', 'Predictive Analytics & Decision Support', 'Data and AI to improve how we assess options and make decisions');

-- Portfolio Levels
INSERT INTO portfolio_levels (level, name, description, color) VALUES
  ('L1', 'Level 1', 'Basic/Standard implementation', '#22c55e'),
  ('L2', 'Level 2', 'Advanced implementation', '#3b82f6'),
  ('L3', 'Level 3', 'Enterprise/Expert implementation', '#8b5cf6');

-- Awareness Areas
INSERT INTO awareness_areas (key, label, description) VALUES
  ('security', 'AI Security Concerns', 'Understanding and monitoring AI security risks'),
  ('ethics', 'AI Ethics & Environmental Footprint', 'Ethical AI practices and sustainability awareness'),
  ('policies', 'Governmental AI Policies', 'Knowledge of regulatory frameworks and compliance'),
  ('trends', 'AI News, Trends & Insights', 'Staying current with industry developments'),
  ('sales', 'Sales Team AI Support', 'Ability to support sales with AI content'),
  ('speaking', 'Conference/Webinar Speaking', 'Public speaking and presentation abilities');
