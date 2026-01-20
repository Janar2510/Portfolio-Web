'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Mail, Phone, Calendar, FileText, CheckCircle2, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CRMActivity, ActivityType } from '@/lib/services/crm';

interface ActivityTimelineProps {
  activities: CRMActivity[];
  onActivityCreate: (activity: {
    contact_id?: string;
    deal_id?: string;
    activity_type: ActivityType;
    title?: string;
    description?: string;
    is_completed?: boolean;
    due_date?: string;
  }) => Promise<void>;
  onActivityUpdate: (activityId: string, updates: Partial<CRMActivity>) => Promise<void>;
  onActivityDelete: (activityId: string) => Promise<void>;
  contactId?: string;
  dealId?: string;
}

const activityIcons = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: FileText,
  task: CheckCircle2,
};

const activityColors = {
  email: 'bg-blue-100 text-blue-800 border-blue-200',
  call: 'bg-green-100 text-green-800 border-green-200',
  meeting: 'bg-purple-100 text-purple-800 border-purple-200',
  note: 'bg-gray-100 text-gray-800 border-gray-200',
  task: 'bg-orange-100 text-orange-800 border-orange-200',
};

export function ActivityTimeline({
  activities,
  onActivityCreate,
  onActivityUpdate,
  onActivityDelete,
  contactId,
  dealId,
}: ActivityTimelineProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const activityType = formData.get('activity_type') as ActivityType;
    const dueDate = formData.get('due_date')?.toString();

    await onActivityCreate({
      contact_id: contactId,
      deal_id: dealId,
      activity_type: activityType,
      title: formData.get('title')?.toString() || undefined,
      description: formData.get('description')?.toString() || undefined,
      is_completed: activityType !== 'task' || formData.get('is_completed') === 'true',
      due_date: dueDate || undefined,
    });
    setIsCreateDialogOpen(false);
    e.currentTarget.reset();
  };

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity Timeline</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateActivity}>
              <DialogHeader>
                <DialogTitle>Add Activity</DialogTitle>
                <DialogDescription>
                  Record an interaction or activity.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="activity_type">Activity Type *</Label>
                  <Select name="activity_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="Activity title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Activity details..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date (for tasks)</Label>
                  <Input id="due_date" name="due_date" type="datetime-local" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sortedActivities.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No activities yet. Add your first activity!
          </div>
        ) : (
          sortedActivities.map((activity) => {
            const Icon = activityIcons[activity.activity_type];
            const colorClass = activityColors[activity.activity_type];

            return (
              <div
                key={activity.id}
                className="flex gap-4 rounded-lg border p-4"
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                    colorClass
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={colorClass}>
                        {activity.activity_type}
                      </Badge>
                      {activity.title && (
                        <span className="font-medium">{activity.title}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {activity.is_completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-600" />
                      )}
                      {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                  {activity.due_date && !activity.is_completed && (
                    <div className="text-xs text-muted-foreground">
                      Due: {format(new Date(activity.due_date), 'MMM d, yyyy h:mm a')}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={async () => {
                        await onActivityUpdate(activity.id, {
                          is_completed: !activity.is_completed,
                        });
                      }}
                    >
                      {activity.is_completed ? (
                        <>
                          <Clock className="mr-1 h-3 w-3" />
                          Mark Incomplete
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive"
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this activity?')) {
                          await onActivityDelete(activity.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
