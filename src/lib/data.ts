import { createClient } from '@/lib/supabase/client';

// =============================================
// TYPES
// =============================================

export interface PortfolioCategory {
  id: string;
  orgId: string;
  key: string;
  name: string;
  description: string | null;
}

export interface PortfolioRating {
  id: string;
  categoryId: string;
  categoryKey: string;
  categoryName: string;
  rating: number;
}

export interface MemberOverview {
  activeProjects: number;
  totalProjects: number;
  allocation: number;
  engagementCount: number;
  portfolioAvg: number;
  portfolioRatings: PortfolioRating[];
}

export interface ToolRating {
  id: string;
  toolId: string;
  toolName: string;
  categoryKey: string;
  rating: number;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  source: string | null;
  reusable: string;
  status: string;
}

export interface Engagement {
  id: string;
  client: string;
  allocationPercent: number;
  startDate: string;
  endDate: string | null;
}

// TimeOff interface is defined later in the file with TimeOffType

export interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  topic: string | null;
  notes: string | null;
}

export interface AwarenessRating {
  areaKey: string;
  rating: number;
}

// =============================================
// FETCH FUNCTIONS
// =============================================

/**
 * Fetch overview data for a team member
 */
export async function fetchMemberOverview(memberId: string): Promise<MemberOverview> {
  const supabase = createClient();
  
  // Fetch projects count
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, status')
    .eq('member_id', memberId);

  console.log('fetchMemberOverview - projects:', projects?.length, 'error:', projectsError);

  const activeProjects = projects?.filter(p => p.status === 'Active').length || 0;
  const totalProjects = projects?.length || 0;

  // Fetch engagements and calculate allocation
  const { data: engagements } = await supabase
    .from('engagements')
    .select('id, allocation_percent')
    .eq('member_id', memberId);

  const engagementCount = engagements?.length || 0;
  const allocation = engagements?.reduce((sum, e) => sum + (e.allocation_percent || 0), 0) || 0;

  // Fetch portfolio ratings with category info
  const { data: portfolioData } = await supabase
    .from('portfolio_ratings')
    .select(`
      id,
      category_id,
      rating,
      portfolio_categories!inner (
        key,
        name
      )
    `)
    .eq('member_id', memberId)
    .gt('rating', 0); // Only ratings > 0

  const portfolioRatings: PortfolioRating[] = (portfolioData || []).map((r: any) => ({
    id: r.id,
    categoryId: r.category_id,
    categoryKey: r.portfolio_categories?.key || '',
    categoryName: r.portfolio_categories?.name || '',
    rating: r.rating,
  }));

  // Calculate portfolio average (only non-zero ratings)
  const portfolioAvg = portfolioRatings.length > 0
    ? portfolioRatings.reduce((sum, r) => sum + r.rating, 0) / portfolioRatings.length
    : 0;

  return {
    activeProjects,
    totalProjects,
    allocation,
    engagementCount,
    portfolioAvg,
    portfolioRatings,
  };
}

/**
 * Fetch tool ratings for a team member
 */
export async function fetchToolRatings(memberId: string): Promise<ToolRating[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tool_ratings')
    .select(`
      id,
      tool_id,
      rating,
      tools (
        id,
        tool_name,
        category_key
      )
    `)
    .eq('member_id', memberId);

  if (error) {
    console.error('Error fetching tool ratings:', error);
    return [];
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    toolId: r.tool_id,
    toolName: r.tools?.tool_name || '',
    categoryKey: r.tools?.category_key || '',
    rating: r.rating,
  }));
}

/**
 * Fetch projects for a team member
 */
export async function fetchProjects(memberId: string): Promise<Project[]> {
  const supabase = createClient();
  console.log('fetchProjects called for member:', memberId);
  
  // Check auth status
  const { data: { user } } = await supabase.auth.getUser();
  console.log('fetchProjects - auth user:', user?.id);
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  console.log('fetchProjects - data:', data, 'error:', error, 'error code:', error?.code, 'error message:', error?.message);

  if (error) {
    console.error('Error fetching projects:', JSON.stringify(error));
    return [];
  }

  console.log('fetchProjects result:', data?.length, 'projects');

  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    source: p.source,
    reusable: p.reusable,
    status: p.status,
  }));
}

/**
 * Fetch engagements for a team member
 */
export async function fetchEngagements(memberId: string): Promise<Engagement[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('engagements')
    .select('*')
    .eq('member_id', memberId)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching engagements:', error);
    return [];
  }

  return (data || []).map(e => ({
    id: e.id,
    client: e.client,
    allocationPercent: e.allocation_percent,
    startDate: e.start_date,
    endDate: e.end_date,
  }));
}

/**
 * Fetch time off for a team member
 */
export async function fetchTimeOff(memberId: string): Promise<TimeOff[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('time_off')
    .select('*')
    .eq('member_id', memberId)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching time off:', error);
    return [];
  }

  return (data || []).map(t => ({
    id: t.id,
    memberId: t.member_id,
    type: t.type as TimeOffType,
    startDate: t.start_date,
    endDate: t.end_date,
    notes: t.notes || '',
  }));
}

/**
 * Fetch events for a team member
 */
export async function fetchEvents(memberId: string): Promise<Event[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('member_id', memberId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return (data || []).map(e => ({
    id: e.id,
    name: e.name,
    type: e.type,
    date: e.date,
    topic: e.topic,
    notes: e.notes,
  }));
}

// Extended types for calendar view
export interface EventWithMember extends Event {
  memberName: string;
  eventType: string;
  title: string;
}

export interface EngagementWithMember extends Engagement {
  memberName: string;
}

/**
 * Fetch all events for an organization (for calendar view)
 */
export async function fetchAllEvents(orgId: string): Promise<EventWithMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .select(`
      id, name, type, date,
      team_members!inner(name)
    `)
    .eq('org_id', orgId)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching all events:', error);
    return [];
  }

  return (data || []).map((e: Record<string, unknown>) => ({
    id: e.id as string,
    name: e.name as string,
    type: e.type as string,
    date: e.date as string,
    topic: null,
    notes: null,
    memberName: (e.team_members as Record<string, string>)?.name || '',
    eventType: e.type as string,
    title: e.name as string,
  }));
}

/**
 * Fetch all engagements for an organization (for calendar view)
 */
export async function fetchAllEngagements(orgId: string): Promise<EngagementWithMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('engagements')
    .select(`
      id, client, allocation_percent, start_date, end_date,
      team_members!inner(name)
    `)
    .eq('org_id', orgId)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching all engagements:', error);
    return [];
  }

  return (data || []).map((e: Record<string, unknown>) => ({
    id: e.id as string,
    client: e.client as string,
    allocationPercent: e.allocation_percent as number,
    startDate: e.start_date as string,
    endDate: e.end_date as string,
    memberName: (e.team_members as Record<string, string>)?.name || '',
  }));
}

/**
 * Fetch awareness ratings for a team member
 */
export async function fetchAwarenessRatings(memberId: string): Promise<AwarenessRating[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('awareness_ratings')
    .select('area_key, rating')
    .eq('member_id', memberId);

  if (error) {
    console.error('Error fetching awareness ratings:', error);
    return [];
  }

  return (data || []).map(r => ({
    areaKey: r.area_key,
    rating: r.rating,
  }));
}

// ===================
// RATING MUTATIONS
// ===================

/**
 * Update a tool rating (upsert - insert or update)
 */
export async function updateToolRating(
  memberId: string,
  orgId: string,
  toolId: string,
  rating: number
): Promise<boolean> {
  const supabase = createClient();
  
  // First check if rating exists
  const { data: existing } = await supabase
    .from('tool_ratings')
    .select('id')
    .eq('member_id', memberId)
    .eq('tool_id', toolId)
    .single();
  
  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('tool_ratings')
      .update({ rating })
      .eq('id', existing.id);
    
    if (error) {
      console.error('Error updating tool rating:', error.message);
      return false;
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from('tool_ratings')
      .insert({
        org_id: orgId,
        member_id: memberId,
        tool_id: toolId,
        rating,
      });
    
    if (error) {
      console.error('Error creating tool rating:', error.message);
      return false;
    }
  }
  
  return true;
}

/**
 * Update an awareness rating (upsert - insert or update)
 */
export async function updateAwarenessRating(
  memberId: string,
  orgId: string,
  areaKey: string,
  rating: number
): Promise<boolean> {
  const supabase = createClient();
  
  // First check if rating exists
  const { data: existing } = await supabase
    .from('awareness_ratings')
    .select('id')
    .eq('member_id', memberId)
    .eq('area_key', areaKey)
    .single();
  
  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('awareness_ratings')
      .update({ rating })
      .eq('id', existing.id);
    
    if (error) {
      console.error('Error updating awareness rating:', error.message);
      return false;
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from('awareness_ratings')
      .insert({
        org_id: orgId,
        member_id: memberId,
        area_key: areaKey,
        rating,
      });
    
    if (error) {
      console.error('Error creating awareness rating:', error.message);
      return false;
    }
  }
  
  return true;
}

// ===================
// MUTATION FUNCTIONS
// ===================

/**
 * Create a new project
 */
export async function createProject(
  memberId: string,
  orgId: string,
  project: Omit<Project, 'id'>
): Promise<Project | null> {
  const supabase = createClient();
  
  console.log('Creating project with:', { memberId, orgId, project });
  
  const { data, error } = await supabase
    .from('projects')
    .insert({
      org_id: orgId,
      member_id: memberId,
      name: project.name,
      type: project.type,
      source: project.source,
      reusable: project.reusable,
      status: project.status,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error.message, error.code, error.details, error.hint);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    source: data.source,
    reusable: data.reusable,
    status: data.status,
  };
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id'>>
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('projects')
    .update({
      name: updates.name,
      type: updates.type,
      source: updates.source,
      reusable: updates.reusable,
      status: updates.status,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating project:', error);
    return false;
  }

  return true;
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }

  return true;
}

/**
 * Create a new engagement
 */
export async function createEngagement(
  memberId: string,
  orgId: string,
  engagement: Omit<Engagement, 'id'>
): Promise<Engagement | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('engagements')
    .insert({
      org_id: orgId,
      member_id: memberId,
      client: engagement.client,
      start_date: engagement.startDate,
      end_date: engagement.endDate || null,
      allocation_percent: engagement.allocationPercent,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating engagement:', error);
    return null;
  }

  return {
    id: data.id,
    client: data.client,
    startDate: data.start_date,
    endDate: data.end_date,
    allocationPercent: data.allocation_percent,
  };
}

/**
 * Update an existing engagement
 */
export async function updateEngagement(
  id: string,
  updates: Partial<Omit<Engagement, 'id'>>
): Promise<boolean> {
  const supabase = createClient();
  
  const updateData: Record<string, unknown> = {};
  if (updates.client !== undefined) updateData.client = updates.client;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
  if (updates.allocationPercent !== undefined) updateData.allocation_percent = updates.allocationPercent;

  const { error } = await supabase
    .from('engagements')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating engagement:', error);
    return false;
  }

  return true;
}

/**
 * Delete an engagement
 */
export async function deleteEngagement(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('engagements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting engagement:', error);
    return false;
  }

  return true;
}

/**
 * Create a new event
 */
export async function createEvent(
  memberId: string,
  orgId: string,
  event: Omit<Event, 'id'>
): Promise<Event | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .insert({
      org_id: orgId,
      member_id: memberId,
      name: event.name,
      type: event.type,
      date: event.date,
      topic: event.topic || null,
      notes: event.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    date: data.date,
    topic: data.topic,
    notes: data.notes,
  };
}

/**
 * Update an existing event
 */
export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id'>>
): Promise<boolean> {
  const supabase = createClient();
  
  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.date !== undefined) updateData.date = updates.date;
  if (updates.topic !== undefined) updateData.topic = updates.topic;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const { error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating event:', error);
    return false;
  }

  return true;
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    return false;
  }

  return true;
}

// ===================
// TEAM DASHBOARD DATA
// ===================

export interface TeamStats {
  totalMembers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEngagements: number;
  avgAllocation: number;
  totalEvents: number;
}

export interface ProjectsByType {
  type: string;
  count: number;
}

export interface ProjectsByStatus {
  status: string;
  count: number;
}

export interface MemberAllocation {
  memberId: string;
  memberName: string;
  allocation: number;
  engagementCount: number;
}

export interface UpcomingEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  memberName: string;
}

/**
 * Fetch team-wide statistics
 */
export async function fetchTeamStats(): Promise<TeamStats> {
  const supabase = createClient();
  
  // Fetch team members count
  const { data: members } = await supabase
    .from('team_members')
    .select('id');
  
  // Fetch all projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, status');
  
  // Fetch all engagements
  const { data: engagements } = await supabase
    .from('engagements')
    .select('id, allocation_percent');
  
  // Fetch all events
  const { data: events } = await supabase
    .from('events')
    .select('id');
  
  const totalMembers = members?.length || 0;
  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'Active' || p.status === 'In Progress').length || 0;
  const completedProjects = projects?.filter(p => p.status === 'Completed').length || 0;
  const totalEngagements = engagements?.length || 0;
  const totalAllocation = engagements?.reduce((sum, e) => sum + (e.allocation_percent || 0), 0) || 0;
  const avgAllocation = totalMembers > 0 ? Math.round(totalAllocation / totalMembers) : 0;
  const totalEvents = events?.length || 0;

  return {
    totalMembers,
    totalProjects,
    activeProjects,
    completedProjects,
    totalEngagements,
    avgAllocation,
    totalEvents,
  };
}

/**
 * Fetch projects grouped by type
 */
export async function fetchProjectsByType(): Promise<ProjectsByType[]> {
  const supabase = createClient();
  
  const { data: projects } = await supabase
    .from('projects')
    .select('type');
  
  if (!projects) return [];
  
  const typeCounts: Record<string, number> = {};
  projects.forEach(p => {
    typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
  });
  
  return Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
}

/**
 * Fetch projects grouped by status
 */
export async function fetchProjectsByStatus(): Promise<ProjectsByStatus[]> {
  const supabase = createClient();
  
  const { data: projects } = await supabase
    .from('projects')
    .select('status');
  
  if (!projects) return [];
  
  const statusCounts: Record<string, number> = {};
  projects.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });
  
  return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
}

/**
 * Fetch allocation summary per team member
 */
export async function fetchMemberAllocations(): Promise<MemberAllocation[]> {
  const supabase = createClient();
  
  const { data: members } = await supabase
    .from('team_members')
    .select('id, name');
  
  if (!members) return [];
  
  const { data: engagements } = await supabase
    .from('engagements')
    .select('member_id, allocation_percent');
  
  return members.map(m => {
    const memberEngagements = engagements?.filter(e => e.member_id === m.id) || [];
    const allocation = memberEngagements.reduce((sum, e) => sum + (e.allocation_percent || 0), 0);
    return {
      memberId: m.id,
      memberName: m.name,
      allocation,
      engagementCount: memberEngagements.length,
    };
  });
}

/**
 * Fetch upcoming events across all members
 */
export async function fetchUpcomingEvents(limit: number = 5): Promise<UpcomingEvent[]> {
  const supabase = createClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data: events } = await supabase
    .from('events')
    .select('id, name, type, date, member_id')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(limit);
  
  if (!events || events.length === 0) return [];
  
  // Get member names
  const memberIds = [...new Set(events.map(e => e.member_id))];
  const { data: members } = await supabase
    .from('team_members')
    .select('id, name')
    .in('id', memberIds);
  
  const memberMap = new Map(members?.map(m => [m.id, m.name]) || []);
  
  return events.map(e => ({
    id: e.id,
    name: e.name,
    type: e.type,
    date: e.date,
    memberName: memberMap.get(e.member_id) || 'Unknown',
  }));
}

// =============================================
// TEAM MEMBER CRUD OPERATIONS
// =============================================

export interface TeamMemberData {
  id: string;
  name: string;
  roleTitle: string;
  avatarInitials: string;
}

/**
 * Fetch all team members
 */
export async function fetchAllTeamMembers(): Promise<TeamMemberData[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('team_members')
    .select('id, name, role_title, avatar_initials')
    .order('name');
  
  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
  
  return (data || []).map(m => ({
    id: m.id,
    name: m.name,
    roleTitle: m.role_title,
    avatarInitials: m.avatar_initials,
  }));
}

/**
 * Create a new team member
 */
export async function createTeamMember(
  orgId: string,
  member: Omit<TeamMemberData, 'id'>
): Promise<TeamMemberData | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      org_id: orgId,
      name: member.name,
      role_title: member.roleTitle,
      avatar_initials: member.avatarInitials,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating team member:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    roleTitle: data.role_title,
    avatarInitials: data.avatar_initials,
  };
}

/**
 * Update an existing team member
 */
export async function updateTeamMember(
  id: string,
  updates: Partial<Omit<TeamMemberData, 'id'>>
): Promise<boolean> {
  const supabase = createClient();
  
  const updateData: Record<string, string> = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.roleTitle) updateData.role_title = updates.roleTitle;
  if (updates.avatarInitials) updateData.avatar_initials = updates.avatarInitials;
  
  const { error } = await supabase
    .from('team_members')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating team member:', error);
    return false;
  }

  return true;
}

/**
 * Delete a team member
 */
export async function deleteTeamMember(id: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting team member:', error);
    return false;
  }

  return true;
}

// =============================================
// TOOL CATALOG MANAGEMENT
// =============================================

export interface Tool {
  id: string;
  toolName: string;
  categoryKey: string;
}

/**
 * Fetch all tools in the org catalog
 */
export async function fetchAllTools(orgId: string): Promise<Tool[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('tools')
    .select('id, tool_name, category_key')
    .eq('org_id', orgId)
    .order('tool_name');
  
  if (error) {
    console.error('Error fetching tools:', error);
    return [];
  }
  
  return (data || []).map(t => ({
    id: t.id,
    toolName: t.tool_name,
    categoryKey: t.category_key,
  }));
}

/**
 * Add a new tool to the catalog and create rating rows for all members with rating=0
 */
export async function createTool(
  orgId: string,
  toolName: string,
  categoryKey: string
): Promise<Tool | null> {
  const supabase = createClient();
  
  // 1. Create the tool
  const { data: tool, error: toolError } = await supabase
    .from('tools')
    .insert({
      org_id: orgId,
      tool_name: toolName,
      category_key: categoryKey,
    })
    .select()
    .single();

  if (toolError) {
    console.error('Error creating tool:', toolError);
    return null;
  }

  // 2. Get all team members in this org
  const { data: members } = await supabase
    .from('team_members')
    .select('id')
    .eq('org_id', orgId);

  // 3. Create rating rows for all members with rating=0
  if (members && members.length > 0) {
    const ratingsToInsert = members.map(m => ({
      org_id: orgId,
      member_id: m.id,
      tool_id: tool.id,
      rating: 0,
    }));

    const { error: ratingsError } = await supabase
      .from('tool_ratings')
      .insert(ratingsToInsert);

    if (ratingsError) {
      console.error('Error creating tool ratings:', ratingsError);
      // Tool was created, ratings failed - not critical
    }
  }

  return {
    id: tool.id,
    toolName: tool.tool_name,
    categoryKey: tool.category_key,
  };
}

/**
 * Delete a tool from the catalog (cascades to ratings)
 */
export async function deleteTool(toolId: string): Promise<boolean> {
  const supabase = createClient();
  
  // Delete ratings first (if no cascade)
  await supabase.from('tool_ratings').delete().eq('tool_id', toolId);
  
  const { error } = await supabase
    .from('tools')
    .delete()
    .eq('id', toolId);

  if (error) {
    console.error('Error deleting tool:', error);
    return false;
  }

  return true;
}

/**
 * Fetch tool ratings INCLUDING rating=0 (for edit mode)
 */
export async function fetchAllToolRatings(memberId: string, orgId: string): Promise<ToolRating[]> {
  const supabase = createClient();
  
  // Get all tools in org
  const { data: tools } = await supabase
    .from('tools')
    .select('id, tool_name, category_key')
    .eq('org_id', orgId)
    .order('tool_name');

  if (!tools || tools.length === 0) return [];

  // Get ratings for this member
  const { data: ratings } = await supabase
    .from('tool_ratings')
    .select('id, tool_id, rating')
    .eq('member_id', memberId);

  const ratingsMap = new Map(ratings?.map(r => [r.tool_id, { id: r.id, rating: r.rating }]) || []);

  return tools.map(t => ({
    id: ratingsMap.get(t.id)?.id || `new-${t.id}`,
    toolId: t.id,
    toolName: t.tool_name,
    categoryKey: t.category_key,
    rating: ratingsMap.get(t.id)?.rating || 0,
  }));
}

// =============================================
// AWARENESS AREA MANAGEMENT
// =============================================

export interface AwarenessArea {
  key: string;
  label: string;
  description: string;
}

export interface AwarenessRatingFull extends AwarenessRating {
  areaLabel: string;
  areaDescription: string;
  areaId: string; // Same as areaKey since key is primary key
}

/**
 * Fetch all awareness areas from the database (shared across all orgs)
 */
export async function fetchAllAwarenessAreas(_orgId: string): Promise<AwarenessArea[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('awareness_areas')
    .select('key, label, description')
    .order('label');
  
  if (error) {
    console.error('Error fetching awareness areas:', error);
    return [];
  }
  
  return (data || []).map(a => ({
    key: a.key,
    label: a.label,
    description: a.description || '',
  }));
}

/**
 * Create a new awareness area and ratings for all members
 */
export async function createAwarenessArea(
  orgId: string,
  areaKey: string,
  label: string,
  description: string
): Promise<AwarenessArea | null> {
  const supabase = createClient();
  
  // Insert into awareness_areas table (shared, uses key as primary key)
  const { data: area, error: areaError } = await supabase
    .from('awareness_areas')
    .insert({
      key: areaKey,
      label: label,
      description: description,
    })
    .select()
    .single();

  if (areaError) {
    console.error('Error creating awareness area:', areaError);
    return null;
  }

  // Get all team members and create rating rows
  const { data: members } = await supabase
    .from('team_members')
    .select('id')
    .eq('org_id', orgId);

  if (members && members.length > 0) {
    const ratingsToInsert = members.map(m => ({
      org_id: orgId,
      member_id: m.id,
      area_key: areaKey,
      rating: 1, // Minimum rating since schema requires >= 1
    }));

    await supabase.from('awareness_ratings').insert(ratingsToInsert);
  }

  return {
    key: area.key,
    label: area.label,
    description: area.description || '',
  };
}

/**
 * Delete an awareness area (uses key as primary key)
 */
export async function deleteAwarenessArea(areaId: string, areaKey: string): Promise<boolean> {
  const supabase = createClient();
  
  // Delete ratings first
  await supabase.from('awareness_ratings').delete().eq('area_key', areaKey);
  
  // Delete the area by key (areaId is same as areaKey in this schema)
  const { error } = await supabase
    .from('awareness_areas')
    .delete()
    .eq('key', areaKey);

  if (error) {
    console.error('Error deleting awareness area:', error);
    return false;
  }

  return true;
}

/**
 * Fetch awareness ratings with area metadata (for edit mode - includes unrated)
 */
export async function fetchAllAwarenessRatings(
  memberId: string,
  orgId: string
): Promise<AwarenessRatingFull[]> {
  const supabase = createClient();
  
  // Get all awareness areas (shared catalog)
  const areas = await fetchAllAwarenessAreas(orgId);
  
  if (areas.length === 0) return [];

  // Get ratings for this member
  const { data: ratings } = await supabase
    .from('awareness_ratings')
    .select('id, area_key, rating')
    .eq('member_id', memberId);

  const ratingsMap = new Map(ratings?.map(r => [r.area_key, { id: r.id, rating: r.rating }]) || []);

  return areas.map(a => ({
    id: ratingsMap.get(a.key)?.id || `new-${a.key}`,
    areaId: a.key, // key is the primary key
    areaKey: a.key,
    areaLabel: a.label,
    areaDescription: a.description,
    rating: ratingsMap.get(a.key)?.rating || 0,
    memberId: memberId,
    updatedAt: '',
  }));
}

// =============================================
// TIME OFF MANAGEMENT
// =============================================

// Match the database enum values: 'Vacation', 'Conference', 'Sick Leave', 'Personal', 'Other'
export type TimeOffType = 'Vacation' | 'Conference' | 'Sick Leave' | 'Personal' | 'Other';

export interface TimeOff {
  id: string;
  memberId: string;
  memberName?: string;
  startDate: string;
  endDate: string;
  type: TimeOffType;
  notes: string;
}

export const TIME_OFF_TYPES: { value: TimeOffType; label: string; color: string }[] = [
  { value: 'Vacation', label: 'Vacation', color: '#22c55e' },
  { value: 'Sick Leave', label: 'Sick Leave', color: '#f97316' },
  { value: 'Personal', label: 'Personal', color: '#3b82f6' },
  { value: 'Conference', label: 'Conference', color: '#a855f7' },
  { value: 'Other', label: 'Other', color: '#6b7280' },
];

/**
 * Fetch time off for a specific member
 */
export async function fetchTimeOffByMember(memberId: string): Promise<TimeOff[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('time_off')
    .select('id, member_id, start_date, end_date, type, notes')
    .eq('member_id', memberId)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching time off:', error);
    return [];
  }

  return (data || []).map(t => ({
    id: t.id,
    memberId: t.member_id,
    startDate: t.start_date,
    endDate: t.end_date,
    type: t.type as TimeOffType,
    notes: t.notes || '',
  }));
}

/**
 * Fetch all time off for an organization (for calendar view)
 */
export async function fetchAllTimeOff(orgId: string): Promise<TimeOff[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('time_off')
    .select(`
      id, member_id, start_date, end_date, type, notes,
      team_members!inner(name)
    `)
    .eq('org_id', orgId)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching all time off:', error);
    return [];
  }

  return (data || []).map((t: Record<string, unknown>) => ({
    id: t.id as string,
    memberId: t.member_id as string,
    memberName: (t.team_members as Record<string, string>)?.name || '',
    startDate: t.start_date as string,
    endDate: t.end_date as string,
    type: t.type as TimeOffType,
    notes: (t.notes as string) || '',
  }));
}

/**
 * Create a new time off entry
 */
export async function createTimeOff(
  orgId: string,
  memberId: string,
  startDate: string,
  endDate: string,
  type: TimeOffType,
  notes: string
): Promise<TimeOff | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('time_off')
    .insert({
      org_id: orgId,
      member_id: memberId,
      start_date: startDate,
      end_date: endDate,
      type: type,
      notes: notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating time off:', error);
    return null;
  }

  return {
    id: data.id,
    memberId: data.member_id,
    startDate: data.start_date,
    endDate: data.end_date,
    type: data.type as TimeOffType,
    notes: data.notes || '',
  };
}

/**
 * Update a time off entry
 */
export async function updateTimeOff(
  id: string,
  updates: Partial<{
    startDate: string;
    endDate: string;
    type: TimeOffType;
    notes: string;
  }>
): Promise<boolean> {
  const supabase = createClient();
  
  const updateData: Record<string, unknown> = {};
  if (updates.startDate) updateData.start_date = updates.startDate;
  if (updates.endDate) updateData.end_date = updates.endDate;
  if (updates.type) updateData.type = updates.type;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const { error } = await supabase
    .from('time_off')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating time off:', error);
    return false;
  }

  return true;
}

/**
 * Delete a time off entry
 */
export async function deleteTimeOff(id: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('time_off')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting time off:', error);
    return false;
  }

  return true;
}

// =============================================
// PORTFOLIO CATEGORY FUNCTIONS
// =============================================

/**
 * Fetch all portfolio categories for an organization
 */
export async function fetchPortfolioCategories(orgId: string): Promise<PortfolioCategory[]> {
  const supabase = createClient();
  
  console.log('fetchPortfolioCategories: querying for org_id:', orgId);
  
  const { data, error } = await supabase
    .from('portfolio_categories')
    .select('*')
    .eq('org_id', orgId)
    .order('name');

  console.log('fetchPortfolioCategories: result:', { data, error });

  if (error) {
    console.error('Error fetching portfolio categories:', error);
    return [];
  }

  return (data || []).map(c => ({
    id: c.id,
    orgId: c.org_id,
    key: c.key,
    name: c.name,
    description: c.description,
  }));
}

/**
 * Create a new portfolio category
 */
export async function createPortfolioCategory(
  orgId: string,
  key: string,
  name: string,
  description?: string
): Promise<PortfolioCategory | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('portfolio_categories')
    .insert({
      org_id: orgId,
      key: key.toUpperCase().replace(/\s+/g, '_'),
      name,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating portfolio category:', error);
    return null;
  }

  return {
    id: data.id,
    orgId: data.org_id,
    key: data.key,
    name: data.name,
    description: data.description,
  };
}

/**
 * Update a portfolio category
 */
export async function updatePortfolioCategory(
  id: string,
  updates: { name?: string; description?: string }
): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('portfolio_categories')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating portfolio category:', error);
    return false;
  }

  return true;
}

/**
 * Delete a portfolio category
 */
export async function deletePortfolioCategory(id: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('portfolio_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting portfolio category:', error);
    return false;
  }

  return true;
}

// =============================================
// PORTFOLIO RATING FUNCTIONS
// =============================================

/**
 * Fetch portfolio ratings for a member (with category info)
 */
export async function fetchPortfolioRatings(memberId: string): Promise<PortfolioRating[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('portfolio_ratings')
    .select(`
      id,
      category_id,
      rating,
      portfolio_categories!inner (
        key,
        name
      )
    `)
    .eq('member_id', memberId);

  if (error) {
    console.error('Error fetching portfolio ratings:', error);
    return [];
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    categoryId: r.category_id,
    categoryKey: r.portfolio_categories?.key || '',
    categoryName: r.portfolio_categories?.name || '',
    rating: r.rating,
  }));
}

/**
 * Upsert a portfolio rating for a member
 */
export async function upsertPortfolioRating(
  orgId: string,
  memberId: string,
  categoryId: string,
  rating: number
): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase.rpc('upsert_portfolio_rating', {
    p_org_id: orgId,
    p_member_id: memberId,
    p_category_id: categoryId,
    p_rating: rating,
  });

  if (error) {
    console.error('Error upserting portfolio rating:', error);
    return false;
  }

  return true;
}

/**
 * Fetch all portfolio categories with ratings for a member
 * Returns all categories, with rating=0 for unrated ones
 */
export async function fetchPortfolioCategoriesWithRatings(
  orgId: string,
  memberId: string
): Promise<{ category: PortfolioCategory; rating: number }[]> {
  const supabase = createClient();
  
  // Fetch all categories
  const { data: categories, error: catError } = await supabase
    .from('portfolio_categories')
    .select('*')
    .eq('org_id', orgId)
    .order('name');

  if (catError) {
    console.error('Error fetching categories:', catError);
    return [];
  }

  // Fetch existing ratings for this member
  const { data: ratings, error: ratError } = await supabase
    .from('portfolio_ratings')
    .select('category_id, rating')
    .eq('member_id', memberId);

  if (ratError) {
    console.error('Error fetching ratings:', ratError);
    return [];
  }

  // Create a map of category_id -> rating
  const ratingMap = new Map<string, number>();
  (ratings || []).forEach(r => ratingMap.set(r.category_id, r.rating));

  // Combine categories with ratings
  return (categories || []).map(c => ({
    category: {
      id: c.id,
      orgId: c.org_id,
      key: c.key,
      name: c.name,
      description: c.description,
    },
    rating: ratingMap.get(c.id) || 0,
  }));
}
