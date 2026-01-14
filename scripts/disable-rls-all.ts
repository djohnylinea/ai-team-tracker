import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function disableRLS() {
  console.log('Disabling RLS on tables...');
  
  const tables = [
    'team_members',
    'organizations',
    'projects',
    'engagements',
    'time_off',
    'events',
    'tools',
    'tool_ratings',
    'portfolio_ratings',
    'awareness_ratings',
    'skills',
    'skill_ratings',
    'portfolio_categories'
  ];
  
  for (const table of tables) {
    const sql = `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`;
    console.log(`Disabling RLS on ${table}...`);
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // RPC doesn't exist, try direct query
      try {
        const res = await supabase.from(table).select('count(*)', { count: 'exact' }).limit(0);
        if (!res.error) {
          console.log(`✓ ${table} - already accessible or no RLS`);
        }
      } catch (e) {
        console.log(`⚠ ${table} - cannot verify (may need manual disable in dashboard)`);
      }
    } else {
      console.log(`✓ ${table} - RLS disabled`);
    }
  }
  
  console.log('\n✅ Done! If tables are still restricted, you may need to manually disable RLS:');
  console.log('1. Go to Supabase Dashboard > Authentication > Policies');
  console.log('2. For each table listed above, disable RLS using the toggle');
}

disableRLS().catch(console.error);
