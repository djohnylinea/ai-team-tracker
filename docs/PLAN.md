# AI Team Work Tracker - Implementation Plan

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  Next.js 14+ App Router (TypeScript)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   /login    │  │ /dashboard  │  │   /admin    │             │
│  │  (public)   │  │ (protected) │  │ (admin only)│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
│  Components: Header, Sidebar, Tabs, Dialogs, Ratings, Reports   │
│  State: React hooks + Server Components where possible          │
│  Styling: TailwindCSS + shadcn/ui                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ @supabase/ssr
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE                                   │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │  Supabase Auth  │  │ Postgres + RLS  │                       │
│  │ (email/password)│  │  (all tables)   │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
│  RPC Functions: create_tool_and_seed_ratings,                   │
│                 delete_tool_and_ratings                          │
│  RLS Policies: role-based (ADMIN, MANAGER, MEMBER, VIEWER)      │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| UI Components | shadcn/ui |
| Icons | lucide-react |
| Forms | react-hook-form + zod |
| Database | Supabase Postgres |
| Auth | Supabase Auth |
| Session Handling | @supabase/ssr |
| Linting | ESLint + Prettier |
| Testing | Playwright + Vitest |

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| primary | #123A43 | Main brand color, headers, primary buttons |
| secondary | #5D7D87 | Secondary elements, muted text |
| accent | #8795B0 | Highlights, borders |
| copper | #B06C50 | CTAs, special actions, export buttons |
| light | #CEDADD | Backgrounds, cards |

## Database Schema Overview

### Core Tables
- `organizations` - Multi-tenant support
- `profiles` - User profiles linked to auth.users
- `team_members` - Team member records

### Data Tables
- `projects` - Member projects
- `engagements` - Client engagements
- `time_off` - Time off records
- `events` - Webinars & conferences

### Skills & Ratings Tables
- `tool_categories` - Reference table (4 categories)
- `tools` - Org-wide tools
- `tool_ratings` - Per-member tool ratings
- `portfolio_families` - Reference table (5 families)
- `portfolio_ratings` - Per-member portfolio ratings
- `awareness_areas` - Reference table (6 areas)
- `awareness_ratings` - Per-member awareness ratings

### Audit
- `audit_log` - Optional change tracking

## Role Permissions Matrix

| Action | ADMIN | MANAGER | MEMBER | VIEWER |
|--------|-------|---------|--------|--------|
| View all data | ✅ | ✅ | ✅ | ✅ |
| Edit own linked member | ✅ | ✅ | ✅ | ❌ |
| Edit all members | ✅ | ✅ | ❌ | ❌ |
| Add/Delete tools (org-wide) | ✅ | ✅ | ❌ | ❌ |
| Manage users/roles | ✅ | ❌ | ❌ | ❌ |
| Link profiles to members | ✅ | ❌ | ❌ | ❌ |

---

## Milestones Checklist

### Milestone 1 — Scaffold & UI Shell
- [ ] Create Next.js app with TypeScript + Tailwind
- [ ] Configure ESLint + Prettier
- [ ] Install dependencies:
  - [ ] shadcn/ui
  - [ ] lucide-react
  - [ ] @supabase/supabase-js
  - [ ] @supabase/ssr
  - [ ] zod
  - [ ] react-hook-form
  - [ ] sonner
- [ ] Create route structure:
  - [ ] /login (public)
  - [ ] /dashboard (protected)
  - [ ] /admin (admin only)
- [ ] Build UI shell:
  - [ ] Login page (UI only)
  - [ ] Dashboard layout (Header, Sidebar, Main)
  - [ ] Tab placeholders (Overview, Projects, Skills, Awareness, Engagements, Events, Team Dashboard)
- [ ] Verify app runs and renders correctly

**Verification:**
- `npm install` completes without errors
- `npm run dev` starts the server
- `/login` shows login UI
- `/dashboard` shows app shell with tabs

---

### Milestone 2 — Supabase Auth
- [ ] Set up Supabase client (server + client)
- [ ] Implement email/password login
- [ ] Add middleware for route protection
- [ ] Implement logout functionality
- [ ] Display logged-in user in header

**Verification:**
- Can sign up / sign in
- Protected routes redirect to login
- Logout works and redirects to login

---

### Milestone 3 — DB Schema + RLS + Seed
- [ ] Write schema.sql with all tables
- [ ] Write RLS policies for all tables
- [ ] Create RPC functions:
  - [ ] create_tool_and_seed_ratings
  - [ ] delete_tool_and_ratings
- [ ] Write seed script (TypeScript)
- [ ] Seed reference tables + sample data

**Verification:**
- SQL applies without errors
- Seed script runs successfully
- Data visible in Supabase dashboard

---

### Milestone 4 — Data Layer + Dashboard Binding
- [ ] Create typed database queries
- [ ] Implement member selector (loads from DB)
- [ ] Bind Overview tab to real data
- [ ] Bind all tabs to member data
- [ ] Handle loading/error states

**Verification:**
- Dashboard shows real data from DB
- Member selector works
- Switching members updates all tabs

---

### Milestone 5 — CRUD (Projects, Engagements, Time Off, Events)
- [ ] Projects CRUD with dialog + validation
- [ ] Engagements CRUD with dialog + validation
- [ ] Time Off CRUD with dialog + validation
- [ ] Events CRUD with dialog + validation
- [ ] Respect role permissions
- [ ] Add toast notifications
- [ ] Refresh lists after mutations

**Verification:**
- Can add/edit/delete all entity types
- Validation works (zod)
- Toasts show on success/error
- RLS prevents unauthorized edits

---

### Milestone 6 — Skills/Tools + Portfolio + Awareness
- [ ] Tool ratings (read/write)
- [ ] Add Tool via RPC (org-wide seeding)
- [ ] Delete Tool via RPC
- [ ] Portfolio family expandable section
- [ ] Portfolio level ratings
- [ ] Awareness ratings
- [ ] Edit mode toggle controls editability

**Verification:**
- Ratings persist to DB
- Adding tool appears for all members
- Deleting tool removes for all members
- Changes visible across users

---

### Milestone 7 — Exports & Report Modal
- [ ] Individual CSV export (matches spec format)
- [ ] Team CSV export (matches spec format)
- [ ] Individual report preview modal
- [ ] Team report preview modal
- [ ] Print CSS for reports
- [ ] window.print() functionality

**Verification:**
- CSV downloads with correct format
- Report modal renders correctly
- Print produces clean PDF

---

### Milestone 8 — Admin Page + Role Management
- [ ] Admin page UI
- [ ] List all profiles/users
- [ ] Change user roles
- [ ] Link profile to team_member
- [ ] Protect admin route (ADMIN only)
- [ ] Optional: audit_log entries

**Verification:**
- Only ADMIN can access /admin
- Can change roles
- Can link profiles to members
- Role changes affect permissions immediately

---

### Milestone 9 — Hardening + Tests + Deploy
- [ ] Loading states for all async operations
- [ ] Error states and user-friendly messages
- [ ] Edge case handling
- [ ] Playwright smoke test (login → dashboard)
- [ ] Unit tests (CSV generation, rating bounds)
- [ ] Deployment documentation (Vercel + Supabase)

**Verification:**
- All tests pass
- No console errors in production build
- Deployment guide is complete

---

## File Structure (Target)

```
ai-team-tracker/
├── docs/
│   ├── SPEC.md
│   └── PLAN.md
├── public/
├── scripts/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── admin/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/          (shadcn components)
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MemberCard.tsx
│   │   ├── TabContent/
│   │   │   ├── OverviewTab.tsx
│   │   │   ├── ProjectsTab.tsx
│   │   │   ├── SkillsTab.tsx
│   │   │   ├── AwarenessTab.tsx
│   │   │   ├── EngagementsTab.tsx
│   │   │   ├── EventsTab.tsx
│   │   │   └── TeamDashboardTab.tsx
│   │   ├── dialogs/
│   │   ├── ratings/
│   │   │   ├── SkillRating.tsx
│   │   │   └── LevelRating.tsx
│   │   └── reports/
│   │       └── ReportModal.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── db/
│   │   │   ├── types.ts
│   │   │   ├── queries.ts
│   │   │   └── mutations.ts
│   │   ├── export/
│   │   │   ├── csv.ts
│   │   │   └── report.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── supabase/
│   ├── schema.sql
│   └── functions.sql
├── tests/
│   ├── e2e/
│   │   └── smoke.spec.ts
│   └── unit/
│       └── csv.test.ts
├── .env.local.example
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Notes

- All tables include `org_id` for multi-tenancy
- RLS policies enforce permissions at database level
- Frontend role checks are for UX only (hide/disable UI)
- Service role key is NEVER exposed to browser
- Seed script runs server-side only
