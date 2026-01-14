# AI Team Work Tracker - Prototype UI/Behavior Spec

## DESIGN TOKENS
Use this color palette consistently:
- primary: #123A43
- secondary: #5D7D87
- accent: #8795B0
- copper: #B06C50
- light: #CEDADD

Icons used (lucide-react): Users, BarChart3, Calendar, Award, BookOpen, Shield, Mic, FileDown, LogOut, ChevronDown, Plus, Edit2, Trash2, Save, ChevronRight, X

## APP SCREENS

### 1) Login screen
- Full-page centered card on a gradient background: linear-gradient(135deg, primary 0%, secondary 100%)
- Card includes:
  - square logo area with Users icon on primary background
  - Title: "AI Team Tracker"
  - Subtitle: "Authorized access only"
  - Email input (placeholder "Email")
  - Password input (placeholder "Password")
  - "Sign In" button (primary background)
  - Footer text: "Protected by SSO / Azure AD integration"
- In real app: implement Supabase Auth login here.
- After login redirect to /dashboard.

### 2) Main App Shell
- Header (top bar):
  - Left: small square logo (primary) + Users icon, plus title: "AI Team Work Tracker" and subtitle "Team Performance & Skills Management"
  - Right:
    - Team member selector dropdown (shows member names)
    - "Export" button (copper background) toggles export options bar
    - Logout icon button (LogOut)
- Export options bar (appears under header when toggled):
  Background: copper with ~15% opacity tint; border copper
  Buttons:
   - "<SelectedMemberName> CSV" => downloads individual CSV
   - "Team CSV" => downloads team CSV
   - "<SelectedMemberName> Report" => opens report modal in individual mode
   - "Team Report" => opens report modal in team mode

- Sidebar (left nav):
  - Top: member card (gradient light->accent tint), circle avatar initials, member name, member role
  - Tabs (buttons):
    Overview (BarChart3)
    Projects (BookOpen)
    Skills & Tools (Award)
    Awareness (Shield)
    Engagements (Calendar)
    Events (Mic)
  - Bottom special tab: "Team Dashboard" (BarChart3) in copper theme
- Main content area:
  - Page title:
    - If Team Dashboard: "Team Dashboard"
    - Else: "<Member Name> - <Active Tab Label>"
  - Edit Mode button:
    - Appears on tabs except Overview and Team Dashboard
    - Toggle button:
      - When OFF: label "Edit Mode" with Edit icon; background secondary
      - When ON: label "Save Changes" with Save icon; background copper
    - In real app, you may autosave changes, but keep the toggle semantics:
      - OFF = read-only
      - ON = editable controls enabled

## TABS AND CONTENT DETAILS

### A) Overview tab
Layout: grid with 3 summary cards (white, rounded, subtle border accent)
1) Active Projects:
 - Large number = count of projects where status == "Active"
 - subtext "<total> total projects"
2) Current Allocation:
 - Large number = sum of engagement allocation_percent
 - color copper
 - subtext "<count> client engagements"
3) Portfolio Avg:
 - Large number = average rating across all portfolio families and levels (L1/L2/L3), 1 decimal
 - color accent
 - subtext "across all levels"

Then a big card: "AI Solution Portfolio (5 Families × 3 Levels)"
- Show legend:
  - L1 green (#22c55e), L2 blue (#3b82f6), L3 purple (#8b5cf6)
- For each family (EKA, AGT, TQA, DMI, PADS):
  - show key badge + family name
  - show 3 rows for L1/L2/L3:
    - small label: use first word of the level name
    - progress bar width = rating * 20%
    - rating number at end

### B) Projects tab
- Table columns: Project Name, Type, Source, Reuse Potential, Status (+ actions column in edit mode)
- Type badge styling:
  - "AI Use Case" => primary tint
  - "AI Community Center" => accent tint
  - "Other AI Initiative" => copper tint
- Status badge styling:
  - Active => primary tint
  - Completed => light/secondary
- In edit mode:
  - show "Add Project" button (Plus)
  - show edit (Edit2) and delete (Trash2) actions per row
- Must implement CRUD (add/edit/delete) with Dialog form:
  Fields:
   - name (string)
   - type (enum: "AI Use Case", "AI Community Center", "Other AI Initiative")
   - source (string)
   - reusable (enum: "Internal", "External")
   - status (enum: "Active", "Completed")
- Empty state text: "No projects yet." + if edit mode: "Click 'Add Project' to create one."

### C) Skills & Tools tab
Has 4 tool categories:
1) key: noCodeMinimal
   title: "AI No Code / Minimal Configuration Tools"
   desc: "Basic AI tools requiring minimal setup (e.g., ChatGPT, Claude, Gemini, Scribe, ElevenLabs)"
2) key: noCodeMore
   title: "AI No Code / More Configuration Tools"
   desc: "AI tools with extended customization (e.g., Custom GPTs, Copilot Studio, Lovable, Cursor, Bolt)"
3) key: lowCode
   title: "AI Low Code / Advanced Configuration"
   desc: "Workflow automation and integration platforms (e.g., AirOps, n8n, Make.com)"
4) key: proCode
   title: "AI Pro-Code Tools"
   desc: "Enterprise AI development platforms (e.g., Azure AI, Amazon Bedrock, Google Vertex)"

Each category card:
- Shows Add Tool button in edit mode
- Add tool UI: inline input "Enter tool name…" with Save button and X cancel
- Tool list: grid 2 columns
- Each tool row shows tool name and a 1–5 rating control ("SkillRating"):
  - 5 small square buttons, 1..5
  - Filled <= value: white text on primary background
  - Unfilled: gray background/text
  - Only clickable in edit mode
- In edit mode each tool also has a trash icon to remove tool

**IMPORTANT TOOL SEMANTICS (must match prototype behavior):**
- Tools are org-wide. Adding a tool adds it for ALL members automatically (with default rating 1).
- Deleting a tool removes it for ALL members.
Implement with DB:
- tools table is org-wide
- tool_ratings table links member_id + tool_id + rating
- Use Postgres RPC function(s) to do:
  - create_tool_and_seed_ratings(org_id, category_key, tool_name, default_rating=1)
  - delete_tool_and_ratings(org_id, tool_id)
Both must run as a single transaction.

**Portfolio family section (still inside Skills tab):**
Title: "AI Solution Portfolio Family (5 Families × 3 Levels)"
Subtitle: "Expertise across solution domains - click to expand details"
Legend: L1 green, L2 blue, L3 purple
List of families as collapsible rows:
- Collapsed row shows:
  - key badge + name + description
  - right side shows 3 colored number badges for L1/L2/L3 ratings
  - chevron rotates when expanded
- Expanded shows 3 level cards with:
  - "L{level}: {level.name}"
  - level.desc
  - LevelRating control: 1–5 small buttons colored by level (L1 green, L2 blue, L3 purple)
  - Only editable in edit mode

**Portfolio families:**
1) EKA "Expert Knowledge Assistants"
 desc: "RAG chatbots for instant access to expert knowledge (rules, policies, procedures)"
 levels:
  L1 "Standard Assistants (No Dev)"
  L2 "Advanced Assistants (Config + Code)"
  L3 "Enterprise-Integrated (Config + Code)"
2) AGT "Agents & Workflow Automation"
 desc: "AI that takes actions, moves work forward, orchestrates steps across systems"
 levels:
  L1 "Task & Trigger Agents"
  L2 "Goal-Oriented Workflow Agents"
  L3 "Multi-Agent Learning Systems"
3) TQA "Testing & Quality Automation"
 desc: "AI-assisted tools that test systems, bots, and data to catch issues earlier"
 levels:
  L1 "Standard Test Suites & Checks"
  L2 "Intelligent Regression Automation"
  L3 "Continuous Quality Intelligence"
4) DMI "Data & Migration Intelligence"
 desc: "AI to understand, cleanse, and transform data during implementations"
 levels:
  L1 "Standard Profiling"
  L2 "Advanced Quality & Conversion"
  L3 "Migration Intelligence Pipelines"
5) PADS "Predictive Analytics & Decision Support"
 desc: "Data and AI to improve how we assess options and make decisions"
 levels:
  L1 "Standard Analytics Packs"
  L2 "Scoring & Risk Assessment"
  L3 "True Predictive/Prescriptive"

### D) Awareness tab
Card title: "Awareness & Soft Skills"
6 rows, each includes label, description, and SkillRating 1–5 (editable only in edit mode):
- security: "AI Security Concerns" — "Understanding and monitoring AI security risks"
- ethics: "AI Ethics & Environmental Footprint" — "Ethical AI practices and sustainability awareness"
- policies: "Governmental AI Policies" — "Knowledge of regulatory frameworks and compliance"
- trends: "AI News, Trends & Insights" — "Staying current with industry developments"
- sales: "Sales Team AI Support" — "Ability to support sales with AI content"
- speaking: "Conference/Webinar Speaking" — "Public speaking and presentation abilities"

### E) Engagements tab
Two cards:
1) Client Engagements
- In edit mode: "Add Engagement" button
- List rows show:
  client name
  period: start_date to end_date
  allocation_percent large number + "Allocation"
  edit/delete icons visible only in edit mode
- CRUD fields: client, start_date, end_date, allocation_percent (number)
- Empty state: "No engagements recorded"

2) Time Off
- In edit mode: "Add Time Off" button (copper theme)
- Rows show type (Vacation/Conference/Sick Leave/etc), start/end
- edit/delete icons in edit mode
- CRUD fields: type, start_date, end_date
- Empty state: "No time off recorded"

### F) Events tab
Card title: "Webinars & Conferences"
- In edit mode: "Add Event" button
- Rows show:
  icon circle tinted copper if Speaker else primary tint
  event name
  date
  type pill ("Speaker" or "Attended") with matching tint
  edit/delete icons in edit mode
- CRUD fields: name, type enum (Speaker/Attended), date

### G) Team Dashboard tab
Contains:
1) 4 stat cards:
- Team Members = count
- Active Projects = count across all members where status Active
- Speaking Events = count across all members where type Speaker
- Avg Portfolio = average portfolio rating across all members across all families/levels (1 decimal)
2) Upcoming Team Time Off
- List all time off across members, sorted by start_date ascending
- Show member name, type, start_date, end_date
3) Team Portfolio Skills (L1 / L2 / L3)
- Table: rows are members, columns are portfolio family keys
- Each cell shows three small badges: L1 green, L2 blue, L3 purple with numbers
4) Client Allocation Overview
- For each member:
  - show a progress bar width = min(allocation_percent_sum, 100)
  - color logic:
    - allocation > 100: red (#dc2626)
    - else if allocation > 80: copper
    - else: primary
  - show allocation number at right (if >100 red)

## EXPORTS (CSV) — MUST MATCH THESE SECTIONS/COLUMNS

### 1) Individual CSV content format (string):
Header lines:
"AI Team Tracker - Individual Report"
"Name,<name>"
"Role,<role>"
"Generated,<local date>"

Section: "SKILLS & TOOLS"
Columns: Category,Tool,Rating
Category names:
- noCodeMinimal => "No Code Minimal"
- noCodeMore => "No Code More"
- lowCode => "Low Code"
- proCode => "Pro Code"

Section: "PORTFOLIO SKILLS"
Columns: Family,L1,L2,L3
Each row uses "<KEY> - <FamilyName>"

Section: "AWARENESS"
Columns: Area,Rating (Area is the key name)

Section: "PROJECTS"
Columns: Name,Type,Source,Reusable,Status

Section: "ENGAGEMENTS"
Columns: Client,Start Date,End Date,Allocation %

Section: "TIME OFF"
Columns: Type,Start Date,End Date

Section: "EVENTS"
Columns: Name,Type,Date

### 2) Team CSV content format:
Header:
"AI Team Tracker - Team Report"
"Generated,<local date>"

Section: "TEAM OVERVIEW"
Columns: Name,Role,Active Projects,Allocation %,Portfolio Avg

Section: "PORTFOLIO SKILLS MATRIX"
Header columns:
Name, then for each family: "<KEY> L1,<KEY> L2,<KEY> L3"

Section: "TOOLS SKILLS MATRIX"
Columns: Name, then all tool names (org-wide tools list)
Rows: each member's rating per tool (0 if missing)

Section: "UPCOMING TIME OFF"
Columns: Name,Type,Start Date,End Date (include member name)

Section: "ALL ENGAGEMENTS"
Columns: Name,Client,Start Date,End Date,Allocation %

## REPORT PREVIEW MODAL (PRINTABLE)
- Modal overlay dark backdrop
- Container max width, scrollable
- Header includes:
  - Title: either "<Member Name> - Report Preview" or "Team Report Preview"
  - Button: "Print / Save as PDF" (calls window.print)
  - Close button X
- Print CSS:
  - hide everything except the report content container when printing
- Individual report content:
  - Title: "AI Team Work Tracker"
  - Subtitle: "<Member Name> - <Role>"
  - Generated date
  - 3 stat cards (active projects, allocation, portfolio avg)
  - Portfolio skills table (Family, L1, L2, L3)
  - Tools & Skills summary by category with chips "Tool: rating/5"
  - Engagements table
  - Events chips ("name (type) - date")
- Team report content:
  - Title: "AI Team Work Tracker"
  - Subtitle: "Team Report"
  - Generated date
  - 4 stat cards (team size, active projects, speaking events, upcoming time off count)
  - Team Overview table (name, role, projects, allocation, portfolio avg)
  - Portfolio Skills Matrix table (cells show "L1/L2/L3", optionally colored)
  - Upcoming Time Off table
  - All Engagements table

## EDIT MODE RULES
- When edit mode is OFF:
  - rating controls are disabled
  - add/edit/delete controls hidden
- When edit mode is ON:
  - rating controls are interactive and persist to DB
  - CRUD actions available

## SAMPLE SEED DATA (for initial seed script)
Team members (5):
1) Sarah Chen — "AI Solutions Lead" — initials "SC"
2) Marcus Johnson — "AI Developer" — initials "MJ"
3) Elena Rodriguez — "AI Analyst" — initials "ER"
4) David Kim — "AI Engineer" — initials "DK"
5) Priya Patel — "AI Consultant" — initials "PP"

Seed initial records roughly equivalent to this (use same tool names and similar ratings):
Tools by category (org-wide):
- noCodeMinimal: ChatGPT, Claude, Gemini, Scribe, ElevenLabs
- noCodeMore: Custom GPTs, Copilot Studio, Lovable, Cursor, Bolt
- lowCode: AirOps, n8n, Make.com
- proCode: Azure AI, Amazon Bedrock, Google Vertex

Portfolio ratings per member: include L1/L2/L3 values for each family.
Awareness ratings per member: security, ethics, policies, trends, sales, speaking.
Projects/engagements/time off/events: create at least a couple entries mirroring:
- Sarah: 2 projects, 2 engagements totaling 100, 1 vacation, 2 events (speaker + attended)
- Marcus: 1 project, 1 engagement, 1 conference time off, 1 attended event
- Elena: 1 project, 1 engagement, 1 attended event
- David: 0 projects, 1 engagement, 1 sick leave, 0 events
- Priya: 1 project, 0 engagements, 1 vacation, 1 speaker event

---

## MULTI-USER / AUTH / PERMISSIONS SPEC

### AUTH
- Supabase Auth email/password as baseline.
- Keep design extensible to add OAuth later (Azure AD).
- Routes:
  - /login public
  - /dashboard and /admin protected
- Logout button signs out and returns to /login.

### ROLES
- ADMIN: full access + role management + linking profiles to team members
- MANAGER: can edit all team data but cannot manage roles/users
- MEMBER: can edit ONLY the team_member row linked to their profile (and its related data)
- VIEWER: read-only for everything

### ENFORCEMENT
- Must enforce with Postgres RLS policies. Frontend checks are for UX only.
- RLS must cover: team_members, projects, engagements, time_off, events, tool_ratings, portfolio_ratings, awareness_ratings.
- Tools and reference tables: creation/deletion restricted to ADMIN/MANAGER (or ADMIN only; decide and document).
- Add Tool/Delete Tool uses RPC functions; protect those functions.

### ADMIN FUNCTIONS
- Admin page:
  - list profiles/users
  - set role (ADMIN/MANAGER/MEMBER/VIEWER)
  - link a profile to a team_member (so MEMBER can edit "self")
- First ever user to sign in becomes ADMIN automatically if no org exists (bootstrap).
- Optional: audit_log of changes (recommended).

### DATA MODEL (normalized)
Include org support (org_id everywhere, even if single org MVP).
Tables:
- organizations (id, name, created_at)
- profiles (id uuid = auth.user.id, org_id, email, full_name, role, created_at)
- team_members (id, org_id, name, role_title, avatar_initials, linked_profile_id nullable, created_at)
- projects (id, org_id, member_id, name, type, source, reusable, status, created_at)
- engagements (id, org_id, member_id, client, start_date, end_date, allocation_percent, created_at)
- time_off (id, org_id, member_id, type, start_date, end_date, created_at)
- events (id, org_id, member_id, name, type, date, created_at)
- tool_categories (key PK, title, description) seeded with the 4 keys
- tools (id, org_id, category_key FK, tool_name) unique(org_id, category_key, tool_name)
- tool_ratings (org_id, member_id, tool_id, rating int 1..5) unique(member_id, tool_id)
- portfolio_families (key PK, name, desc) seeded with EKA/AGT/TQA/DMI/PADS
- portfolio_levels (key PK optional OR use enum values L1/L2/L3) with display name/colors
- portfolio_ratings (org_id, member_id, family_key, level, rating int 1..5) unique(member_id, family_key, level)
- awareness_areas (key PK, label, desc) seeded with 6 keys
- awareness_ratings (org_id, member_id, area_key, rating int 1..5) unique(member_id, area_key)
- audit_log (optional): org_id, actor_profile_id, entity_table, entity_id, action, diff jsonb, created_at

### CONSTRAINTS/INDEXES
- rating check 1..5
- allocation_percent check 0..200
- proper FK constraints with cascade where appropriate
- indexes on org_id/member_id for performance

### RPC FUNCTIONS (POSTGRES)
1) create_tool_and_seed_ratings(p_org_id uuid, p_category_key text, p_tool_name text, p_default_rating int default 1)
- inserts tool
- inserts tool_ratings for every team_member in org with default rating
- returns inserted tool
- protected by RLS/SECURITY DEFINER properly (do not leak service role key to browser)

2) delete_tool_and_ratings(p_org_id uuid, p_tool_id uuid)
- deletes tool_ratings rows and tool row (or cascade)
- protected similarly

---

## IMPLEMENTATION DETAILS

### UI TECH
- Use shadcn/ui: Button, Card, Table, Dialog, DropdownMenu, Tabs, Input, Select, Textarea, Sonner/Toast
- Use consistent spacing, rounded corners, subtle borders.

### STATE/DATA
- Do NOT keep everything as one giant object in client state.
- Fetch DB data for selected member and org.
- Use server components where helpful, but keep interactive dashboard as client components.
- Handle loading and error states.

### EXPORTS
- Implement CSV generation client-side or server-side, but must match formats above.
- Download via Blob + anchor click.
- Report preview uses a modal and window.print with print-only CSS.

### SECURITY
- Never expose Supabase service role key to browser.
- Use service role only in server-only scripts (seed).
- Middleware must protect routes and refresh sessions.

### REPO STRUCTURE TARGET
- src/app/(auth)/login/page.tsx
- src/app/(app)/layout.tsx
- src/app/(app)/dashboard/page.tsx
- src/app/(app)/admin/page.tsx
- src/components/* (Header, Sidebar, Tabs, dialogs, rating components, report modal)
- src/lib/supabase/server.ts and client.ts
- src/lib/db/* (typed queries/mutations)
- src/lib/export/* (csv/report builders)
- supabase/schema.sql + supabase/functions.sql (or migrations)
- scripts/seed.ts
- docs/SPEC.md and docs/PLAN.md
