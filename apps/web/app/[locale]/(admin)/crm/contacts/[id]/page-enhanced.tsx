'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CRMEnhancedService } from '@/lib/services/crm-enhanced';
import { ContactAvatar } from '@/components/ui/contact-avatar';
import { LabelPicker } from '@/components/crm/LabelPicker';
import { NotesList } from '@/components/crm/NotesList';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Building2, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Person, Label, Note, Activity } from '@/lib/crm/types';

export default function PersonDetailPageEnhanced() {
  const params = useParams();
  const personId = params.id as string;
  const queryClient = useQueryClient();
  const supabase = createClient();
  const crmService = new CRMEnhancedService(supabase);

  // Fetch person
  const { data: person, isLoading: personLoading } = useQuery({
    queryKey: ['crm-person', personId],
    queryFn: () => crmService.getPersonById(personId),
    enabled: !!personId,
  });

  // Fetch organization if linked
  const { data: organization } = useQuery({
    queryKey: ['crm-organization', person?.organization_id],
    queryFn: () =>
      person?.organization_id
        ? crmService.getOrganizationById(person.organization_id)
        : null,
    enabled: !!person?.organization_id,
  });

  // Fetch labels
  const { data: labels = [] } = useQuery({
    queryKey: ['crm-labels-persons'],
    queryFn: () => crmService.getLabels('person'),
  });

  // Fetch notes
  const { data: notes = [] } = useQuery({
    queryKey: ['crm-notes', personId],
    queryFn: () => crmService.getNotes({ person_id: personId }),
    enabled: !!personId,
  });

  // Fetch activities
  const { data: activities = [] } = useQuery({
    queryKey: ['crm-activities', personId],
    queryFn: () => crmService.getActivities({ person_id: personId }),
    enabled: !!personId,
  });

  // Mutations
  const updatePersonMutation = useMutation({
    mutationFn: (updates: Partial<Person>) =>
      crmService.updatePerson(personId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-person', personId] });
    },
  });

  const createLabelMutation = useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      crmService.createLabel({ entity_type: 'person', name, color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-labels-persons'] });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (note: { content: string; is_pinned?: boolean }) =>
      crmService.createNote({ ...note, person_id: personId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes', personId] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Note> }) =>
      crmService.updateNote(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes', personId] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => crmService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes', personId] });
    },
  });

  if (personLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading person...</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Person not found</p>
      </div>
    );
  }

  const primaryEmail = person.emails.find(e => e.primary) || person.emails[0];
  const primaryPhone = person.phones.find(p => p.primary) || person.phones[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-6">
        <ContactAvatar
          name={person.name}
          avatarUrl={person.avatar_url}
          size="lg"
        />
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold">{person.name}</h1>
            {person.job_title && (
              <Badge variant="outline">{person.job_title}</Badge>
            )}
          </div>
          {organization && (
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Building2 className="h-4 w-4" />
              <span>{organization.name}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {primaryEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{primaryEmail.value}</span>
              </div>
            )}
            {primaryPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{primaryPhone.value}</span>
              </div>
            )}
            {person.last_activity_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Last activity:{' '}
                  {format(new Date(person.last_activity_at), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Labels */}
      <Card>
        <CardHeader>
          <CardTitle>Labels</CardTitle>
        </CardHeader>
        <CardContent>
          <LabelPicker
            labels={labels}
            selectedLabelIds={person.label_ids || []}
            onLabelsChange={async labelIds => {
              await updatePersonMutation.mutateAsync({ label_ids: labelIds });
            }}
            onCreateLabel={async (name, color) => {
              return await createLabelMutation.mutateAsync({ name, color });
            }}
            entityType="person"
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesList
            notes={notes}
            onCreateNote={async note => {
              await createNoteMutation.mutateAsync(note);
            }}
            onUpdateNote={async (id, updates) => {
              await updateNoteMutation.mutateAsync({ id, updates });
            }}
            onDeleteNote={async id => {
              await deleteNoteMutation.mutateAsync(id);
            }}
            entityType="person"
            entityId={personId}
          />
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline
            activities={activities.map(a => ({
              id: a.id,
              user_id: a.user_id,
              contact_id: a.person_id || undefined,
              deal_id: a.deal_id || undefined,
              activity_type: a.activity_type as any,
              title: a.subject,
              description: a.note || undefined,
              metadata: {},
              is_completed: a.is_done,
              due_date: a.due_date || undefined,
              completed_at: a.done_at || undefined,
              created_at: a.created_at,
            }))}
            onActivityCreate={async activity => {
              await crmService.createActivity({
                activity_type: activity.activity_type as any,
                subject: activity.title || 'Activity',
                note: activity.description,
                due_date: activity.due_date,
                person_id: personId,
              });
              queryClient.invalidateQueries({
                queryKey: ['crm-activities', personId],
              });
            }}
            onActivityUpdate={async (id, updates) => {
              await crmService.updateActivity(id, {
                subject: updates.title,
                note: updates.description,
                is_done: updates.is_completed,
              });
              queryClient.invalidateQueries({
                queryKey: ['crm-activities', personId],
              });
            }}
            onActivityDelete={async id => {
              await crmService.deleteActivity(id);
              queryClient.invalidateQueries({
                queryKey: ['crm-activities', personId],
              });
            }}
            contactId={personId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
