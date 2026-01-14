'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  FolderKanban, 
  Briefcase, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Mic,
  Users as UsersIcon,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  fetchTeamStats,
  fetchProjectsByType,
  fetchProjectsByStatus,
  fetchMemberAllocations,
  fetchUpcomingEvents,
  fetchAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  type TeamStats,
  type ProjectsByType,
  type ProjectsByStatus,
  type MemberAllocation,
  type UpcomingEvent,
  type TeamMemberData,
} from '@/lib/data';
import { TeamMemberDialog } from '@/components/dialogs/TeamMemberDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { toast } from 'sonner';

interface TeamDashboardTabProps {
  orgId: string;
}

export function TeamDashboardTab({ orgId }: TeamDashboardTabProps) {
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [projectsByType, setProjectsByType] = useState<ProjectsByType[]>([]);
  const [projectsByStatus, setProjectsByStatus] = useState<ProjectsByStatus[]>([]);
  const [memberAllocations, setMemberAllocations] = useState<MemberAllocation[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<TeamMemberData | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [statsData, typesData, statusData, allocData, eventsData, membersData] = await Promise.all([
      fetchTeamStats(),
      fetchProjectsByType(),
      fetchProjectsByStatus(),
      fetchMemberAllocations(),
      fetchUpcomingEvents(5),
      fetchAllTeamMembers(),
    ]);
    setStats(statsData);
    setProjectsByType(typesData);
    setProjectsByStatus(statusData);
    setMemberAllocations(allocData);
    setUpcomingEvents(eventsData);
    setTeamMembers(membersData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Team member handlers
  const handleAddMember = () => {
    setEditingMember(null);
    setMemberDialogOpen(true);
  };

  const handleEditMember = (member: TeamMemberData) => {
    setEditingMember(member);
    setMemberDialogOpen(true);
  };

  const handleDeleteClick = (member: TeamMemberData) => {
    setDeletingMember(member);
    setDeleteDialogOpen(true);
  };

  const handleSaveMember = async (memberData: Omit<TeamMemberData, 'id'>) => {
    if (editingMember) {
      const success = await updateTeamMember(editingMember.id, memberData);
      if (success) {
        setTeamMembers(prev =>
          prev.map(m => m.id === editingMember.id ? { ...m, ...memberData } : m)
        );
        toast.success('Team member updated');
      } else {
        toast.error('Failed to update team member');
      }
    } else {
      const newMember = await createTeamMember(orgId, memberData);
      if (newMember) {
        setTeamMembers(prev => [...prev, newMember].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Team member added');
        // Reload stats since member count changed
        const newStats = await fetchTeamStats();
        setStats(newStats);
      } else {
        toast.error('Failed to add team member');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
    
    const success = await deleteTeamMember(deletingMember.id);
    if (success) {
      setTeamMembers(prev => prev.filter(m => m.id !== deletingMember.id));
      toast.success('Team member deleted');
      // Reload stats since member count changed
      const newStats = await fetchTeamStats();
      setStats(newStats);
    } else {
      toast.error('Failed to delete team member');
    }
    setDeleteDialogOpen(false);
    setDeletingMember(null);
  };

  if (loading) {
    return (
      <div className="p-8 text-center" style={{ color: '#5D7D87' }}>
        Loading team dashboard...
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' };
      case 'Completed':
        return { bg: 'rgba(206, 218, 221, 0.5)', color: '#5D7D87' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AI Use Case':
        return { bg: 'rgba(18, 58, 67, 0.1)', color: '#123A43' };
      case 'AI Community Center':
        return { bg: 'rgba(135, 149, 176, 0.2)', color: '#8795B0' };
      case 'Other AI Initiative':
        return { bg: 'rgba(176, 108, 80, 0.15)', color: '#B06C50' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getAllocationColor = (allocation: number) => {
    if (allocation > 100) return '#dc2626';
    if (allocation >= 80) return '#16a34a';
    if (allocation >= 50) return '#3b82f6';
    return '#d97706';
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border" style={{ borderColor: '#CEDADD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#5D7D87' }}>
                  Team Members
                </p>
                <p className="text-3xl font-bold" style={{ color: '#123A43' }}>
                  {stats?.totalMembers || 0}
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(18, 58, 67, 0.1)' }}
              >
                <Users className="h-6 w-6" style={{ color: '#123A43' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border" style={{ borderColor: '#CEDADD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#5D7D87' }}>
                  Total Projects
                </p>
                <p className="text-3xl font-bold" style={{ color: '#123A43' }}>
                  {stats?.totalProjects || 0}
                </p>
                <p className="text-xs" style={{ color: '#8795B0' }}>
                  {stats?.activeProjects || 0} active
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
              >
                <FolderKanban className="h-6 w-6" style={{ color: '#3b82f6' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border" style={{ borderColor: '#CEDADD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#5D7D87' }}>
                  Engagements
                </p>
                <p className="text-3xl font-bold" style={{ color: '#123A43' }}>
                  {stats?.totalEngagements || 0}
                </p>
                <p className="text-xs" style={{ color: '#8795B0' }}>
                  {stats?.avgAllocation || 0}% avg allocation
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(176, 108, 80, 0.15)' }}
              >
                <Briefcase className="h-6 w-6" style={{ color: '#B06C50' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border" style={{ borderColor: '#CEDADD' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#5D7D87' }}>
                  Events
                </p>
                <p className="text-3xl font-bold" style={{ color: '#123A43' }}>
                  {stats?.totalEvents || 0}
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}
              >
                <Calendar className="h-6 w-6" style={{ color: '#7c3aed' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Projects by Status */}
        <Card className="border" style={{ borderColor: '#CEDADD' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#123A43' }}>
              <CheckCircle className="h-5 w-5" />
              Projects by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsByStatus.length === 0 ? (
              <p className="text-center py-4" style={{ color: '#5D7D87' }}>
                No projects yet
              </p>
            ) : (
              <div className="space-y-3">
                {projectsByStatus.map((item) => {
                  const colors = getStatusColor(item.status);
                  const percentage = stats?.totalProjects
                    ? Math.round((item.count / stats.totalProjects) * 100)
                    : 0;
                  return (
                    <div key={item.status} className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="w-28 justify-center"
                        style={{ backgroundColor: colors.bg, color: colors.color }}
                      >
                        {item.status}
                      </Badge>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: colors.color,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right" style={{ color: '#123A43' }}>
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects by Type */}
        <Card className="border" style={{ borderColor: '#CEDADD' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#123A43' }}>
              <TrendingUp className="h-5 w-5" />
              Projects by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsByType.length === 0 ? (
              <p className="text-center py-4" style={{ color: '#5D7D87' }}>
                No projects yet
              </p>
            ) : (
              <div className="space-y-3">
                {projectsByType.map((item) => {
                  const colors = getTypeColor(item.type);
                  const percentage = stats?.totalProjects
                    ? Math.round((item.count / stats.totalProjects) * 100)
                    : 0;
                  return (
                    <div key={item.type} className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="w-28 justify-center"
                        style={{ backgroundColor: colors.bg, color: colors.color }}
                      >
                        {item.type}
                      </Badge>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: colors.color,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right" style={{ color: '#123A43' }}>
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Allocations */}
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#123A43' }}>
            <Clock className="h-5 w-5" />
            Team Allocation Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {memberAllocations.length === 0 ? (
            <p className="text-center py-4" style={{ color: '#5D7D87' }}>
              No team members yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ color: '#5D7D87' }}>Team Member</TableHead>
                  <TableHead style={{ color: '#5D7D87' }}>Engagements</TableHead>
                  <TableHead style={{ color: '#5D7D87' }}>Total Allocation</TableHead>
                  <TableHead style={{ color: '#5D7D87' }}>Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberAllocations.map((member) => (
                  <TableRow key={member.memberId}>
                    <TableCell className="font-medium" style={{ color: '#123A43' }}>
                      {member.memberName}
                    </TableCell>
                    <TableCell style={{ color: '#5D7D87' }}>
                      {member.engagementCount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor:
                            member.allocation > 100
                              ? 'rgba(220, 38, 38, 0.1)'
                              : 'rgba(18, 58, 67, 0.1)',
                          color: getAllocationColor(member.allocation),
                        }}
                      >
                        {member.allocation}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-32 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(member.allocation, 100)}%`,
                            backgroundColor: getAllocationColor(member.allocation),
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#123A43' }}>
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-center py-4" style={{ color: '#5D7D87' }}>
              No upcoming events
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ color: '#5D7D87' }}>Event</TableHead>
                  <TableHead style={{ color: '#5D7D87' }}>Type</TableHead>
                  <TableHead style={{ color: '#5D7D87' }}>Date</TableHead>
                  <TableHead style={{ color: '#5D7D87' }}>Team Member</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium" style={{ color: '#123A43' }}>
                      {event.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 w-fit"
                        style={{
                          backgroundColor:
                            event.type === 'Speaker'
                              ? 'rgba(176, 108, 80, 0.15)'
                              : 'rgba(135, 149, 176, 0.2)',
                          color: event.type === 'Speaker' ? '#B06C50' : '#8795B0',
                        }}
                      >
                        {event.type === 'Speaker' ? (
                          <Mic className="w-3 h-3" />
                        ) : (
                          <UsersIcon className="w-3 h-3" />
                        )}
                        {event.type}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: '#5D7D87' }}>{event.date}</TableCell>
                    <TableCell style={{ color: '#5D7D87' }}>{event.memberName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Team Members Management */}
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" style={{ color: '#123A43' }}>
              <Users className="h-5 w-5" />
              Manage Team Members
            </CardTitle>
            <Button
              onClick={handleAddMember}
              size="sm"
              className="flex items-center gap-1"
              style={{ backgroundColor: '#B06C50' }}
            >
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <p className="text-center py-4" style={{ color: '#5D7D87' }}>
              No team members yet. Add your first team member above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ color: '#5D7D87' }}>Member</TableHead>
                  <TableHead style={{ color: '#5D7D87' }}>Role / Title</TableHead>
                  <TableHead style={{ color: '#5D7D87' }} className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: '#123A43' }}
                        >
                          {member.avatarInitials}
                        </div>
                        <span className="font-medium" style={{ color: '#123A43' }}>
                          {member.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell style={{ color: '#5D7D87' }}>{member.roleTitle}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMember(member)}
                          title="Edit member"
                        >
                          <Edit2 className="w-4 h-4" style={{ color: '#5D7D87' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(member)}
                          title="Delete member"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TeamMemberDialog
        open={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        onSave={handleSaveMember}
        member={editingMember}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => setDeleteDialogOpen(open)}
        onConfirm={handleConfirmDelete}
        title="Delete Team Member"
        description={`Are you sure you want to delete "${deletingMember?.name}"? This will also delete all their projects, engagements, events, and ratings. This action cannot be undone.`}
      />
    </div>
  );
}
