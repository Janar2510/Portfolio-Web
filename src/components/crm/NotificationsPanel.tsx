'use client';

import { useState, useEffect } from 'react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FollowUp, CRMActivity } from '@/domain/crm/crm';

interface Notification {
  id: string;
  type: 'follow_up' | 'activity' | 'deal';
  title: string;
  description?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  link?: string;
  metadata?: {
    contact_id?: string;
    deal_id?: string;
    follow_up_id?: string;
    activity_id?: string;
  };
}

interface NotificationsPanelProps {
  followUps: FollowUp[];
  activities: CRMActivity[];
  onDismiss?: (notificationId: string) => void;
  onMarkRead?: (notificationId: string) => void;
}

export function NotificationsPanel({
  followUps,
  activities,
  onDismiss,
  onMarkRead,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Process follow-ups
    followUps
      .filter(f => !f.is_completed)
      .forEach(followUp => {
        const dueDate = new Date(followUp.due_date);
        const isOverdue = isPast(dueDate);
        const isDueToday = isToday(dueDate);
        const isDueTomorrow = isTomorrow(dueDate);

        if (isOverdue || isDueToday || isDueTomorrow) {
          newNotifications.push({
            id: `follow-up-${followUp.id}`,
            type: 'follow_up',
            title: followUp.title,
            description: `Follow-up reminder`,
            dueDate: followUp.due_date,
            priority: isOverdue ? 'high' : isDueToday ? 'high' : 'medium',
            link: followUp.contact_id
              ? `/crm/contacts/${followUp.contact_id}`
              : followUp.deal_id
                ? `/crm/pipeline`
                : undefined,
            metadata: {
              follow_up_id: followUp.id,
              contact_id: followUp.contact_id || undefined,
              deal_id: followUp.deal_id || undefined,
            },
          });
        }
      });

    // Process activities with due dates
    activities
      .filter(a => !a.is_completed && a.due_date)
      .forEach(activity => {
        const dueDate = new Date(activity.due_date!);
        const isOverdue = isPast(dueDate);
        const isDueToday = isToday(dueDate);
        const isDueTomorrow = isTomorrow(dueDate);

        if (isOverdue || isDueToday || isDueTomorrow) {
          newNotifications.push({
            id: `activity-${activity.id}`,
            type: 'activity',
            title: activity.title || activity.activity_type,
            description: `Activity: ${activity.activity_type}`,
            dueDate: activity.due_date!,
            priority: isOverdue ? 'high' : isDueToday ? 'high' : 'medium',
            link: activity.contact_id
              ? `/crm/contacts/${activity.contact_id}`
              : activity.deal_id
                ? `/crm/pipeline`
                : undefined,
            metadata: {
              activity_id: activity.id,
              contact_id: activity.contact_id || undefined,
              deal_id: activity.deal_id || undefined,
            },
          });
        }
      });

    // Sort by priority and due date
    newNotifications.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    setNotifications(newNotifications);
  }, [followUps, activities]);

  const handleDismiss = (notificationId: string) => {
    setDismissedIds(prev => new Set([...prev, notificationId]));
    onDismiss?.(notificationId);
  };

  const handleMarkRead = (notificationId: string) => {
    setDismissedIds(prev => new Set([...prev, notificationId]));
    onMarkRead?.(notificationId);
  };

  const visibleNotifications = notifications.filter(
    n => !dismissedIds.has(n.id)
  );

  const getDueDateStatus = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date))
      return {
        label: 'Overdue',
        color: 'bg-red-100 text-red-800 border-red-200',
      };
    if (isToday(date))
      return {
        label: 'Today',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
      };
    if (isTomorrow(date))
      return {
        label: 'Tomorrow',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      };
    return {
      label: format(date, 'MMM d'),
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    };
  };

  const getNotificationIcon = (
    type: Notification['type'],
    priority: Notification['priority']
  ) => {
    if (priority === 'high') return AlertCircle;
    if (type === 'follow_up') return Calendar;
    if (type === 'activity') return Clock;
    return Bell;
  };

  if (visibleNotifications.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">All caught up!</p>
        <p className="text-xs text-muted-foreground">
          No pending notifications
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visibleNotifications.map(notification => {
        const status = getDueDateStatus(notification.dueDate);
        const Icon = getNotificationIcon(
          notification.type,
          notification.priority
        );

        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3',
              notification.priority === 'high' && 'border-red-200 bg-red-50/50',
              notification.priority === 'medium' &&
              'border-orange-200 bg-orange-50/50'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                notification.priority === 'high'
                  ? 'bg-red-100 text-red-600'
                  : notification.priority === 'medium'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-blue-100 text-blue-600'
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {notification.title}
                </span>
                <Badge
                  variant="outline"
                  className={cn('text-xs', status.color)}
                >
                  {status.label}
                </Badge>
              </div>
              {notification.description && (
                <p className="text-xs text-muted-foreground">
                  {notification.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(notification.dueDate), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              {notification.link && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    window.location.href = notification.link!;
                    handleMarkRead(notification.id);
                  }}
                >
                  →
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleDismiss(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
