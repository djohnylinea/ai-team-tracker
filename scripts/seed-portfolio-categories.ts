/**
 * Seed default portfolio categories for the organization
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_PORTFOLIO_CATEGORIES = [
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
];

async function seedPortfolioCategories() {
  console.log('🚀 Seeding portfolio categories...\n');

  // Get the organization
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .limit(1);

  if (orgError || !orgs?.length) {
    console.error('Failed to find organization:', orgError?.message || 'No organizations found');
    process.exit(1);
  }

  const orgId = orgs[0].id;
  console.log(`📍 Using organization: ${orgs[0].name} (${orgId})\n`);

  // Check existing categories
  const { data: existing } = await supabase
    .from('portfolio_categories')
    .select('key')
    .eq('org_id', orgId);

  const existingKeys = new Set((existing || []).map(c => c.key));

  // Insert only categories that don't already exist
  let added = 0;
  let skipped = 0;

  for (const cat of DEFAULT_PORTFOLIO_CATEGORIES) {
    if (existingKeys.has(cat.key)) {
      console.log(`  ⏩ ${cat.key} - "${cat.name}" already exists, skipping`);
      skipped++;
      continue;
    }

    const { error } = await supabase
      .from('portfolio_categories')
      .insert({
        org_id: orgId,
        key: cat.key,
        name: cat.name,
        description: cat.description,
      });

    if (error) {
      console.error(`  ❌ Failed to insert ${cat.key}:`, error.message);
    } else {
      console.log(`  ✅ ${cat.key} - "${cat.name}" added`);
      added++;
    }
  }

  console.log(`\n📊 Summary: ${added} added, ${skipped} skipped`);
  console.log('✨ Done!');
}

seedPortfolioCategories().catch(console.error);
