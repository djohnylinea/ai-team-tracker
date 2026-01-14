import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixOrg() {
  console.log('Checking organizations...');
  
  // Get all organizations
  const { data: orgs } = await supabase.from('organizations').select('*');
  console.log(`Found ${orgs?.length || 0} organizations`);
  
  if (!orgs || orgs.length === 0) {
    console.log('No organizations found. Running seed...');
    return;
  }

  // Get all team members
  const { data: members } = await supabase.from('team_members').select('id, name, org_id');
  console.log(`Found ${members?.length || 0} team members`);
  
  // Find org with most members
  const orgCounts: Record<string, number> = {};
  members?.forEach(m => {
    orgCounts[m.org_id] = (orgCounts[m.org_id] || 0) + 1;
  });
  
  // Get the org with most members, or latest one
  let targetOrgId = orgs[orgs.length - 1].id;
  let maxCount = 0;
  for (const [orgId, count] of Object.entries(orgCounts)) {
    if (count > maxCount) {
      maxCount = count;
      targetOrgId = orgId;
    }
  }
  
  console.log(`Target org: ${targetOrgId} (has ${maxCount} members)`);
  
  // Delete all other organizations (cascade will handle related data)
  for (const org of orgs) {
    if (org.id !== targetOrgId) {
      console.log(`Deleting org: ${org.id} (${org.name})`);
      await supabase.from('organizations').delete().eq('id', org.id);
    }
  }
  
  // Verify
  const { data: finalOrgs } = await supabase.from('organizations').select('*');
  const { data: finalMembers } = await supabase.from('team_members').select('id, name');
  
  console.log('\n✅ Done!');
  console.log(`Organizations: ${finalOrgs?.length}`);
  console.log(`Team members: ${finalMembers?.length}`);
  
  if (finalMembers && finalMembers.length > 0) {
    console.log('Team members:', finalMembers.map(m => m.name).join(', '));
  }
}

fixOrg().catch(console.error);
