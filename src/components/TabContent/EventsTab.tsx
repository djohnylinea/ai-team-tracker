'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Mic, Users, BookOpen, GraduationCap, Video, Download, Printer } from 'lucide-react';
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
  fetchEvents, 
  createEvent,
  updateEvent,
  deleteEvent,
  type Event 
} from '@/lib/data';
import { arrayToCSV, downloadCSV, printElement, formatDate } from '@/lib/export';
import { EventDialog } from '@/components/dialogs/EventDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { toast } from 'sonner';

interface EventsTabProps {
  member: TeamMember;
  editMode: boolean;
  orgId: string;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'Speaker':
      return <Mic className="w-3 h-3" />;
    case 'Workshop':
      return <BookOpen className="w-3 h-3" />;
    case 'Training':
      return <GraduationCap className="w-3 h-3" />;
    case 'Webinar':
      return <Video className="w-3 h-3" />;
    default:
      return <Users className="w-3 h-3" />;
  }
};

const getEventStyle = (type: string) => {
  switch (type) {
    case 'Speaker':
      return { backgroundColor: 'rgba(176, 108, 80, 0.15)', color: '#B06C50' };
    case 'Workshop':
      return { backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#7c3aed' };
    case 'Training':
      return { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' };
    case 'Webinar':
      return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' };
    default:
      return { backgroundColor: 'rgba(135, 149, 176, 0.2)', color: '#8795B0' };
  }
};

export function EventsTab({ member, editMode, orgId }: EventsTabProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchEvents(member.id);
    setEvents(data);
    setLoading(false);
  }, [member.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      const success = await updateEvent(editingEvent.id, eventData);
      if (success) {
        toast.success('Event updated successfully');
        await loadData();
      } else {
        toast.error('Failed to update event');
        throw new Error('Failed to update event');
      }
    } else {
      const newEvent = await createEvent(member.id, orgId, eventData);
      if (newEvent) {
        toast.success('Event created successfully');
        await loadData();
      } else {
        toast.error('Failed to create event');
        throw new Error('Failed to create event');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    
    setDeleting(true);
    const success = await deleteEvent(eventToDelete.id);
    setDeleting(false);
    
    if (success) {
      toast.success('Event deleted successfully');
      await loadData();
    } else {
      toast.error('Failed to delete event');
    }
  };

  const handleExportCSV = () => {
    const exportData = events.map(e => ({
      ...e,
      dateFormatted: formatDate(e.date),
    }));
    const csvContent = arrayToCSV(exportData, [
      { key: 'name', header: 'Event Name' },
      { key: 'type', header: 'Type' },
      { key: 'dateFormatted', header: 'Date' },
    ]);
    downloadCSV(csvContent, `${member.name.replace(/\s+/g, '_')}_Events`);
    toast.success('Events exported to CSV');
  };

  const handlePrint = () => {
    printElement('events-table', `${member.name} - Events`);
  };

  if (loading) {
    return (
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading events...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle style={{ color: '#123A43' }}>Conferences & Events</CardTitle>
          <div className="flex items-center gap-2">
            {events.length > 0 && (
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
                onClick={handleAddEvent}
              >
                <Plus className="w-4 h-4" />
                Add Event
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: '#5D7D87' }}>No events yet.</p>
              {editMode && (
                <p className="text-sm mt-1" style={{ color: '#8795B0' }}>
                  Click &apos;Add Event&apos; to record a conference or speaking event.
                </p>
              )}
            </div>
          ) : (
            <div id="events-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ color: '#5D7D87' }}>Event</TableHead>
                  <TableHead style={{ color: '#5D7D87' }}>Type</TableHead>
                  <TableHead style={{ color: '#5D7D87' }}>Date</TableHead>
                  <TableHead style={{ color: '#5D7D87' }}>Topic</TableHead>
                  {editMode && (
                    <TableHead style={{ color: '#5D7D87' }}>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell
                      className="font-medium"
                      style={{ color: '#123A43' }}
                    >
                      {event.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 w-fit"
                        style={getEventStyle(event.type)}
                      >
                        {getEventIcon(event.type)}
                        {event.type}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: '#5D7D87' }}>
                      {event.date}
                    </TableCell>
                    <TableCell style={{ color: '#5D7D87' }}>
                      {event.topic || '-'}
                    </TableCell>
                    {editMode && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            style={{ color: '#5D7D87' }}
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            style={{ color: '#dc2626' }}
                            onClick={() => handleDeleteClick(event)}
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

      {/* Add/Edit Dialog */}
      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        onSave={handleSaveEvent}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Event"
        description={`Are you sure you want to delete "${eventToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />
    </>
  );
}
