'use client';

import { useState } from 'react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { Bell, CheckCircle2, Clock, Plus, Calendar, User, Building2, Briefcase } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { FollowUp, Contact, Deal } from '@/lib/services/crm';

interface FollowUpRemindersProps {
  followUps: FollowUp[];
  contacts: Contact[];
  deals: Deal[];
  onFollowUpCreate: (followUp: {
    contact_id?: string;
    deal_id?: string;
    title: string;
    due_date: string;
  }) => Promise<void>;
  onFollowUpUpdate: (followUpId: string, updates: Partial<FollowUp>) => Promise<void>;
  onFollowUpDelete: (followUpId: string) => Promise<void>;
}

export function FollowUpReminders({
  followUps,
  contacts,
  deals,
  onFollowUpCreate,
  onFollowUpUpdate,
  onFollowUpDelete,
}: FollowUpRemindersProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateFollowUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dueDate = formData.get('due_date')?.toString();
    const dueTime = formData.get('due_time')?.toString();

    if (!dueDate) return;

    // Combine date and time
    const dueDateTime = dueTime
      ? `${dueDate}T${dueTime}`
      : `${dueDate}T09:00:00`;

    await onFollowUpCreate({
      contact_id: formData.get('contact_id')?.toString() || undefined,
      deal_id: formData.get('deal_id')?.toString() || undefined,
      title: formData.get('title') as string,
      due_date: dueDateTime,
    });
    setIsCreateDialogOpen(false);
    e.currentTarget.reset();
  };

  const handleToggleComplete = async (followUp: FollowUp) => {
    await onFollowUpUpdate(followUp.id, {
      is_completed: !followUp.is_completed,
    });
  };

  // Separate follow-ups by status
  const upcoming = followUps
    .filter((f) => !f.is_completed && !isPast(new Date(f.due_date)))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const overdue = followUps
    .filter((f) => !f.is_completed && isPast(new Date(f.due_date)))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const completed = followUps
    .filter((f) => f.is_completed)
    .sort((a, b) => new Date(b.completed_at || b.due_date).getTime() - new Date(a.completed_at || a.due_date).getTime())
    .slice(0, 10); // Show only recent 10 completed

  const getFollowUpContext = (followUp: FollowUp) => {
    if (followUp.contact_id) {
      const contact = contacts.find((c) => c.id === followUp.contact_id);
      return contact ? { type: 'contact', name: `${contact.first_name} ${contact.last_name}`, icon: User } : null;
    }
    if (followUp.deal_id) {
      const deal = deals.find((d) => d.id === followUp.deal_id);
      return deal ? { type: 'deal', name: deal.title, icon: Briefcase } : null;
    }
    return null;
  };

  const getDueDateStatus = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date)) return { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200' };
    if (isToday(date)) return { label: 'Today', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (isTomorrow(date)) return { label: 'Tomorrow', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { label: format(date, 'MMM d'), color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Follow-up Reminders</h3>
          <p className="text-sm text-muted-foreground">
            Track and manage your follow-up tasks
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateFollowUp}>
              <DialogHeader>
                <DialogTitle>Create Follow-up</DialogTitle>
                <DialogDescription>
                  Set a reminder to follow up with a contact or deal.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" required placeholder="e.g., Follow up on proposal" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_id">Contact</Label>
                    <Select name="contact_id">
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deal_id">Deal</Label>
                    <Select name="deal_id">
                      <SelectTrigger>
                        <SelectValue placeholder="Select deal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {deals.map((deal) => (
                          <SelectItem key={deal.id} value={deal.id}>
                            {deal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date *</Label>
                    <Input id="due_date" name="due_date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_time">Due Time</Label>
                    <Input id="due_time" name="due_time" type="time" />
                  </div>
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

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-red-600">Overdue ({overdue.length})</h4>
          <div className="space-y-2">
            {overdue.map((followUp) => {
              const context = getFollowUpContext(followUp);
              const status = getDueDateStatus(followUp.due_date);
              return (
                <div
                  key={followUp.id}
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/50 p-3"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleToggleComplete(followUp)}
                  >
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{followUp.title}</span>
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    {context && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <context.icon className="h-3 w-3" />
                        <span>{context.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(followUp.due_date), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => onFollowUpDelete(followUp.id)}
                  >
                    ×
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Upcoming ({upcoming.length})</h4>
          <div className="space-y-2">
            {upcoming.map((followUp) => {
              const context = getFollowUpContext(followUp);
              const status = getDueDateStatus(followUp.due_date);
              return (
                <div
                  key={followUp.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleToggleComplete(followUp)}
                  >
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{followUp.title}</span>
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    {context && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <context.icon className="h-3 w-3" />
                        <span>{context.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(followUp.due_date), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => onFollowUpDelete(followUp.id)}
                  >
                    ×
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Recently Completed</h4>
          <div className="space-y-2">
            {completed.map((followUp) => {
              const context = getFollowUpContext(followUp);
              return (
                <div
                  key={followUp.id}
                  className="flex items-start gap-3 rounded-lg border border-muted bg-muted/30 p-3 opacity-75"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium line-through">{followUp.title}</span>
                    </div>
                    {context && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <context.icon className="h-3 w-3" />
                        <span>{context.name}</span>
                      </div>
                    )}
                    {followUp.completed_at && (
                      <div className="text-xs text-muted-foreground">
                        Completed: {format(new Date(followUp.completed_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {followUps.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No follow-ups yet. Create your first follow-up reminder!
        </div>
      )}
    </div>
  );
}
