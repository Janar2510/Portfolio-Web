import { useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionOptions {
  channel: string;
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: { new: any; old: any }) => void;
  onDelete?: (payload: any) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription(
  options: UseRealtimeSubscriptionOptions
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const enabled = options.enabled !== false;
  const callbacksRef = useRef({
    onInsert: options.onInsert,
    onUpdate: options.onUpdate,
    onDelete: options.onDelete,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onInsert: options.onInsert,
      onUpdate: options.onUpdate,
      onDelete: options.onDelete,
    };
  }, [options.onInsert, options.onUpdate, options.onDelete]);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(options.channel)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: 'public',
          table: options.table,
          filter: options.filter,
        },
        payload => {
          if (payload.eventType === 'INSERT' && callbacksRef.current.onInsert) {
            callbacksRef.current.onInsert(payload.new);
          } else if (
            payload.eventType === 'UPDATE' &&
            callbacksRef.current.onUpdate
          ) {
            callbacksRef.current.onUpdate({
              new: payload.new,
              old: payload.old,
            });
          } else if (
            payload.eventType === 'DELETE' &&
            callbacksRef.current.onDelete
          ) {
            callbacksRef.current.onDelete(payload.old);
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${options.channel}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Channel error for ${options.channel}`);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [
    options.channel,
    options.table,
    options.filter,
    options.event,
    enabled,
    supabase,
  ]);

  return channelRef.current;
}
