// Design tokens / constants for the app
export const COLORS = {
  primary: '#123A43',
  secondary: '#5D7D87',
  accent: '#8795B0',
  copper: '#B06C50',
  light: '#CEDADD',
  levelL1: '#22c55e',
  levelL2: '#3b82f6',
  levelL3: '#8b5cf6',
} as const;

// Tab definitions
export type TabKey =
  | 'overview'
  | 'projects'
  | 'portfolio'
  | 'skills'
  | 'awareness'
  | 'engagements'
  | 'events'
  | 'time-off'
  | 'team-dashboard'
  | 'calendar'
  | 'portfolio-catalog';

export interface TabDefinition {
  key: TabKey;
  label: string;
  icon: string;
  hasEditMode: boolean;
}

export const TABS: TabDefinition[] = [
  { key: 'overview', label: 'Overview', icon: 'BarChart3', hasEditMode: false },
  { key: 'projects', label: 'Projects', icon: 'BookOpen', hasEditMode: true },
  { key: 'portfolio', label: 'Portfolio', icon: 'Briefcase', hasEditMode: true },
  { key: 'skills', label: 'Skills & Tools', icon: 'Award', hasEditMode: true },
  { key: 'awareness', label: 'Awareness', icon: 'Shield', hasEditMode: true },
  { key: 'engagements', label: 'Engagements', icon: 'Calendar', hasEditMode: true },
  { key: 'events', label: 'Events', icon: 'Mic', hasEditMode: true },
  { key: 'time-off', label: 'Time Off', icon: 'Palmtree', hasEditMode: true },
];

// Tool categories
export const TOOL_CATEGORIES = [
  {
    key: 'noCodeMinimal',
    title: 'AI No Code / Minimal Configuration Tools',
    description: 'Basic AI tools requiring minimal setup (e.g., ChatGPT, Claude, Gemini, Scribe, ElevenLabs)',
  },
  {
    key: 'noCodeMore',
    title: 'AI No Code / More Configuration Tools',
    description: 'AI tools with extended customization (e.g., Custom GPTs, Copilot Studio, Lovable, Cursor, Bolt)',
  },
  {
    key: 'lowCode',
    title: 'AI Low Code / Advanced Configuration',
    description: 'Workflow automation and integration platforms (e.g., AirOps, n8n, Make.com)',
  },
  {
    key: 'proCode',
    title: 'AI Pro-Code Tools',
    description: 'Enterprise AI development platforms (e.g., Azure AI, Amazon Bedrock, Google Vertex)',
  },
] as const;

// Portfolio categories (default set - can be customized per org)
export const DEFAULT_PORTFOLIO_CATEGORIES = [
  {
    key: 'EKA',
    name: 'Expert Knowledge Assistants',
    description: 'RAG chatbots for instant access to expert knowledge (rules, policies, procedures)',
  },
  {
    key: 'AGT',
    name: 'Agents & Workflow Automation',
    description: 'AI that takes actions, moves work forward, orchestrates steps across systems',
  },
  {
    key: 'TQA',
    name: 'Testing & Quality Automation',
    description: 'AI-assisted tools that test systems, bots, and data to catch issues earlier',
  },
  {
    key: 'DMI',
    name: 'Data & Migration Intelligence',
    description: 'AI to understand, cleanse, and transform data during implementations',
  },
  {
    key: 'PADS',
    name: 'Predictive Analytics & Decision Support',
    description: 'Data and AI to improve how we assess options and make decisions',
  },
] as const;

export interface PortfolioCategory {
  id: string;
  orgId: string;
  key: string;
  name: string;
  description?: string;
}

export interface PortfolioRating {
  id: string;
  memberId: string;
  categoryId: string;
  category?: PortfolioCategory;
  rating: number;
}

// Awareness areas
export const AWARENESS_AREAS = [
  { key: 'security', label: 'AI Security Concerns', description: 'Understanding and monitoring AI security risks' },
  { key: 'ethics', label: 'AI Ethics & Environmental Footprint', description: 'Ethical AI practices and sustainability awareness' },
  { key: 'policies', label: 'Governmental AI Policies', description: 'Knowledge of regulatory frameworks and compliance' },
  { key: 'trends', label: 'AI News, Trends & Insights', description: 'Staying current with industry developments' },
  { key: 'sales', label: 'Sales Team AI Support', description: 'Ability to support sales with AI content' },
  { key: 'speaking', label: 'Conference/Webinar Speaking', description: 'Public speaking and presentation abilities' },
] as const;

// Project types
export const PROJECT_TYPES = ['AI Use Case', 'AI Community Center', 'Other AI Initiative'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

// Project status
export const PROJECT_STATUSES = ['Active', 'Completed'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// Reuse potential
export const REUSE_POTENTIALS = ['Internal', 'External'] as const;
export type ReusePotential = (typeof REUSE_POTENTIALS)[number];

// Event types
export const EVENT_TYPES = ['Speaker', 'Attended'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

// Time off types
export const TIME_OFF_TYPES = ['Vacation', 'Conference', 'Sick Leave', 'Personal', 'Other'] as const;
export type TimeOffType = (typeof TIME_OFF_TYPES)[number];

// Role types
export const USER_ROLES = ['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Sample team member for UI shell (will be replaced with DB data)
export interface TeamMember {
  id: string;
  name: string;
  roleTitle: string;
  avatarInitials: string;
}

export const SAMPLE_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', roleTitle: 'AI Solutions Lead', avatarInitials: 'SC' },
  { id: '2', name: 'Marcus Johnson', roleTitle: 'AI Developer', avatarInitials: 'MJ' },
  { id: '3', name: 'Elena Rodriguez', roleTitle: 'AI Analyst', avatarInitials: 'ER' },
  { id: '4', name: 'David Kim', roleTitle: 'AI Engineer', avatarInitials: 'DK' },
  { id: '5', name: 'Priya Patel', roleTitle: 'AI Consultant', avatarInitials: 'PP' },
];
