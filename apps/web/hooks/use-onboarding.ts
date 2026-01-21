'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingStore } from '@/stores/onboarding-store';
import type { OnboardingStepId } from '@/lib/onboarding/steps';

export function useOnboarding() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { setProgress, progress, isLoading: storeLoading } = useOnboardingStore();

  // Fetch onboarding progress
  const { data, isLoading, error } = useQuery({
    queryKey: ['onboarding-progress'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      // If no progress exists, create it
      if (!progressData) {
        const { data: newProgress, error: createError } = await supabase
          .from('onboarding_progress')
          .insert({
            user_id: user.id,
            status: 'not_started',
          })
          .select()
          .single();

        if (createError) throw createError;
        return newProgress;
      }

      return progressData;
    },
  });

  // Update store when data loads
  useEffect(() => {
    if (data) {
      setProgress({
        status: data.status as 'not_started' | 'in_progress' | 'completed' | 'skipped',
        current_step: data.current_step,
        current_substep: data.current_substep,
        steps_completed: data.steps_completed as Record<OnboardingStepId, boolean>,
        user_type: data.user_type as any,
        primary_goal: data.primary_goal as any,
        selected_template_id: data.selected_template_id,
        steps_skipped: data.steps_skipped || [],
      });
    }
  }, [data, setProgress]);

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (updates: Partial<NonNullable<typeof progress>>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert updates to database format
      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.status) dbUpdates.status = updates.status;
      if (updates.current_step !== undefined) dbUpdates.current_step = updates.current_step;
      if (updates.current_substep !== undefined) dbUpdates.current_substep = updates.current_substep;
      if (updates.steps_completed) dbUpdates.steps_completed = updates.steps_completed;
      if (updates.user_type !== undefined) dbUpdates.user_type = updates.user_type;
      if (updates.primary_goal !== undefined) dbUpdates.primary_goal = updates.primary_goal;
      if (updates.selected_template_id !== undefined) dbUpdates.selected_template_id = updates.selected_template_id;
      if (updates.steps_skipped) dbUpdates.steps_skipped = updates.steps_skipped;
      if (updates.completed_at) dbUpdates.completed_at = updates.completed_at;

      const { data: updated, error } = await supabase
        .from('onboarding_progress')
        .update(dbUpdates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
      if (updated) {
        setProgress({
          status: updated.status as any,
          current_step: updated.current_step,
          current_substep: updated.current_substep,
          steps_completed: updated.steps_completed as Record<OnboardingStepId, boolean>,
          user_type: updated.user_type as any,
          primary_goal: updated.primary_goal as any,
          selected_template_id: updated.selected_template_id,
          steps_skipped: updated.steps_skipped || [],
        });
      }
    },
  });

  // Log event mutation
  const logEventMutation = useMutation({
    mutationFn: async (event: {
      event_type: string;
      step_name?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('onboarding_events').insert({
        user_id: user.id,
        ...event,
      });

      if (error) throw error;
    },
  });

  return {
    progress,
    isLoading: isLoading || storeLoading,
    error,
    updateProgress: updateProgressMutation.mutateAsync,
    logEvent: logEventMutation.mutateAsync,
  };
}
