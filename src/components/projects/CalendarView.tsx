'use client';

import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfDay,
  parseISO,
  isSameHour,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid,
  Clock,
  CheckSquare,
  Phone,
  Users,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type EventType = 'task' | 'meeting' | 'call' | 'email' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  type: EventType;
  color?: string; // 'blue', 'red', etc. or hex
  metadata?: any;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  currentDate?: Date;
}

type ViewMode = 'month' | 'week' | 'day';

export function CalendarView({
  events,
  onEventClick,
  currentDate = new Date(),
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentViewDate, setCurrentViewDate] = useState(currentDate);

  // Group events by date (string yyyy-MM-dd)
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentViewDate(prev =>
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentViewDate(prev =>
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentViewDate(new Date());
  };

  const getTypeIcon = (type: EventType) => {
    switch (type) {
      case 'task': return <CheckSquare className="h-3 w-3" />;
      case 'call': return <Phone className="h-3 w-3" />;
      case 'meeting': return <Users className="h-3 w-3" />;
      case 'email': return <Mail className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  }

  const getEventColorClass = (type: EventType, color?: string) => {
    if (color && !['task', 'meeting', 'call', 'email'].includes(type) && color.startsWith('bg-')) return color; // Allow passing Tailwind classes directly if needed

    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'call': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'email': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentViewDate);
    const monthEnd = endOfMonth(currentViewDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="flex flex-col border rounded-lg bg-background">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {weekDays.map(day => (
            <div
              key={day}
              className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentViewDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[120px] border-b border-r p-2 transition-colors hover:bg-muted/10',
                  !isCurrentMonth && 'bg-muted/10 text-muted-foreground',
                  isToday && 'bg-primary/5'
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={cn(
                      'text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full',
                      isToday && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  <span className="text-[10px] text-muted-foreground hidden lg:inline-block">
                    {format(day, 'EEE')}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 4).map(event => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        'w-full flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-left text-xs truncate border shadow-sm transition-all hover:scale-[1.02]',
                        getEventColorClass(event.type, event.color)
                      )}
                      title={event.title}
                    >
                      <span className="opacity-70">{getTypeIcon(event.type)}</span>
                      <span className="truncate font-medium">{event.title}</span>
                    </button>
                  ))}
                  {dayEvents.length > 4 && (
                    <div className="text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 rounded-sm bg-muted/50 text-center">
                      +{dayEvents.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentViewDate);
    const weekEnd = endOfWeek(currentViewDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b bg-muted/40 divide-x">
          <div className="p-2 border-r bg-muted/50"></div>
          {days.map(day => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-3 text-center',
                  isToday && 'bg-primary/5'
                )}
              >
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={cn(
                    'text-xl font-bold mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full',
                    isToday && 'bg-primary text-primary-foreground'
                  )}
                >
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8 bg-background">
            <div className="border-r border-b divide-y bg-muted/10">
              {hours.map(hour => (
                <div
                  key={hour}
                  className="h-20 p-2 text-xs font-medium text-right text-muted-foreground"
                >
                  {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                </div>
              ))}
            </div>
            {days.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dateKey] || [];
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={cn('border-r relative divide-y', isToday && 'bg-primary/5')}
                >
                  {hours.map(hour => {
                    // Filter events happening in this hour
                    const hourEvents = dayEvents.filter(event => {
                      const eventHour = event.start.getHours();
                      return eventHour === hour;
                    });

                    return (
                      <div key={hour} className="h-20 border-b p-1 relative group hover:bg-muted/10 transition-colors">
                        <div className="space-y-1">
                          {hourEvents.map(event => (
                            <button
                              key={event.id}
                              onClick={() => onEventClick(event)}
                              className={cn(
                                'w-full flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-left text-xs truncate border shadow-sm',
                                getEventColorClass(event.type, event.color)
                              )}
                              title={event.title}
                            >
                              <span className="opacity-70">{getTypeIcon(event.type)}</span>
                              <span className="truncate font-medium">{event.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const isToday = isSameDay(currentViewDate, new Date());
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dateKey = format(currentViewDate, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateKey] || [];

    // Group events by hour
    const eventsByHour = hours.reduce(
      (acc, hour) => {
        acc[hour] = dayEvents.filter(event => {
          return event.start.getHours() === hour;
        });
        return acc;
      },
      {} as Record<number, CalendarEvent[]>
    );

    return (
      <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
        {/* Day header */}
        <div className={cn('p-6 border-b', isToday && 'bg-primary/5')}>
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {format(currentViewDate, 'EEEE')}
          </div>
          <div
            className={cn('text-3xl font-bold mt-1', isToday && 'text-primary')}
          >
            {format(currentViewDate, 'MMMM d, yyyy')}
          </div>
          <div className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-2">
            <span className="bg-muted px-2 py-0.5 rounded-full text-foreground">{dayEvents.length}</span> events scheduled
          </div>
        </div>

        {/* Time slots */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y">
            {hours.map(hour => {
              const hourEvents = eventsByHour[hour] || [];

              return (
                <div key={hour} className="flex min-h-[5rem] group hover:bg-muted/5 transition-colors">
                  <div className="w-24 p-4 text-sm font-medium text-muted-foreground border-r bg-muted/10 shrink-0">
                    {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
                  </div>
                  <div className="flex-1 p-2">
                    <div className="space-y-2">
                      {hourEvents.map(event => (
                        <button
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-lg p-3 text-left border shadow-sm hover:scale-[1.01] transition-all',
                            getEventColorClass(event.type, event.color)
                          )}
                        >
                          <div className="p-2 bg-background/50 rounded-md backdrop-blur-sm">
                            {getTypeIcon(event.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm">{event.title}</div>
                            {event.description && (
                              <div className="text-xs opacity-80 mt-0.5 line-clamp-1">
                                {event.description}
                              </div>
                            )}
                          </div>
                          <div className="ml-auto text-xs font-mono opacity-70">
                            {format(event.start, 'h:mm a')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'month':
        return format(currentViewDate, 'MMMM yyyy');
      case 'week':
        const weekStart = startOfWeek(currentViewDate);
        const weekEnd = endOfWeek(currentViewDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentViewDate, 'MMMM d, yyyy');
    }
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'month':
        navigateMonth(direction);
        break;
      case 'week':
        navigateWeek(direction);
        break;
      case 'day':
        navigateDay(direction);
        break;
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleNavigation('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 font-medium"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleNavigation('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-bold tracking-tight">{getViewTitle()}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={viewMode}
            onValueChange={value => setViewMode(value as ViewMode)}
          >
            <SelectTrigger className="w-[120px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">
                <div className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  Month
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Week
                </div>
              </SelectItem>
              <SelectItem value="day">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Day
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-hidden shadow-sm border rounded-lg bg-card">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
}
