/**
 * AI Team Work Tracker - Seed Script
 * 
 * This script seeds the database with sample data for development/testing.
 * Run with: npx tsx scripts/seed.ts
 * 
 * Requirements:
 * - NEXT_PUBLIC_SUPABASE_URL in .env.local
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local (get from Supabase dashboard)
 * - Database schema already applied (run schema.sql, policies.sql, functions.sql first)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =============================================
// SEED DATA
// =============================================

const TEAM_MEMBERS = [
  { name: 'Sarah Chen', role_title: 'AI Solutions Lead', avatar_initials: 'SC' },
  { name: 'Marcus Johnson', role_title: 'AI Developer', avatar_initials: 'MJ' },
  { name: 'Elena Rodriguez', role_title: 'AI Analyst', avatar_initials: 'ER' },
  { name: 'David Kim', role_title: 'AI Engineer', avatar_initials: 'DK' },
  { name: 'Priya Patel', role_title: 'AI Consultant', avatar_initials: 'PP' },
];

const TOOLS_BY_CATEGORY = {
  noCodeMinimal: ['ChatGPT', 'Claude', 'Gemini', 'Scribe', 'ElevenLabs'],
  noCodeMore: ['Custom GPTs', 'Copilot Studio', 'Lovable', 'Cursor', 'Bolt'],
  lowCode: ['AirOps', 'n8n', 'Make.com'],
  proCode: ['Azure AI', 'Amazon Bedrock', 'Google Vertex'],
};

const PORTFOLIO_CATEGORIES = [
  { key: 'EKA', name: 'Expert Knowledge Assistants', description: 'RAG chatbots for instant access to expert knowledge' },
  { key: 'AGT', name: 'Agents & Workflow Automation', description: 'AI that takes actions and orchestrates steps across systems' },
  { key: 'TQA', name: 'Testing & Quality Automation', description: 'AI-assisted tools that test systems, bots, and data' },
  { key: 'DMI', name: 'Data & Migration Intelligence', description: 'AI to understand, cleanse, and transform data' },
  { key: 'PADS', name: 'Predictive Analytics & Decision Support', description: 'Data and AI to improve decision making' },
];
const AWARENESS_AREAS = ['security', 'ethics', 'policies', 'trends', 'sales', 'speaking'];

// Generate random rating between min and max
function randomRating(min = 1, max = 5): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random date within next N months
function futureDate(maxMonths = 6): string {
  const date = new Date();
  date.setMonth(date.getMonth() + Math.floor(Math.random() * maxMonths));
  date.setDate(Math.floor(Math.random() * 28) + 1);
  return date.toISOString().split('T')[0];
}

// Generate random date within past N months
function pastDate(maxMonths = 12): string {
  const date = new Date();
  date.setMonth(date.getMonth() - Math.floor(Math.random() * maxMonths));
  date.setDate(Math.floor(Math.random() * 28) + 1);
  return date.toISOString().split('T')[0];
}

async function seed() {
  console.log('🌱 Starting seed...\n');

  // =============================================
  // 1. CREATE ORGANIZATION
  // =============================================
  console.log('Creating organization...');
  
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: 'Linea AI Solutions' })
    .select()
    .single();

  if (orgError) {
    console.error('Error creating organization:', orgError);
    process.exit(1);
  }
  console.log(`✅ Organization created: ${org.name} (${org.id})\n`);

  const orgId = org.id;

  // =============================================
  // 2. CREATE TEAM MEMBERS
  // =============================================
  console.log('Creating team members...');
  
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .insert(TEAM_MEMBERS.map(m => ({ ...m, org_id: orgId })))
    .select();

  if (membersError) {
    console.error('Error creating team members:', membersError);
    process.exit(1);
  }
  console.log(`✅ Created ${members.length} team members\n`);

  // =============================================
  // 3. CREATE TOOLS
  // =============================================
  console.log('Creating tools...');
  
  const toolsToInsert = Object.entries(TOOLS_BY_CATEGORY).flatMap(([category, tools]) =>
    tools.map(toolName => ({
      org_id: orgId,
      category_key: category,
      tool_name: toolName,
    }))
  );

  const { data: tools, error: toolsError } = await supabase
    .from('tools')
    .insert(toolsToInsert)
    .select();

  if (toolsError) {
    console.error('Error creating tools:', toolsError);
    process.exit(1);
  }
  console.log(`✅ Created ${tools.length} tools\n`);

  // =============================================
  // 4. CREATE TOOL RATINGS
  // =============================================
  console.log('Creating tool ratings...');
  
  const toolRatings = members.flatMap(member =>
    tools.map(tool => ({
      org_id: orgId,
      member_id: member.id,
      tool_id: tool.id,
      rating: randomRating(2, 5),
    }))
  );

  const { error: toolRatingsError } = await supabase
    .from('tool_ratings')
    .insert(toolRatings);

  if (toolRatingsError) {
    console.error('Error creating tool ratings:', toolRatingsError);
    process.exit(1);
  }
  console.log(`✅ Created ${toolRatings.length} tool ratings\n`);

  // =============================================
  // 5. CREATE PORTFOLIO CATEGORIES AND RATINGS
  // =============================================
  console.log('Creating portfolio categories...');
  
  const portfolioCategories = PORTFOLIO_CATEGORIES.map(cat => ({
    org_id: orgId,
    key: cat.key,
    name: cat.name,
    description: cat.description,
  }));

  const { data: createdCategories, error: catError } = await supabase
    .from('portfolio_categories')
    .insert(portfolioCategories)
    .select();

  if (catError) {
    console.error('Error creating portfolio categories:', catError);
    process.exit(1);
  }
  console.log(`✅ Created ${createdCategories?.length || 0} portfolio categories\n`);

  console.log('Creating portfolio ratings...');
  
  const portfolioRatings = members.flatMap(member =>
    (createdCategories || []).map(cat => ({
      org_id: orgId,
      member_id: member.id,
      category_id: cat.id,
      rating: randomRating(0, 5), // 0 means not rated
    }))
  );

  const { error: portfolioError } = await supabase
    .from('portfolio_ratings')
    .insert(portfolioRatings);

  if (portfolioError) {
    console.error('Error creating portfolio ratings:', portfolioError);
    process.exit(1);
  }
  console.log(`✅ Created ${portfolioRatings.length} portfolio ratings\n`);

  // =============================================
  // 6. CREATE AWARENESS RATINGS
  // =============================================
  console.log('Creating awareness ratings...');
  
  const awarenessRatings = members.flatMap(member =>
    AWARENESS_AREAS.map(area => ({
      org_id: orgId,
      member_id: member.id,
      area_key: area,
      rating: randomRating(2, 5),
    }))
  );

  const { error: awarenessError } = await supabase
    .from('awareness_ratings')
    .insert(awarenessRatings);

  if (awarenessError) {
    console.error('Error creating awareness ratings:', awarenessError);
    process.exit(1);
  }
  console.log(`✅ Created ${awarenessRatings.length} awareness ratings\n`);

  // =============================================
  // 7. CREATE PROJECTS
  // =============================================
  console.log('Creating projects...');
  
  const projects = [
    // Sarah - 2 projects
    { org_id: orgId, member_id: members[0].id, name: 'AI Chatbot for Customer Support', type: 'AI Use Case', source: 'Client A', reusable: 'External', status: 'Active' },
    { org_id: orgId, member_id: members[0].id, name: 'Knowledge Base RAG System', type: 'AI Community Center', source: 'Internal', reusable: 'Internal', status: 'Active' },
    // Marcus - 1 project
    { org_id: orgId, member_id: members[1].id, name: 'Document Processing Pipeline', type: 'AI Use Case', source: 'Client B', reusable: 'External', status: 'Completed' },
    // Elena - 1 project
    { org_id: orgId, member_id: members[2].id, name: 'AI Analytics Dashboard', type: 'Other AI Initiative', source: 'Internal', reusable: 'Internal', status: 'Active' },
    // David - 0 projects
    // Priya - 1 project
    { org_id: orgId, member_id: members[4].id, name: 'Sales AI Assistant', type: 'AI Use Case', source: 'Client C', reusable: 'External', status: 'Active' },
  ];

  const { error: projectsError } = await supabase
    .from('projects')
    .insert(projects);

  if (projectsError) {
    console.error('Error creating projects:', projectsError);
    process.exit(1);
  }
  console.log(`✅ Created ${projects.length} projects\n`);

  // =============================================
  // 8. CREATE ENGAGEMENTS
  // =============================================
  console.log('Creating engagements...');
  
  const engagements = [
    // Sarah - 2 engagements (100% total)
    { org_id: orgId, member_id: members[0].id, client: 'Acme Corp', start_date: '2025-01-01', end_date: '2026-06-30', allocation_percent: 60 },
    { org_id: orgId, member_id: members[0].id, client: 'TechStart Inc', start_date: '2025-03-01', end_date: '2026-03-31', allocation_percent: 40 },
    // Marcus - 1 engagement
    { org_id: orgId, member_id: members[1].id, client: 'Global Finance', start_date: '2025-06-01', end_date: '2026-05-31', allocation_percent: 80 },
    // Elena - 1 engagement
    { org_id: orgId, member_id: members[2].id, client: 'HealthCare Plus', start_date: '2025-02-01', end_date: '2025-12-31', allocation_percent: 50 },
    // David - 1 engagement
    { org_id: orgId, member_id: members[3].id, client: 'RetailMax', start_date: '2025-04-01', end_date: '2026-03-31', allocation_percent: 100 },
    // Priya - 0 engagements
  ];

  const { error: engagementsError } = await supabase
    .from('engagements')
    .insert(engagements);

  if (engagementsError) {
    console.error('Error creating engagements:', engagementsError);
    process.exit(1);
  }
  console.log(`✅ Created ${engagements.length} engagements\n`);

  // =============================================
  // 9. CREATE TIME OFF
  // =============================================
  console.log('Creating time off records...');
  
  const timeOff = [
    // Sarah - 1 vacation
    { org_id: orgId, member_id: members[0].id, type: 'Vacation', start_date: '2026-02-15', end_date: '2026-02-22' },
    // Marcus - 1 conference
    { org_id: orgId, member_id: members[1].id, type: 'Conference', start_date: '2026-03-10', end_date: '2026-03-12' },
    // David - 1 sick leave
    { org_id: orgId, member_id: members[3].id, type: 'Sick Leave', start_date: '2026-01-20', end_date: '2026-01-21' },
    // Priya - 1 vacation
    { org_id: orgId, member_id: members[4].id, type: 'Vacation', start_date: '2026-04-01', end_date: '2026-04-10' },
  ];

  const { error: timeOffError } = await supabase
    .from('time_off')
    .insert(timeOff);

  if (timeOffError) {
    console.error('Error creating time off:', timeOffError);
    process.exit(1);
  }
  console.log(`✅ Created ${timeOff.length} time off records\n`);

  // =============================================
  // 10. CREATE EVENTS
  // =============================================
  console.log('Creating events...');
  
  const events = [
    // Past events
    { org_id: orgId, member_id: members[0].id, name: 'AI Summit 2025', type: 'Speaker', date: '2025-09-15' },
    { org_id: orgId, member_id: members[0].id, name: 'Tech Conference', type: 'Attended', date: '2025-11-20' },
    { org_id: orgId, member_id: members[1].id, name: 'Developer Meetup', type: 'Attended', date: '2025-10-05' },
    { org_id: orgId, member_id: members[2].id, name: 'Data Analytics Workshop', type: 'Attended', date: '2025-08-12' },
    { org_id: orgId, member_id: members[4].id, name: 'AI in Business Webinar', type: 'Speaker', date: '2025-12-01' },
    // Future events (2026)
    { org_id: orgId, member_id: members[0].id, name: 'AI Innovation Summit 2026', type: 'Speaker', date: '2026-02-15' },
    { org_id: orgId, member_id: members[1].id, name: 'Cloud & AI Conference', type: 'Attended', date: '2026-03-10' },
    { org_id: orgId, member_id: members[2].id, name: 'Women in Tech Summit', type: 'Speaker', date: '2026-01-25' },
    { org_id: orgId, member_id: members[3].id, name: 'Developer Days 2026', type: 'Attended', date: '2026-04-05' },
    { org_id: orgId, member_id: members[4].id, name: 'Consulting Excellence Forum', type: 'Speaker', date: '2026-02-28' },
  ];

  const { error: eventsError } = await supabase
    .from('events')
    .insert(events);

  if (eventsError) {
    console.error('Error creating events:', eventsError);
    process.exit(1);
  }
  console.log(`✅ Created ${events.length} events\n`);

  // =============================================
  // DONE
  // =============================================
  console.log('🎉 Seed completed successfully!\n');
  console.log('Summary:');
  console.log(`  - 1 organization`);
  console.log(`  - ${members.length} team members`);
  console.log(`  - ${tools.length} tools`);
  console.log(`  - ${toolRatings.length} tool ratings`);
  console.log(`  - ${portfolioRatings.length} portfolio ratings`);
  console.log(`  - ${awarenessRatings.length} awareness ratings`);
  console.log(`  - ${projects.length} projects`);
  console.log(`  - ${engagements.length} engagements`);
  console.log(`  - ${timeOff.length} time off records`);
  console.log(`  - ${events.length} events`);
}

// Run seed
seed().catch(console.error);
