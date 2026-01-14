/**
 * Check user profile and team member linking
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
  const email = process.argv[2] || 'djohny@lineasolutions.com';
  
  console.log(`\n🔍 Checking account: ${email}\n`);
  
  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, org_id')
    .eq('email', email)
    .single();
  
  if (profileError) {
    console.log('❌ Profile not found:', profileError.message);
    return;
  }
  
  console.log('📋 Your Profile:');
  console.log(`   - ID: ${profile.id}`);
  console.log(`   - Email: ${profile.email}`);
  console.log(`   - Name: ${profile.full_name || '(not set)'}`);
  console.log(`   - Role: ${profile.role}`);
  console.log(`   - Org ID: ${profile.org_id}`);
  
  // Get org name
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', profile.org_id)
    .single();
  
  console.log(`   - Org Name: ${org?.name || 'Unknown'}`);
  
  // Get linked team member
  const { data: member } = await supabase
    .from('team_members')
    .select('id, name, role_title')
    .eq('linked_profile_id', profile.id)
    .single();
  
  console.log('\n👤 Linked Team Member:');
  if (member) {
    console.log(`   - Name: ${member.name}`);
    console.log(`   - Role: ${member.role_title}`);
    console.log(`   - ID: ${member.id}`);
  } else {
    console.log('   (No team member linked to this profile)');
  }
  
  // Count team members in same org
  const { count } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', profile.org_id);
  
  console.log(`\n📊 Team members in your org: ${count}`);
}

check();
