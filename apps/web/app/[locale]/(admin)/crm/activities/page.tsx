'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { FollowUpReminders } from '@/components/crm/FollowUpReminders';
import { NotificationsPanel } from '@/components/crm/NotificationsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CRMActivity, FollowUp, Contact, Deal } from '@/lib/services/crm';

export default function ActivitiesPage() {
  const queryClient = useQueryClient();

  // Fetch all activities
  const { data: activities = [] } = useQuery({
    queryKey: ['crm-activities'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CRMActivity[];
    },
  });

  // Fetch all follow-ups
  const { data: followUps = [] } = useQuery({
    queryKey: ['crm-follow-ups'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (data || []) as FollowUp[];
    },
  });

  // Fetch contacts for context
  const { data: contacts = [] } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Contact[];
    },
  });

  // Fetch deals for context
  const { data: deals = [] } = useQuery({
    queryKey: ['crm-deals'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('deals')
        .select('*')
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
        .insert({
          ...activity,
          is_completed: activity.is_completed ?? true,
        })
        .select()
        .single();
      if (error) throw error;
      return data as CRMActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-activities'] });
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
      queryClient.invalidateQueries({ queryKey: ['crm-activities'] });
    },
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('crm_activities').delete().eq('id', activityId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-activities'] });
    },
  });

  // Create follow-up mutation
  const createFollowUpMutation = useMutation({
    mutationFn: async (followUp: {
      contact_id?: string;
      deal_id?: string;
      title: string;
      due_date: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('follow_ups')
        .insert(followUp)
        .select()
        .single();
      if (error) throw error;
      return data as FollowUp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-follow-ups'] });
    },
  });

  // Update follow-up mutation
  const updateFollowUpMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FollowUp> }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('follow_ups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as FollowUp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-follow-ups'] });
    },
  });

  // Delete follow-up mutation
  const deleteFollowUpMutation = useMutation({
    mutationFn: async (followUpId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('follow_ups').delete().eq('id', followUpId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-follow-ups'] });
    },
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(142_60%_6%)] to-[hsl(var(--background))] animate-fade-in">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 animate-slide-down">
        <h1 className="text-2xl font-bold text-foreground">Activities & Follow-ups</h1>
        <p className="text-sm text-muted-foreground">
          Manage your CRM activities and follow-up reminders
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 animate-fade-in">
        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <div className="rounded-lg border p-4">
              <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
              <NotificationsPanel
                followUps={followUps}
                activities={activities}
              />
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <div className="rounded-lg border p-4">
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
              />
            </div>
          </TabsContent>

          <TabsContent value="follow-ups" className="space-y-4">
            <div className="rounded-lg border p-4">
              <FollowUpReminders
                followUps={followUps}
                contacts={contacts}
                deals={deals}
                onFollowUpCreate={async (followUp) => {
                  await createFollowUpMutation.mutateAsync(followUp);
                }}
                onFollowUpUpdate={async (followUpId, updates) => {
                  await updateFollowUpMutation.mutateAsync({ id: followUpId, updates });
                }}
                onFollowUpDelete={async (followUpId) => {
                  await deleteFollowUpMutation.mutateAsync(followUpId);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
