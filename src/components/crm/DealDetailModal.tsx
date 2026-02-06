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

  // Send Email Mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: { to: string; subject: string; body: string }) => {
      if (!deal?.id) throw new Error('Deal ID not found');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { error } = await supabase
        .from('emails')
        .insert({
          deal_id: deal.id,
          user_id: user.id,
          to_address: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          sent_at: new Date().toISOString(),
          status: 'sent',
          from_address: user.email // optional, might be useful
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-emails', deal?.id] });
      // We also invalidate activities because ActivityComposer adds a log entry
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
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-black/40 backdrop-blur-3xl border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-foreground rounded-[3rem]" aria-describedby="deal-detail-description">
        <DialogDescription id="deal-detail-description" className="sr-only">
          Details and activity timeline for the deal {deal.title}
        </DialogDescription>

        {/* Header */}
        <DialogHeader className="p-8 border-b border-white/5 flex-shrink-0 flex flex-row items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-5">
            <div
              className="h-14 w-14 rounded-[1.5rem] flex items-center justify-center text-white text-lg font-black font-display shadow-glow-soft"
              style={{ backgroundColor: currentStage?.color || 'hsl(var(--primary))' }}
            >
              {deal.value ? (
                new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency || 'USD', notation: 'compact' }).format(deal.value)
              ) : <DollarSign className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-bold tracking-tight text-white font-display uppercase">{deal.title}</DialogTitle>
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentStage?.color || undefined }}></span>
                  <span className="text-white/60">{currentStage?.name}</span>
                </span>
                <span className="text-white/20">•</span>
                <span className="text-white/60 flex items-center gap-2"><User className="h-3.5 w-3.5" /> {contact?.first_name} {contact?.last_name}</span>
                {company && (
                  <>
                    <span className="text-white/20">•</span>
                    <span className="text-white/60 flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> {company.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} className="rounded-xl border border-white/5 hover:bg-white/5 text-white/40 hover:text-white transition-all">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl border border-white/5 hover:bg-white/5 text-white/40 hover:text-destructive transition-all" onClick={async () => {
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
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl border border-white/5 hover:bg-white/5 text-white/40 hover:text-white transition-all">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* content grid */}
        <div className="flex-1 flex overflow-hidden">

          {/* Main Content (Timeline & Composer) - Left Side */}
          <div className="flex-1 flex flex-col overflow-hidden border-r premium-border bg-[hsl(var(--bg-elevated))]/20">
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
                  onEmailSend={async (email) => {
                    await sendEmailMutation.mutateAsync(email);
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
          <div className="w-96 flex-shrink-0 bg-white/[0.01] border-l border-white/5 flex flex-col overflow-y-auto">
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
                <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl text-white/40 hover:text-white hover:bg-white/5">Cancel</Button>
                  <Button type="submit" className="rounded-xl bg-primary text-white hover:bg-primary/90 shadow-glow-seafoam-sm px-6">Save Changes</Button>
                </div>
              </form>
            ) : (
              <div className="p-8 space-y-8">
                {/* Summary Card */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/30">Deal Details</h4>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-white/5 text-white/20 hover:text-white" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-sm font-medium text-white/40">Value</span>
                      <span className="text-xl font-bold text-white font-display">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency || 'USD' }).format(deal.value || 0)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/30">Probability</span>
                        <div className="text-lg font-bold text-primary shadow-glow-seafoam-sm inline-block">{deal.probability || 0}%</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/30">Exp. Close</span>
                        <div className="text-sm font-bold text-white/80">
                          {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                {/* Person Card */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/30">Primary Contact</h4>
                  {contact ? (
                    <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 transition-all group/contact">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover/contact:shadow-glow-soft transition-all">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white group-hover/contact:text-indigo-300 transition-colors uppercase tracking-tight">{contact.first_name} {contact.last_name}</div>
                        <div className="text-xs text-white/40 truncate mt-0.5">{contact.email}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-white/20 italic p-4 rounded-2xl border border-dashed border-white/5">No person linked</div>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                {/* Organization Card */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/30">Organization</h4>
                  {company ? (
                    <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all group/org">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover/org:shadow-glow-soft transition-all">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white group-hover/org:text-emerald-300 transition-colors uppercase tracking-tight">{company.name}</div>
                        <div className="text-xs text-white/40 truncate mt-0.5">{company.address?.city || 'No location'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-white/20 italic p-4 rounded-2xl border border-dashed border-white/5">No organization linked</div>
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
