/**
 * Debug script to check projects data
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Get Sarah Chen's member ID
  const { data: sarah } = await supabase
    .from('team_members')
    .select('id, name')
    .eq('name', 'Sarah Chen')
    .single();
  
  console.log('\n👤 Sarah Chen:', sarah);
  
  // Get her projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('member_id', sarah?.id);
  
  console.log('\n📋 Projects for Sarah:', projects?.length || 0);
  if (error) {
    console.log('Error:', error);
  }
  if (projects && projects.length > 0) {
    projects.forEach(p => console.log('  -', p.name, '(' + p.status + ')'));
  } else {
    console.log('  No projects found');
  }
  
  // Check all projects in the org
  const { data: allProjects } = await supabase
    .from('projects')
    .select('*, team_members(name)')
    .order('created_at');
  
  console.log('\n📊 All projects in DB:', allProjects?.length || 0);
  if (allProjects && allProjects.length > 0) {
    allProjects.forEach(p => console.log(`  - ${p.name} → ${(p.team_members as any)?.name}`));
  }
}

check();
