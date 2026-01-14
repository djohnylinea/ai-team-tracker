import { createClient } from '@/lib/supabase/server';
import { DashboardClient } from '@/components/DashboardClient';
import type { TeamMember } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get first organization (create if missing)
  let { data: org } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single();

  if (!org) {
    // Create a default organization if none exists
    const { data: newOrg } = await supabase
      .from('organizations')
      .insert({ name: 'Default Organization' })
      .select('id')
      .single();
    org = newOrg;
  }

  const orgId = org?.id || '';

  // Fetch all team members for this organization
  const { data: dbMembers, error } = await supabase
    .from('team_members')
    .select('id, name, role_title, avatar_initials')
    .eq('org_id', orgId)
    .order('name');

  if (error) {
    console.error('Error fetching team members:', error);
  }

  // Transform snake_case DB columns to camelCase for frontend
  const members: TeamMember[] = (dbMembers || []).map((m) => ({
    id: m.id,
    name: m.name,
    roleTitle: m.role_title,
    avatarInitials: m.avatar_initials,
  }));

  return (
    <DashboardClient
      userEmail="Supervisor (Local Mode)"
      members={members}
      orgId={orgId}
    />
  );
}
