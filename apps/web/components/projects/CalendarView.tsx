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
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid,
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
import type { Task } from '@/lib/services/projects';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  currentDate?: Date;
}

type ViewMode = 'month' | 'week' | 'day';

export function CalendarView({
  tasks,
  onTaskClick,
  currentDate = new Date(),
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentViewDate, setCurrentViewDate] = useState(currentDate);

  // Filter tasks with due dates
  const tasksWithDueDates = useMemo(() => {
    return tasks.filter(task => task.due_date && !task.completed_at);
  }, [tasks]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasksWithDueDates.forEach(task => {
      if (task.due_date) {
        const dateKey = format(parseISO(task.due_date), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    return grouped;
  }, [tasksWithDueDates]);

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

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200',
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentViewDate);
    const monthEnd = endOfMonth(currentViewDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="flex flex-col">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentViewDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[100px] border-b border-r p-2',
                  !isCurrentMonth && 'bg-muted/30',
                  isToday && 'bg-blue-50'
                )}
              >
                <div
                  className={cn(
                    'mb-1 text-sm font-medium',
                    isToday &&
                      'rounded-full bg-blue-600 text-white w-6 h-6 flex items-center justify-center',
                    !isCurrentMonth && 'text-muted-foreground'
                  )}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <button
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={cn(
                        'w-full rounded px-1.5 py-0.5 text-left text-xs truncate border',
                        task.priority
                          ? priorityColors[task.priority]
                          : 'bg-gray-100 text-gray-800 border-gray-200',
                        'hover:opacity-80 transition-opacity'
                      )}
                      title={task.title}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1.5">
                      +{dayTasks.length - 3} more
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
      <div className="flex flex-col h-full">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 border-r"></div>
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dateKey] || [];
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-2 text-center border-r',
                  isToday && 'bg-blue-50'
                )}
              >
                <div className="text-xs text-muted-foreground">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={cn(
                    'text-lg font-semibold',
                    isToday && 'text-blue-600'
                  )}
                >
                  {format(day, 'd')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {dayTasks.length} tasks
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8">
            <div className="border-r">
              {hours.map(hour => (
                <div
                  key={hour}
                  className="h-16 border-b p-1 text-xs text-muted-foreground"
                >
                  {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                </div>
              ))}
            </div>
            {days.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate[dateKey] || [];
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={cn('border-r', isToday && 'bg-blue-50/30')}
                >
                  {hours.map(hour => {
                    const hourTasks = dayTasks.filter(task => {
                      if (!task.due_time) return hour === 9; // Default to 9 AM if no time
                      const [taskHour] = task.due_time.split(':').map(Number);
                      return taskHour === hour;
                    });

                    return (
                      <div key={hour} className="h-16 border-b p-1">
                        {hourTasks.map(task => (
                          <button
                            key={task.id}
                            onClick={() => onTaskClick(task)}
                            className={cn(
                              'w-full rounded px-1.5 py-0.5 text-left text-xs truncate border mb-1',
                              task.priority
                                ? priorityColors[task.priority]
                                : 'bg-gray-100 text-gray-800 border-gray-200',
                              'hover:opacity-80 transition-opacity'
                            )}
                            title={task.title}
                          >
                            {task.title}
                          </button>
                        ))}
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
    const dateKey = format(currentViewDate, 'yyyy-MM-dd');
    const dayTasks = tasksByDate[dateKey] || [];
    const isToday = isSameDay(currentViewDate, new Date());
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Group tasks by hour
    const tasksByHour = hours.reduce(
      (acc, hour) => {
        acc[hour] = dayTasks.filter(task => {
          if (!task.due_time) return hour === 9; // Default to 9 AM if no time
          const [taskHour] = task.due_time.split(':').map(Number);
          return taskHour === hour;
        });
        return acc;
      },
      {} as Record<number, Task[]>
    );

    return (
      <div className="flex flex-col h-full">
        {/* Day header */}
        <div className={cn('p-4 border-b', isToday && 'bg-blue-50')}>
          <div className="text-sm text-muted-foreground">
            {format(currentViewDate, 'EEEE')}
          </div>
          <div
            className={cn('text-2xl font-semibold', isToday && 'text-blue-600')}
          >
            {format(currentViewDate, 'MMMM d, yyyy')}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {dayTasks.length} tasks
          </div>
        </div>

        {/* Time slots */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2">
            {hours.map(hour => {
              const hourTasks = tasksByHour[hour] || [];

              return (
                <div key={hour} className="border-b p-3">
                  <div className="text-xs text-muted-foreground mb-2">
                    {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
                  </div>
                  <div className="space-y-2">
                    {hourTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={cn(
                          'w-full rounded-lg p-2 text-left border',
                          task.priority
                            ? priorityColors[task.priority]
                            : 'bg-gray-100 text-gray-800 border-gray-200',
                          'hover:opacity-80 transition-opacity'
                        )}
                      >
                        <div className="font-medium text-sm">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </div>
                        )}
                        {task.due_time && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {task.due_time}
                          </div>
                        )}
                      </button>
                    ))}
                    {hourTasks.length === 0 && (
                      <div className="text-xs text-muted-foreground">
                        No tasks
                      </div>
                    )}
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleNavigation('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleNavigation('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
          </div>
          <h2 className="text-lg font-semibold">{getViewTitle()}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={viewMode}
            onValueChange={value => setViewMode(value as ViewMode)}
          >
            <SelectTrigger className="w-[120px]">
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
      <div className="flex-1 overflow-auto">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
}
