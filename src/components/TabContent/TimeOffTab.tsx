'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type TeamMember } from '@/types';
import { 
  fetchTimeOffByMember, 
  createTimeOff, 
  updateTimeOff, 
  deleteTimeOff,
  type TimeOff,
  type TimeOffType,
  TIME_OFF_TYPES,
} from '@/lib/data';
import { arrayToCSV, downloadCSV, printElement, formatDate } from '@/lib/export';
import { TimeOffDialog } from '@/components/dialogs/TimeOffDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Calendar, Download, Printer } from 'lucide-react';

interface TimeOffTabProps {
  member: TeamMember;
  editMode: boolean;
  orgId: string;
}

export function TimeOffTab({ member, editMode, orgId }: TimeOffTabProps) {
  const [timeOffList, setTimeOffList] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTimeOff, setEditingTimeOff] = useState<TimeOff | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTimeOff, setDeletingTimeOff] = useState<TimeOff | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      const data = await fetchTimeOffByMember(member.id);
      if (!cancelled) {
        setTimeOffList(data);
        setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [member.id]);

  const handleAdd = () => {
    setEditingTimeOff(null);
    setDialogOpen(true);
  };

  const handleEdit = (timeOff: TimeOff) => {
    setEditingTimeOff(timeOff);
    setDialogOpen(true);
  };

  const handleSave = async (data: {
    startDate: string;
    endDate: string;
    type: TimeOffType;
    notes: string;
  }) => {
    if (editingTimeOff) {
      // Update existing
      const success = await updateTimeOff(editingTimeOff.id, data);
      if (success) {
        setTimeOffList(prev => 
          prev.map(t => t.id === editingTimeOff.id 
            ? { ...t, ...data } 
            : t
          )
        );
        toast.success('Time off updated');
      } else {
        toast.error('Failed to update time off');
      }
    } else {
      // Create new
      const newTimeOff = await createTimeOff(
        orgId,
        member.id,
        data.startDate,
        data.endDate,
        data.type,
        data.notes
      );
      if (newTimeOff) {
        setTimeOffList(prev => [newTimeOff, ...prev]);
        toast.success('Time off added');
      } else {
        toast.error('Failed to add time off');
      }
    }
  };

  const handleDeleteClick = (timeOff: TimeOff) => {
    setDeletingTimeOff(timeOff);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTimeOff) return;
    
    const success = await deleteTimeOff(deletingTimeOff.id);
    if (success) {
      setTimeOffList(prev => prev.filter(t => t.id !== deletingTimeOff.id));
      toast.success('Time off deleted');
    } else {
      toast.error('Failed to delete time off');
    }
    setDeleteDialogOpen(false);
    setDeletingTimeOff(null);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    
    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', options);
    }
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const getDaysCount = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getTypeInfo = (type: TimeOffType) => {
    return TIME_OFF_TYPES.find(t => t.value === type) || TIME_OFF_TYPES[0];
  };

  if (loading) {
    return (
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading time off...</div>
        </CardContent>
      </Card>
    );
  }

  // Format date as YYYY-MM-DD in local timezone (not UTC)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Split into upcoming and past
  const today = formatDateLocal(new Date());
  const upcomingTimeOff = timeOffList.filter(t => t.endDate >= today);
  const pastTimeOff = timeOffList.filter(t => t.endDate < today);

  const handleExportCSV = () => {
    const exportData = timeOffList.map(t => {
      const typeInfo = TIME_OFF_TYPES.find(type => type.value === t.type);
      return {
        type: typeInfo?.label || t.type,
        startDate: formatDate(t.startDate),
        endDate: formatDate(t.endDate),
        notes: t.notes || '',
      };
    });
    const csvContent = arrayToCSV(exportData, [
      { key: 'type', header: 'Type' },
      { key: 'startDate', header: 'Start Date' },
      { key: 'endDate', header: 'End Date' },
      { key: 'notes', header: 'Notes' },
    ]);
    downloadCSV(csvContent, `${member.name.replace(/\s+/g, '_')}_TimeOff`);
    toast.success('Time off exported to CSV');
  };

  const handlePrint = () => {
    printElement('timeoff-list', `${member.name} - Time Off`);
  };

  return (
    <div className="space-y-6">
      {/* Export/Print buttons */}
      {timeOffList.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCSV} className="flex items-center gap-1">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button size="sm" variant="outline" onClick={handlePrint} className="flex items-center gap-1">
            <Printer className="w-4 h-4" /> Print
          </Button>
        </div>
      )}

      {editMode && (
        <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'rgba(176, 108, 80, 0.1)' }}>
          <p className="text-sm" style={{ color: '#B06C50' }}>
            ✏️ Add or edit time off entries for this team member.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAdd}
            className="flex items-center gap-1 ml-4"
            style={{ borderColor: '#B06C50', color: '#B06C50' }}
          >
            <Plus className="w-4 h-4" />
            Add Time Off
          </Button>
        </div>
      )}

      <div id="timeoff-list">
      {/* Upcoming Time Off */}
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#123A43' }}>
            <Calendar className="w-5 h-5" />
            Upcoming & Current
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingTimeOff.length === 0 ? (
            <p className="text-center py-4" style={{ color: '#8795B0' }}>
              No upcoming time off scheduled.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingTimeOff.map((timeOff) => {
                const typeInfo = getTypeInfo(timeOff.type);
                const days = getDaysCount(timeOff.startDate, timeOff.endDate);
                
                return (
                  <div
                    key={timeOff.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: '#f8fafb' }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: typeInfo.color }} 
                      />
                      <div>
                        <div className="font-medium" style={{ color: '#123A43' }}>
                          {typeInfo.label}
                          <span className="ml-2 text-sm font-normal" style={{ color: '#5D7D87' }}>
                            ({days} day{days > 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="text-sm" style={{ color: '#5D7D87' }}>
                          {formatDateRange(timeOff.startDate, timeOff.endDate)}
                        </div>
                        {timeOff.notes && (
                          <div className="text-xs mt-1" style={{ color: '#8795B0' }}>
                            {timeOff.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    {editMode && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(timeOff)}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" style={{ color: '#5D7D87' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(timeOff)}
                          className="p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Time Off */}
      {pastTimeOff.length > 0 && (
        <Card className="border" style={{ borderColor: '#CEDADD' }}>
          <CardHeader>
            <CardTitle style={{ color: '#8795B0' }}>Past Time Off</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastTimeOff.slice(0, 5).map((timeOff) => {
                const typeInfo = getTypeInfo(timeOff.type);
                const days = getDaysCount(timeOff.startDate, timeOff.endDate);
                
                return (
                  <div
                    key={timeOff.id}
                    className="flex items-center justify-between p-3 rounded-lg opacity-60"
                    style={{ backgroundColor: '#f8fafb' }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: typeInfo.color }} 
                      />
                      <div>
                        <div className="font-medium" style={{ color: '#123A43' }}>
                          {typeInfo.label}
                          <span className="ml-2 text-sm font-normal" style={{ color: '#5D7D87' }}>
                            ({days} day{days > 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="text-sm" style={{ color: '#5D7D87' }}>
                          {formatDateRange(timeOff.startDate, timeOff.endDate)}
                        </div>
                      </div>
                    </div>
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(timeOff)}
                        className="p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                      </button>
                    )}
                  </div>
                );
              })}
              {pastTimeOff.length > 5 && (
                <p className="text-center text-sm" style={{ color: '#8795B0' }}>
                  + {pastTimeOff.length - 5} more past entries
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      </div>

      {/* Dialogs */}
      <TimeOffDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        timeOff={editingTimeOff}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => setDeleteDialogOpen(open)}
        onConfirm={handleConfirmDelete}
        title="Delete Time Off"
        description={`Are you sure you want to delete this time off entry?`}
      />
    </div>
  );
}
