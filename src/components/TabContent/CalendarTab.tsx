'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  fetchAllEvents, 
  fetchAllTimeOff,
  TIME_OFF_TYPES,
} from '@/lib/data';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

// Helper to format date as YYYY-MM-DD in local timezone (not UTC)
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to parse date string as local date (not UTC)
function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: 'event' | 'time-off';
  color: string;
  memberName?: string;
  details?: string;
}

interface CalendarTabProps {
  orgId: string;
}

export function CalendarTab({ orgId }: CalendarTabProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // Fetch events and time off in parallel (no engagements - too cluttered)
      const [eventsData, timeOffData] = await Promise.all([
        fetchAllEvents(orgId),
        fetchAllTimeOff(orgId),
      ]);

      const calendarEvents: CalendarEvent[] = [];

      // Convert events - show member name and event title
      eventsData.forEach(e => {
        calendarEvents.push({
          id: `event-${e.id}`,
          title: e.memberName ? `${e.memberName}: ${e.title}` : e.title,
          startDate: e.date,
          endDate: e.date,
          type: 'event',
          color: '#B06C50', // Copper for events
          memberName: e.memberName,
          details: e.eventType,
        });
      });

      // Convert time off
      timeOffData.forEach(t => {
        const typeInfo = TIME_OFF_TYPES.find(type => type.value === t.type);
        calendarEvents.push({
          id: `timeoff-${t.id}`,
          title: `${t.memberName} - ${typeInfo?.label || t.type}`,
          startDate: t.startDate,
          endDate: t.endDate,
          type: 'time-off',
          color: typeInfo?.color || '#6b7280',
          memberName: t.memberName,
          details: t.notes || undefined,
        });
      });

      setEvents(calendarEvents);
      setLoading(false);
    }

    loadData();
  }, [orgId]);

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = formatDateLocal(date);
    return events.filter(event => {
      return dateStr >= event.startDate && dateStr <= event.endDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setDayDialogOpen(true);
  };

  const selectedDayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (loading) {
    return (
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-6 p-4 rounded-lg" style={{ backgroundColor: '#f8fafb' }}>
        <span className="text-sm font-medium" style={{ color: '#123A43' }}>Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#B06C50' }} />
          <span className="text-sm" style={{ color: '#5D7D87' }}>Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          <span className="text-sm" style={{ color: '#5D7D87' }}>Vacation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }} />
          <span className="text-sm" style={{ color: '#5D7D87' }}>Sick Leave</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
          <span className="text-sm" style={{ color: '#5D7D87' }}>Personal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#a855f7' }} />
          <span className="text-sm" style={{ color: '#5D7D87' }}>Conference</span>
        </div>
        <div className="ml-auto text-xs" style={{ color: '#8795B0' }}>
          Click on a day to see details
        </div>
      </div>

      {/* Calendar */}
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" style={{ color: '#123A43' }}>
              <Calendar className="w-5 h-5" />
              {formatMonthYear(currentDate)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium py-2"
                style={{ color: '#5D7D87' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayInfo, index) => {
              const dayEvents = getEventsForDate(dayInfo.date);
              const isCurrentDay = isToday(dayInfo.date);
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(dayInfo.date)}
                  className={`min-h-24 p-1 rounded border cursor-pointer transition-all hover:shadow-md ${
                    dayInfo.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={{ borderColor: isCurrentDay ? '#B06C50' : '#CEDADD' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className={`text-sm font-medium ${
                        isCurrentDay 
                          ? 'text-white bg-[#B06C50] w-6 h-6 rounded-full flex items-center justify-center' 
                          : ''
                      }`}
                      style={{ 
                        color: isCurrentDay ? 'white' : dayInfo.isCurrentMonth ? '#123A43' : '#8795B0' 
                      }}
                    >
                      {dayInfo.date.getDate()}
                    </div>
                    {hasEvents && (
                      <div className="text-xs px-1 rounded" style={{ backgroundColor: '#f0f4f5', color: '#5D7D87' }}>
                        {dayEvents.length}
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className="text-xs px-1 py-0.5 rounded truncate"
                        style={{ 
                          backgroundColor: `${event.color}20`,
                          color: event.color,
                          borderLeft: `2px solid ${event.color}`,
                        }}
                        title={`${event.title}${event.memberName ? ` - ${event.memberName}` : ''}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs px-1 font-medium" style={{ color: '#5D7D87' }}>
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#123A43' }}>
              {selectedDate && formatFullDate(selectedDate)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDayEvents.length === 0 ? (
            <div className="py-8 text-center" style={{ color: '#8795B0' }}>
              No events or time off scheduled for this day.
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {selectedDayEvents.map(event => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border"
                  style={{ 
                    borderColor: event.color,
                    borderLeftWidth: '4px',
                    backgroundColor: `${event.color}10`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: '#123A43' }}>
                        {event.title}
                      </div>
                      {event.memberName && (
                        <div className="text-sm mt-1" style={{ color: '#5D7D87' }}>
                          {event.memberName}
                        </div>
                      )}
                      {event.startDate !== event.endDate && (
                        <div className="text-xs mt-1" style={{ color: '#8795B0' }}>
                          {parseDateLocal(event.startDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })} - {parseDateLocal(event.endDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      )}
                    </div>
                    <span 
                      className="text-xs px-2 py-1 rounded shrink-0"
                      style={{ 
                        backgroundColor: `${event.color}20`,
                        color: event.color,
                      }}
                    >
                      {event.type === 'event' ? 'Event' : 'Time Off'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t text-sm" style={{ color: '#8795B0', borderColor: '#CEDADD' }}>
            <p>To add or edit items, go to the team member&apos;s Events or Time Off tab.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upcoming items list */}
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardHeader>
          <CardTitle style={{ color: '#123A43' }}>Upcoming (Next 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <UpcomingEventsList events={events} />
        </CardContent>
      </Card>
    </div>
  );
}

// Separate component to handle date calculations
function UpcomingEventsList({ events }: { events: CalendarEvent[] }) {
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const today = formatDateLocal(now);
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = formatDateLocal(thirtyDays);
    
    return events
      .filter(e => e.startDate >= today && e.startDate <= thirtyDaysFromNow)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events]);

  if (upcomingEvents.length === 0) {
    return (
      <p className="text-center py-4" style={{ color: '#8795B0' }}>
        No upcoming items in the next 30 days.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {upcomingEvents.slice(0, 10).map(event => (
        <div
          key={event.id}
          className="flex items-center gap-3 p-2 rounded"
          style={{ backgroundColor: '#f8fafb' }}
        >
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: event.color }} 
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate" style={{ color: '#123A43' }}>
              {event.title}
            </div>
            <div className="text-xs" style={{ color: '#5D7D87' }}>
              {event.memberName && `${event.memberName} • `}
              {parseDateLocal(event.startDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
              {event.startDate !== event.endDate && (
                ` - ${parseDateLocal(event.endDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}`
              )}
            </div>
          </div>
          <span 
            className="text-xs px-2 py-1 rounded"
            style={{ 
              backgroundColor: `${event.color}20`,
              color: event.color,
            }}
          >
            {event.type === 'event' ? 'Event' : 'Time Off'}
          </span>
        </div>
      ))}
      {upcomingEvents.length > 10 && (
        <p className="text-center text-sm" style={{ color: '#8795B0' }}>
          + {upcomingEvents.length - 10} more items
        </p>
      )}
    </div>
  );
}
