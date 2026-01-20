# Realtime Subscriptions

This document describes how to use Supabase Realtime subscriptions for live updates across the application.

## Overview

Supabase Realtime enables real-time updates via PostgreSQL change events. We use this for collaborative features, live notifications, and keeping UI in sync across multiple clients.

## Setup

### Client Configuration

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Subscribe to changes
const channel = supabase
  .channel('channel-name')
  .on('postgres_changes', {
    event: '*', // 'INSERT', 'UPDATE', 'DELETE', or '*' for all
    schema: 'public',
    table: 'table_name',
    filter: 'column=eq.value' // Optional filter
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

## Available Channels

### Tasks Channel

Subscribe to task changes for a specific project.

```typescript
// Client subscribes to changes
const tasksChannel = supabase
  .channel('tasks')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'tasks', 
      filter: `project_id=eq.${projectId}` 
    },
    (payload) => handleTaskChange(payload)
  )
  .subscribe();

function handleTaskChange(payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Task;
  old?: Task;
}) {
  switch (payload.eventType) {
    case 'INSERT':
      // Add new task to UI
      break;
    case 'UPDATE':
      // Update existing task in UI
      break;
    case 'DELETE':
      // Remove task from UI
      break;
  }
}
```

**Use Cases:**
- Live Kanban board updates
- Task assignment notifications
- Task completion updates
- Multi-user collaboration

### Deals Channel (Pipeline Changes)

Subscribe to deal changes in the CRM pipeline.

```typescript
const dealsChannel = supabase
  .channel('deals')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'deals',
      filter: `user_id=eq.${userId}` // All deals for current user
    },
    (payload) => handleDealChange(payload)
  )
  .subscribe();

// Or filter by stage
const pipelineStageChannel = supabase
  .channel('pipeline-stage')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'deals',
      filter: `stage_id=eq.${stageId}`
    },
    (payload) => handlePipelineChange(payload)
  )
  .subscribe();

function handleDealChange(payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Deal;
  old?: Deal;
}) {
  // Update pipeline view
  // Show notifications for deal value changes
  // Update deal count in stage headers
}
```

**Use Cases:**
- Live pipeline updates
- Deal value change notifications
- Stage movement tracking
- Win/loss notifications

### CRM Activities Channel

Subscribe to activity changes for a specific contact or deal.

```typescript
// Per contact
const contactActivitiesChannel = supabase
  .channel('crm-activities-contact')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'crm_activities',
      filter: `contact_id=eq.${contactId}`
    },
    (payload) => handleActivityChange(payload)
  )
  .subscribe();

// Per deal
const dealActivitiesChannel = supabase
  .channel('crm-activities-deal')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'crm_activities',
      filter: `deal_id=eq.${dealId}`
    },
    (payload) => handleActivityChange(payload)
  )
  .subscribe();

function handleActivityChange(payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: CRMActivity;
  old?: CRMActivity;
}) {
  // Add new activity to timeline
  // Update last_contacted_at display
  // Show activity notifications
}
```

**Use Cases:**
- Live activity timeline updates
- New email/call/meeting notifications
- Contact interaction tracking
- Deal activity tracking

### Emails Channel

Subscribe to new synced emails.

```typescript
// All emails for an account
const emailsChannel = supabase
  .channel('emails')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'emails',
      filter: `account_id=eq.${accountId}`
    },
    (payload) => handleNewEmail(payload)
  )
  .subscribe();

// Specific thread
const threadChannel = supabase
  .channel('email-thread')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'emails',
      filter: `thread_id=eq.${threadId}`
    },
    (payload) => handleThreadUpdate(payload)
  )
  .subscribe();

function handleNewEmail(payload: {
  eventType: 'INSERT';
  new: Email;
}) {
  // Add to inbox
  // Show notification
  // Update unread count
  // Auto-link to contact if email matches
}
```

**Use Cases:**
- Real-time inbox updates
- New email notifications
- Thread conversation updates
- Email-to-contact auto-linking

## Reusable Hook Pattern

Create a custom React hook for managing subscriptions:

```typescript
// hooks/useRealtimeSubscription.ts
import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionOptions {
  channel: string;
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export function useRealtimeSubscription(options: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(options.channel)
      .on('postgres_changes',
        {
          event: options.event || '*',
          schema: 'public',
          table: options.table,
          filter: options.filter
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && options.onInsert) {
            options.onInsert(payload.new);
          } else if (payload.eventType === 'UPDATE' && options.onUpdate) {
            options.onUpdate({ new: payload.new, old: payload.old });
          } else if (payload.eventType === 'DELETE' && options.onDelete) {
            options.onDelete(payload.old);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.channel, options.table, options.filter]);

  return channelRef.current;
}
```

**Usage Example:**

```typescript
// In a React component
function TaskBoard({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useRealtimeSubscription({
    channel: `tasks-${projectId}`,
    table: 'tasks',
    filter: `project_id=eq.${projectId}`,
    onInsert: (newTask) => {
      setTasks(prev => [...prev, newTask]);
    },
    onUpdate: ({ new: updatedTask }) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    },
    onDelete: (deletedTask) => {
      setTasks(prev => prev.filter(t => t.id !== deletedTask.id));
    }
  });

  // ... rest of component
}
```

## Channel Naming Convention

Use descriptive, scoped channel names:

- `tasks-${projectId}` - Tasks for a specific project
- `deals-${userId}` - All deals for a user
- `pipeline-${stageId}` - Deals in a specific stage
- `activities-contact-${contactId}` - Activities for a contact
- `activities-deal-${dealId}` - Activities for a deal
- `emails-${accountId}` - Emails for an account
- `thread-${threadId}` - Messages in a thread

## Best Practices

1. **Cleanup Subscriptions**: Always unsubscribe when components unmount
2. **Filter Appropriately**: Use filters to reduce unnecessary updates
3. **Handle Errors**: Implement error handling for connection issues
4. **Debounce Updates**: For rapid changes, consider debouncing UI updates
5. **Optimistic Updates**: Update UI immediately, then sync with server
6. **Channel Limits**: Be mindful of Supabase channel limits (200 per client)

## Error Handling

```typescript
const channel = supabase
  .channel('tasks')
  .on('postgres_changes', { ... }, handleChange)
  .on('error', (error) => {
    console.error('Realtime error:', error);
    // Implement retry logic or fallback
  })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Channel error');
    }
  });
```

## Performance Considerations

1. **Selective Subscriptions**: Only subscribe to what you need
2. **Filter Early**: Use database filters to reduce payload size
3. **Batch Updates**: Group multiple updates when possible
4. **Connection Pooling**: Reuse channels when possible
5. **Monitor Usage**: Track subscription counts and performance

## Security

- RLS policies automatically apply to realtime subscriptions
- Users can only receive updates for data they have access to
- No additional authentication needed beyond Supabase client

## Example: Complete Task Board with Realtime

```typescript
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Task } from '@/lib/services/projects';

export function TaskBoard({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial load
    loadTasks();

    // Subscribe to changes
    const channel = supabase
      .channel(`tasks-${projectId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [...prev, payload.new as Task]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => 
              t.id === payload.new.id ? payload.new as Task : t
            ));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const loadTasks = async () => {
    // Load initial tasks
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order');
    
    if (data) setTasks(data);
  };

  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```
