'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Download, Printer } from 'lucide-react';
import { arrayToCSV, downloadCSV, printElement, formatDate } from '@/lib/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type TeamMember } from '@/types';
import { 
  fetchEngagements, 
  createEngagement,
  updateEngagement,
  deleteEngagement,
  type Engagement 
} from '@/lib/data';
import { EngagementDialog } from '@/components/dialogs/EngagementDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { toast } from 'sonner';

interface EngagementsTabProps {
  member: TeamMember;
  editMode: boolean;
  orgId: string;
}

export function EngagementsTab({ member, editMode, orgId }: EngagementsTabProps) {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState<Engagement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [engagementToDelete, setEngagementToDelete] = useState<Engagement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchEngagements(member.id);
    setEngagements(data);
    setLoading(false);
  }, [member.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddEngagement = () => {
    setEditingEngagement(null);
    setDialogOpen(true);
  };

  const handleEditEngagement = (engagement: Engagement) => {
    setEditingEngagement(engagement);
    setDialogOpen(true);
  };

  const handleDeleteClick = (engagement: Engagement) => {
    setEngagementToDelete(engagement);
    setDeleteDialogOpen(true);
  };

  const handleSaveEngagement = async (engagementData: Omit<Engagement, 'id'>) => {
    if (editingEngagement) {
      const success = await updateEngagement(editingEngagement.id, engagementData);
      if (success) {
        toast.success('Engagement updated successfully');
        await loadData();
      } else {
        toast.error('Failed to update engagement');
        throw new Error('Failed to update engagement');
      }
    } else {
      const newEngagement = await createEngagement(member.id, orgId, engagementData);
      if (newEngagement) {
        toast.success('Engagement created successfully');
        await loadData();
      } else {
        toast.error('Failed to create engagement');
        throw new Error('Failed to create engagement');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!engagementToDelete) return;
    
    setDeleting(true);
    const success = await deleteEngagement(engagementToDelete.id);
    setDeleting(false);
    
    if (success) {
      toast.success('Engagement deleted successfully');
      await loadData();
    } else {
      toast.error('Failed to delete engagement');
    }
  };

  if (loading) {
    return (
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading engagements...</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total allocation
  const totalAllocation = engagements.reduce((sum, e) => sum + e.allocationPercent, 0);

  const handleExportCSV = () => {
    const exportData = engagements.map(e => ({
      ...e,
      startDateFormatted: formatDate(e.startDate),
      endDateFormatted: e.endDate ? formatDate(e.endDate) : 'Ongoing',
    }));
    const csvContent = arrayToCSV(exportData, [
      { key: 'client', header: 'Client' },
      { key: 'allocationPercent', header: 'Allocation %' },
      { key: 'startDateFormatted', header: 'Start Date' },
      { key: 'endDateFormatted', header: 'End Date' },
    ]);
    downloadCSV(csvContent, `${member.name.replace(/\s+/g, '_')}_Engagements`);
    toast.success('Engagements exported to CSV');
  };

  const handlePrint = () => {
    printElement('engagements-table', `${member.name} - Engagements`);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex items-center gap-4">
          <Badge
            variant="secondary"
            className="text-lg px-4 py-2"
            style={{
              backgroundColor: totalAllocation > 100 ? 'rgba(220, 38, 38, 0.1)' : 'rgba(18, 58, 67, 0.1)',
              color: totalAllocation > 100 ? '#dc2626' : '#123A43',
            }}
          >
            Total Allocation: {totalAllocation}%
          </Badge>
        </div>

        <Card className="border" style={{ borderColor: '#CEDADD' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle style={{ color: '#123A43' }}>Client Engagements</CardTitle>
            <div className="flex items-center gap-2">
              {engagements.length > 0 && (
                <>
                  <Button size="sm" variant="outline" onClick={handleExportCSV} className="flex items-center gap-1">
                    <Download className="w-4 h-4" /> Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={handlePrint} className="flex items-center gap-1">
                    <Printer className="w-4 h-4" /> Print
                  </Button>
                </>
              )}
              {editMode && (
                <Button
                  size="sm"
                  className="flex items-center gap-2"
                  style={{ backgroundColor: '#123A43' }}
                  onClick={handleAddEngagement}
                >
                  <Plus className="w-4 h-4" />
                  Add Engagement
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {engagements.length === 0 ? (
              <div className="text-center py-8">
                <p style={{ color: '#5D7D87' }}>No engagements yet.</p>
                {editMode && (
                  <p className="text-sm mt-1" style={{ color: '#8795B0' }}>
                    Click &apos;Add Engagement&apos; to create one.
                  </p>
                )}
              </div>
            ) : (
              <div id="engagements-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ color: '#5D7D87' }}>Client</TableHead>
                    <TableHead style={{ color: '#5D7D87' }}>Start Date</TableHead>
                    <TableHead style={{ color: '#5D7D87' }}>End Date</TableHead>
                    <TableHead style={{ color: '#5D7D87' }}>Allocation</TableHead>
                    {editMode && (
                      <TableHead style={{ color: '#5D7D87' }}>Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engagements.map((engagement) => (
                    <TableRow key={engagement.id}>
                      <TableCell
                        className="font-medium"
                        style={{ color: '#123A43' }}
                      >
                        {engagement.client}
                      </TableCell>
                      <TableCell style={{ color: '#5D7D87' }}>
                        {engagement.startDate}
                      </TableCell>
                      <TableCell style={{ color: '#5D7D87' }}>
                        {engagement.endDate || 'Ongoing'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: 'rgba(176, 108, 80, 0.15)',
                            color: '#B06C50',
                          }}
                        >
                          {engagement.allocationPercent}%
                        </Badge>
                      </TableCell>
                      {editMode && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              style={{ color: '#5D7D87' }}
                              onClick={() => handleEditEngagement(engagement)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              style={{ color: '#dc2626' }}
                              onClick={() => handleDeleteClick(engagement)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <EngagementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        engagement={editingEngagement}
        onSave={handleSaveEngagement}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Engagement"
        description={`Are you sure you want to delete the engagement with "${engagementToDelete?.client}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />
    </>
  );
}
