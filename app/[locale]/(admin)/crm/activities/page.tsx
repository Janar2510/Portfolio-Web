'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { FollowUpReminders } from '@/components/crm/FollowUpReminders';
import { NotificationsPanel } from '@/components/crm/NotificationsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import type { CRMActivity, FollowUp, Contact, Deal } from '@/domain/crm/crm';

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
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CRMActivity>;
    }) => {
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
      const { error } = await supabase
        .from('crm_activities')
        .delete()
        .eq('id', activityId);
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
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<FollowUp>;
    }) => {
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
      const { error } = await supabase
        .from('follow_ups')
        .delete()
        .eq('id', followUpId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-follow-ups'] });
    },
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-fade-up max-w-[1440px] mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="w-32 h-6 bg-white/5 rounded-full animate-pulse" />
            <div className="w-64 h-12 bg-white/5 rounded-2xl animate-pulse" />
          </div>
        </div>
        <div className="h-[400px] w-full bg-white/5 rounded-[2.5rem] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-[1440px] mx-auto py-12 px-6">
      {/* Pulse-style Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Activities Online
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white m-0 font-display">
            Activities
          </h1>
          <p className="text-lg text-white/40 max-w-xl">
            Stay on top of your interactions and follow-ups.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="gap-2 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 px-8 h-12"
          >
            <Calendar className="w-4 h-4" />
            <span>View Calendar</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
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
                onActivityCreate={async activity => {
                  await createActivityMutation.mutateAsync(activity);
                }}
                onActivityUpdate={async (activityId, updates) => {
                  await updateActivityMutation.mutateAsync({
                    id: activityId,
                    updates,
                  });
                }}
                onActivityDelete={async activityId => {
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
                onFollowUpCreate={async followUp => {
                  await createFollowUpMutation.mutateAsync(followUp);
                }}
                onFollowUpUpdate={async (followUpId, updates) => {
                  await updateFollowUpMutation.mutateAsync({
                    id: followUpId,
                    updates,
                  });
                }}
                onFollowUpDelete={async followUpId => {
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
