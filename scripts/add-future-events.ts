import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addFutureEvents() {
  console.log('Adding future events...\n');

  // Use the known org_id that has team members
  const orgId = '985cf57a-b974-4f11-a0f5-2d496eaafb00';
  console.log('Using org_id:', orgId);

  const { data: members } = await supabase
    .from('team_members')
    .select('id, name')
    .eq('org_id', orgId)
    .order('name');

  if (!members || members.length === 0) {
    console.error('No team members found');
    process.exit(1);
  }

  console.log('Team members:', members.map(m => m.name).join(', '));

  // Add future events
  const futureEvents = [
    { org_id: orgId, member_id: members[0].id, name: 'AI Innovation Summit 2026', type: 'Speaker', date: '2026-02-15' },
    { org_id: orgId, member_id: members[1].id, name: 'Cloud & AI Conference', type: 'Attended', date: '2026-03-10' },
    { org_id: orgId, member_id: members[2].id, name: 'Women in Tech Summit', type: 'Speaker', date: '2026-01-25' },
    { org_id: orgId, member_id: members[3].id, name: 'Developer Days 2026', type: 'Attended', date: '2026-04-05' },
    { org_id: orgId, member_id: members[4].id, name: 'Consulting Excellence Forum', type: 'Speaker', date: '2026-02-28' },
  ];

  const { data: inserted, error } = await supabase
    .from('events')
    .insert(futureEvents)
    .select();

  if (error) {
    console.error('Error adding events:', error);
    process.exit(1);
  }

  console.log(`\n✅ Added ${inserted?.length || 0} future events:`);
  inserted?.forEach(e => {
    console.log(`   - ${e.date}: ${e.name} (${e.type})`);
  });
}

addFutureEvents().catch(console.error);
