'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building2, MapPin, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import type { Contact, Company, CRMActivity, Deal } from '@/lib/services/crm';

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch contact
  const { data: contact, isLoading: contactLoading } = useQuery({
    queryKey: ['crm-contact', params.id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', params.id)
        .single();
      if (error) throw error;
      return data as Contact;
    },
  });

  // Fetch company
  const { data: company } = useQuery({
    queryKey: ['crm-company', contact?.company_id],
    queryFn: async () => {
      if (!contact?.company_id) return null;
      const supabase = createClient();
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', contact.company_id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return (data || null) as Company | null;
    },
    enabled: !!contact?.company_id,
  });

  // Fetch activities
  const { data: activities = [] } = useQuery({
    queryKey: ['crm-activities', params.id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('contact_id', params.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CRMActivity[];
    },
  });

  // Fetch deals
  const { data: deals = [] } = useQuery({
    queryKey: ['crm-deals', params.id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('contact_id', params.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Deal[];
    },
  });

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (activity: {
      contact_id?: string;
      deal_id?: string;
      activity_type: string;
      title?: string;
      description?: string;
      is_completed?: boolean;
      due_date?: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('crm_activities')
        .insert(activity)
        .select()
        .single();
      if (error) throw error;
      return data as CRMActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-activities', params.id] });
      queryClient.invalidateQueries({ queryKey: ['crm-contact', params.id] });
    },
  });

  // Update activity mutation
  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CRMActivity> }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('crm_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as CRMActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-activities', params.id] });
    },
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('crm_activities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-activities', params.id] });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      router.push('/crm/contacts');
    },
  });

  if (contactLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading contact...</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Contact not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/crm/contacts')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/crm/contacts')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {contact.avatar_url ? (
                <img
                  src={contact.avatar_url}
                  alt={`${contact.first_name} ${contact.last_name || ''}`}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold">
                  {contact.first_name[0]}
                  {contact.last_name?.[0]}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {contact.first_name} {contact.last_name}
              </h1>
              {contact.job_title && (
                <p className="text-muted-foreground">{contact.job_title}</p>
              )}
              {company && (
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {company.name}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete this contact?')) {
                  deleteContactMutation.mutate(contact.id);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Contact Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <div className="space-y-3">
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-sm hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {contact.address.street && <div>{contact.address.street}</div>}
                      {contact.address.city && contact.address.country && (
                        <div>
                          {contact.address.city}, {contact.address.country}
                        </div>
                      )}
                      {contact.address.postal && (
                        <div>{contact.address.postal}</div>
                      )}
                    </div>
                  </div>
                )}
                {contact.last_contacted_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Last contacted:{' '}
                      {format(new Date(contact.last_contacted_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Details</h2>
              <div className="space-y-3">
                {contact.lead_source && (
                  <div>
                    <div className="text-xs text-muted-foreground">Lead Source</div>
                    <div className="text-sm">{contact.lead_source}</div>
                  </div>
                )}
                {contact.tags.length > 0 && (
                  <div>
                    <div className="mb-2 text-xs text-muted-foreground">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="text-sm">
                    {format(new Date(contact.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deals */}
          {deals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Deals ({deals.length})</h2>
              <div className="space-y-2">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{deal.title}</div>
                        {deal.value && (
                          <div className="text-sm text-muted-foreground">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: deal.currency || 'EUR',
                            }).format(deal.value)}
                          </div>
                        )}
                      </div>
                      {deal.expected_close_date && (
                        <div className="text-sm text-muted-foreground">
                          Expected: {format(new Date(deal.expected_close_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <ActivityTimeline
            activities={activities}
            onActivityCreate={async (activity) => {
              await createActivityMutation.mutateAsync(activity);
            }}
            onActivityUpdate={async (activityId, updates) => {
              await updateActivityMutation.mutateAsync({ id: activityId, updates });
            }}
            onActivityDelete={async (activityId) => {
              await deleteActivityMutation.mutateAsync(activityId);
            }}
            contactId={contact.id}
          />
        </div>
      </div>
    </div>
  );
}
