'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  Percent,
  FileText,
  Edit2,
  Trash2,
  User,
  Building2,
  Mail,
  Phone,
  CheckSquare,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { ActivityComposer } from './ActivityComposer';
import { Timeline, type TimelineItem } from './Timeline';
import type { Deal, Contact, Company, PipelineStage, CRMActivity } from '@/domain/crm/crm';
import type { Email } from '@/domain/email/email';

interface DealDetailModalProps {
  deal: Deal | null;
  stages: PipelineStage[];
  contacts: Contact[];
  companies: Company[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (dealId: string, updates: Partial<Deal>) => Promise<void>;
  onDelete: (dealId: string) => Promise<void>;
}

export function DealDetailModal({
  deal,
  stages,
  contacts,
  companies,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: DealDetailModalProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Deal>>({});

  // Initialize form data when deal changes
  useEffect(() => {
    if (deal) {
      setEditFormData({
        title: deal.title,
        value: deal.value,
        currency: deal.currency,
        stage_id: deal.stage_id,
        contact_id: deal.contact_id,
        company_id: deal.company_id,
        expected_close_date: deal.expected_close_date || undefined,
        probability: deal.probability,
        notes: deal.notes,
      });
      setIsEditing(false);
    }
  }, [deal]);

  // Fetch Activities
  const { data: activities = [] } = useQuery({
    queryKey: ['crm-activities', deal?.id],
    queryFn: async () => {
      if (!deal?.id) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('deal_id', deal.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CRMActivity[];
    },
    enabled: !!deal?.id,
  });

  // Fetch Emails
  const { data: emails = [] } = useQuery({
    queryKey: ['crm-emails', deal?.id],
    queryFn: async () => {
      if (!deal?.id) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('deal_id', deal.id)
        .order('sent_at', { ascending: false });
      // If error (e.g. table missing or RLS), return empty
      if (error) return [];
      return (data || []) as Email[];
    },
    enabled: !!deal?.id
  });

  // Create Activity Mutation
  const createActivityMutation = useMutation({
    mutationFn: async (activity: Partial<CRMActivity>) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { error } = await supabase
        .from('crm_activities')
        .insert({
          ...activity,
          user_id: user.id
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-activities', deal?.id] });
    }
  });

  if (!deal) return null;

  const currentStage = stages.find(s => s.id === deal.stage_id);
  const contact = deal.contact_id ? contacts.find(c => c.id === deal.contact_id) : null;
  const company = deal.company_id ? companies.find(c => c.id === deal.company_id) : null;

  const timelineItems: TimelineItem[] = [
    ...activities.map(a => ({ ...a, type: 'activity' as const })),
    ...emails.map(e => ({ ...e, type: 'email' as const }))
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(deal.id, editFormData);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-sm" aria-describedby="deal-detail-description">
        <DialogDescription id="deal-detail-description" className="sr-only">
          Details and activity timeline for the deal {deal.title}
        </DialogDescription>

        {/* Header */}
        <DialogHeader className="p-4 border-b flex-shrink-0 flex flex-row items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: currentStage?.color || '#3b82f6' }}
            >
              {deal.value ? (
                new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency || 'USD', notation: 'compact' }).format(deal.value)
              ) : '$'}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{deal.title}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span style={{ color: currentStage?.color || undefined }}>●</span>
                  {currentStage?.name}
                </span>
                <span>•</span>
                <span>{contact?.first_name} {contact?.last_name}</span>
                {company && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {company.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => {
              if (confirm('Delete deal?')) {
                try {
                  await onDelete(deal.id);
                  onClose();
                } catch (error) {
                  console.error('Failed to delete deal:', error);
                  alert('Failed to delete deal. Please try again.');
                }
              }
            }}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* content grid */}
        <div className="flex-1 flex overflow-hidden">

          {/* Main Content (Timeline & Composer) - Left Side */}
          <div className="flex-1 flex flex-col overflow-hidden border-r bg-muted/10">
            <ScrollArea className="flex-1">
              <div className="p-6 max-w-3xl mx-auto space-y-8">
                {/* Composer */}
                <ActivityComposer
                  dealId={deal.id}
                  onNoteCreate={async (content) => {
                    await createActivityMutation.mutateAsync({
                      deal_id: deal.id,
                      activity_type: 'note',
                      title: 'Note',
                      description: content,
                      is_completed: true
                    });
                  }}
                  onActivityCreate={async (activity) => {
                    await createActivityMutation.mutateAsync(activity);
                  }}
                />

                {/* Timeline */}
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">History</h3>
                  <Timeline items={timelineItems} />
                </div>
              </div>
            </ScrollArea>

            {/* Visual Pipeline Bar at bottom (Pipedrive specific style, but maybe top is better) */}
            {/* For now keeping top header stage indicator is enough, or we can add a bar here */}
          </div>

          {/* Sidebar (Details) - Right Side */}
          <div className="w-80 flex-shrink-0 bg-background border-l flex flex-col overflow-y-auto">
            {isEditing ? (
              <form onSubmit={handleSave} className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <div className="flex gap-2">
                    <Input type="number" value={editFormData.value || ''} onChange={e => setEditFormData({ ...editFormData, value: parseFloat(e.target.value) })} />
                    <Select value={editFormData.currency} onValueChange={v => setEditFormData({ ...editFormData, currency: v })}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select value={editFormData.stage_id} onValueChange={v => setEditFormData({ ...editFormData, stage_id: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {/* Other fields like date etc */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            ) : (
              <div className="p-4 space-y-6">
                {/* Summary Card */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                    <span>Deal Details</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Value</span>
                      <span className="font-medium text-right">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency || 'USD' }).format(deal.value || 0)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Probability</span>
                      <span className="font-medium text-right">{deal.probability || 0}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Exp. Close</span>
                      <span className="font-medium text-right">
                        {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Person Card */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Person</h4>
                  {contact ? (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{contact.first_name} {contact.last_name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{contact.email}</div>
                        <div className="text-xs text-muted-foreground">{contact.phone}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">No person linked</div>
                  )}
                </div>

                <Separator />

                {/* Organization Card */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Organization</h4>
                  {company ? (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{company.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{company.address?.city || 'No location'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">No organization linked</div>
                  )}
                </div>

                {/* Participants / Followers - Placeholder */}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
