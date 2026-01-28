# Activities & Follow-ups Documentation

## Overview

The Activities & Follow-ups system provides comprehensive activity logging, follow-up reminders, and notification management for the CRM module. It helps users track interactions, set reminders, and stay on top of important tasks.

## Components

### 1. ActivityTimeline

**Location**: `components/crm/ActivityTimeline.tsx`

Enhanced timeline component for logging and viewing CRM activities.

**Features:**
- View all activities in chronological order
- Create new activities (email, call, meeting, note, task)
- Mark activities as complete/incomplete
- Delete activities
- Filter by activity type
- Due date tracking for tasks
- Visual activity type indicators
- Color-coded activity types

**Activity Types:**
- **Email**: Email communications
- **Call**: Phone calls
- **Meeting**: In-person or virtual meetings
- **Note**: General notes
- **Task**: Action items with due dates

**Props:**
- `activities`: Array of CRMActivity objects
- `onActivityCreate`: Callback to create new activity
- `onActivityUpdate`: Callback to update activity
- `onActivityDelete`: Callback to delete activity
- `contactId`: Optional contact ID to filter activities
- `dealId`: Optional deal ID to filter activities

### 2. FollowUpReminders

**Location**: `components/crm/FollowUpReminders.tsx`

Component for managing follow-up reminders.

**Features:**
- View all follow-ups organized by status (overdue, upcoming, completed)
- Create new follow-up reminders
- Mark follow-ups as complete/incomplete
- Delete follow-ups
- Link follow-ups to contacts or deals
- Due date and time tracking
- Visual status indicators (overdue, today, tomorrow)
- Context display (contact or deal)

**Props:**
- `followUps`: Array of FollowUp objects
- `contacts`: Array of Contact objects (for context)
- `deals`: Array of Deal objects (for context)
- `onFollowUpCreate`: Callback to create new follow-up
- `onFollowUpUpdate`: Callback to update follow-up
- `onFollowUpDelete`: Callback to delete follow-up

**Follow-up Status:**
- **Overdue**: Past due date, not completed
- **Today**: Due today
- **Tomorrow**: Due tomorrow
- **Upcoming**: Future due dates
- **Completed**: Marked as complete

### 3. NotificationsPanel

**Location**: `components/crm/NotificationsPanel.tsx`

Centralized notification panel for displaying important reminders.

**Features:**
- Aggregates follow-ups and activities with due dates
- Priority-based sorting (high, medium, low)
- Visual priority indicators
- Due date status badges
- Quick navigation to related items
- Dismiss notifications
- Mark as read
- Empty state when no notifications

**Notification Types:**
- **Follow-up reminders**: Follow-ups due today, tomorrow, or overdue
- **Activity tasks**: Activities with due dates that are pending

**Priority Levels:**
- **High**: Overdue or due today
- **Medium**: Due tomorrow
- **Low**: Future due dates

**Props:**
- `followUps`: Array of FollowUp objects
- `activities`: Array of CRMActivity objects
- `onDismiss`: Optional callback when notification is dismissed
- `onMarkRead`: Optional callback when notification is marked as read

### 4. ActivitiesPage

**Location**: `app/[locale]/(admin)/crm/activities/page.tsx`

Main page for managing activities and follow-ups.

**Features:**
- Tabbed interface (Notifications, Activities, Follow-ups)
- Integrated ActivityTimeline component
- Integrated FollowUpReminders component
- Integrated NotificationsPanel component
- React Query for data fetching
- All CRUD operations with optimistic updates

**Route**: `/crm/activities`

## Edge Function

### follow-up-notifications

**Location**: `supabase/functions/follow-up-notifications/index.ts`

Edge function for sending follow-up reminder notifications.

**Features:**
- Checks for follow-ups due today or tomorrow
- Groups follow-ups by user
- Generates email content
- Ready for email integration
- Returns notification summary

**Usage:**

1. Deploy the edge function:
```bash
supabase functions deploy follow-up-notifications
```

2. Set up a cron job to run daily:
```sql
-- Using pg_cron extension
SELECT cron.schedule(
  'follow-up-notifications',
  '0 8 * * *',  -- 8 AM UTC daily
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/follow-up-notifications',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

3. Configure email sending:
   - Update the edge function to use your email provider
   - Add email templates
   - Configure SMTP or use a service like SendGrid, Resend, etc.

## Database Triggers

The system uses database triggers for automatic updates:

### Contact Activity Trigger
- When an activity is created and marked as completed, it automatically updates the contact's `last_contacted_at` timestamp

### Activity Completion Trigger
- When an activity is marked as completed, it sets `completed_at` timestamp
- When an activity is marked as incomplete, it clears `completed_at`

### Follow-up Completion Trigger
- When a follow-up is marked as completed, it sets `completed_at` timestamp
- When a follow-up is marked as incomplete, it clears `completed_at`

## Features

### ✅ Activity Logging
- Create activities (email, call, meeting, note, task)
- View activity timeline
- Mark activities as complete/incomplete
- Delete activities
- Link activities to contacts or deals
- Due date tracking for tasks
- Activity type filtering

### ✅ Follow-up Reminders
- Create follow-up reminders
- Link to contacts or deals
- Due date and time tracking
- Status organization (overdue, today, tomorrow, upcoming, completed)
- Mark as complete/incomplete
- Delete follow-ups
- Context display (contact/deal information)

### ✅ Notification System
- Centralized notification panel
- Priority-based sorting
- Visual priority indicators
- Due date status badges
- Quick navigation to related items
- Dismiss and mark as read
- Aggregates follow-ups and activities

## Usage

### View Activities & Follow-ups
Navigate to `/crm/activities` to see the activities and follow-ups page.

### Create Activity
1. Click "Add Activity" button
2. Select activity type
3. Fill in title and description
4. Optionally set due date for tasks
5. Submit

### Create Follow-up
1. Click "Add Follow-up" button
2. Enter title
3. Select contact or deal (optional)
4. Set due date and time
5. Submit

### View Notifications
The Notifications tab shows all pending reminders and tasks with due dates.

### Mark Complete
Click the checkmark icon on any follow-up or activity to mark it as complete.

## Data Flow

```
ActivitiesPage
  ├── React Query: Fetch activities, follow-ups, contacts, deals
  ├── Tabs
  │   ├── Notifications Tab
  │   │   └── NotificationsPanel
  │   ├── Activities Tab
  │   │   └── ActivityTimeline
  │   └── Follow-ups Tab
  │       └── FollowUpReminders
  └── Mutations: Create, update, delete operations
```

## File Structure

```
src/
├── components/crm/
│   ├── ActivityTimeline.tsx        # Activity timeline component
│   ├── FollowUpReminders.tsx       # Follow-up reminders component
│   ├── NotificationsPanel.tsx     # Notifications panel component
│   └── index.ts                    # Exports
├── app/[locale]/(admin)/crm/activities/
│   └── page.tsx                    # Activities page
supabase/functions/
└── follow-up-notifications/
    └── index.ts                    # Edge function for notifications
```

## Dependencies

- `date-fns`: Date manipulation and formatting
- `@tanstack/react-query`: Data fetching and caching
- `@supabase/supabase-js`: Database queries and edge functions
- Shadcn UI components: Button, Dialog, Badge, Tabs, etc.

## Future Enhancements

- [ ] Email integration for notifications
- [ ] Push notifications
- [ ] Activity templates
- [ ] Bulk activity operations
- [ ] Activity search and filtering
- [ ] Activity export
- [ ] Recurring follow-ups
- [ ] Follow-up scheduling
- [ ] Activity analytics
- [ ] Integration with calendar
- [ ] Activity attachments
- [ ] Activity comments
- [ ] Activity tags
- [ ] Custom activity types
- [ ] Activity reminders
- [ ] Follow-up automation rules
