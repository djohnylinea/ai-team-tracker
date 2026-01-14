/**
 * Link a Supabase Auth user to a profile and organization.
 * 
 * Usage: npx tsx scripts/link-user.ts <email>
 * 
 * This script:
 * 1. Finds the auth user by email
 * 2. Creates/updates a profile linking them to the first org
 * 3. Gives them ADMIN role
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: npx tsx scripts/link-user.ts <email>');
    process.exit(1);
  }

  console.log(`🔗 Linking user: ${email}\n`);

  // 1. Find the auth user
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error listing users:', usersError);
    process.exit(1);
  }

  const authUser = users.find(u => u.email === email);
  
  if (!authUser) {
    console.error(`User not found with email: ${email}`);
    console.log('Available users:', users.map(u => u.email).join(', '));
    process.exit(1);
  }

  console.log(`✅ Found auth user: ${authUser.id}`);

  // 2. Get the organization that has team members
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (orgError || !org) {
    console.error('Error finding organization:', orgError);
    process.exit(1);
  }

  console.log(`✅ Found organization: ${org.name} (${org.id})`);

  // 3. Create/update profile for this user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authUser.id,
      org_id: org.id,
      email: email,
      full_name: email.split('@')[0],
      role: 'ADMIN',
    }, { onConflict: 'id' })
    .select()
    .single();

  if (profileError) {
    console.error('Error creating/updating profile:', profileError);
    process.exit(1);
  }

  console.log(`✅ Profile created/updated with role: ${profile.role}`);

  // 4. Optionally link to a team member
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('id, name')
    .eq('org_id', org.id)
    .is('linked_profile_id', null)
    .limit(1)
    .single();

  if (teamMember) {
    const { error: linkError } = await supabase
      .from('team_members')
      .update({ linked_profile_id: authUser.id })
      .eq('id', teamMember.id);

    if (!linkError) {
      console.log(`✅ Linked to team member: ${teamMember.name}`);
    }
  }

  console.log('\n🎉 User linked successfully!');
  console.log('You can now log in and see all team members.');
}

main();
