import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function disableRLS() {
  console.log('Disabling RLS on team_members table...');
  
  const { error } = await supabase.rpc('disable_rls_for_table', {
    table_name: 'team_members'
  });
  
  if (error) {
    console.log('RLS function not available, trying direct approach...');
    console.log('You need to manually disable RLS in Supabase dashboard:');
    console.log('1. Go to your Supabase project');
    console.log('2. Click on "Authentication" > "Policies"');
    console.log('3. Find "team_members" table');
    console.log('4. Click the toggle to disable RLS');
    return;
  }
  
  console.log('✅ RLS disabled on team_members');
}

disableRLS().catch(console.error);
