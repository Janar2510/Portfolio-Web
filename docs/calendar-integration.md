# Calendar Integration Documentation

## Overview

The calendar integration provides a comprehensive calendar view for tasks, iCal feed generation for external calendar applications, and automated due date notifications via edge functions.

## Components

### 1. CalendarView

**Location**: `components/projects/CalendarView.tsx`

Main calendar component with multiple view modes.

**Features:**
- **Month View**: Full month calendar grid with tasks displayed on their due dates
- **Week View**: Week grid with hourly time slots
- **Day View**: Detailed day view with hourly breakdown
- Navigation controls (prev/next, today)
- View mode switching
- Task click handling
- Priority color coding
- Overdue task indicators

**Props:**
- `tasks`: Array of Task objects with due dates
- `onTaskClick`: Callback when a task is clicked
- `currentDate`: Optional initial date (defaults to today)

**View Modes:**
- `month`: Full month grid view
- `week`: Week view with hourly slots
- `day`: Single day detailed view

### 2. CalendarPage

**Location**: `app/[locale]/(admin)/projects/calendar/page.tsx`

Main page component for the calendar view.

**Features:**
- Fetches all tasks with due dates across all user projects
- Integrates with TaskDetailModal for task editing
- iCal export button
- Loading states
- React Query integration

**Route**: `/projects/calendar`

### 3. iCal Feed API

**Location**: `app/api/projects/ical/route.ts`

API route for generating iCal calendar feeds.

**Endpoint**: `GET /api/projects/ical`

**Features:**
- Generates standard iCal format (.ics file)
- Includes all tasks with due dates
- Excludes completed tasks
- Includes task details (title, description, priority, project)
- Sets appropriate event duration (1 hour default)
- Priority mapping to iCal priority levels

**Usage:**
```typescript
// Download iCal feed
window.open('/api/projects/ical', '_blank');

// Or use in calendar applications
// Subscribe to: https://your-domain.com/api/projects/ical
```

**iCal Format:**
- Standard VCALENDAR format
- Each task becomes a VEVENT
- Includes UID, DTSTART, DTEND, SUMMARY, DESCRIPTION
- Priority levels mapped (urgent=1, high=2, medium=5, low=9)

### 4. Due Date Notifications Edge Function

**Location**: `supabase/functions/due-date-notifications/index.ts`

Supabase Edge Function for sending due date notifications.

**Features:**
- Checks for tasks due today or tomorrow
- Groups tasks by user (assignee or project owner)
- Generates email content
- Sends notifications (email integration ready)

**Trigger:**
- Can be scheduled via cron job
- Recommended: Daily at 8 AM

**Function Logic:**
1. Fetch tasks due today or tomorrow
2. Filter out completed tasks
3. Group by user (assignee_id or project owner)
4. Generate email content
5. Send notifications

**Email Content:**
- Tasks due today
- Tasks due tomorrow
- Task details (title, priority, time, project)
- Links to calendar view

**Deployment:**
```bash
# Deploy edge function
supabase functions deploy due-date-notifications

# Set up cron job (via Supabase Dashboard or pg_cron)
# Example: Run daily at 8 AM UTC
SELECT cron.schedule(
  'due-date-notifications',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/due-date-notifications',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

## Data Flow

```
CalendarPage
  ├── React Query: Fetch all tasks with due dates
  ├── CalendarView: Display tasks in calendar format
  │   ├── Month View: Grid layout
  │   ├── Week View: Hourly slots
  │   └── Day View: Detailed hourly breakdown
  └── TaskDetailModal: Edit task details

iCal Feed API
  ├── Authenticate user
  ├── Fetch tasks with due dates
  └── Generate iCal format

Due Date Notifications
  ├── Fetch tasks due today/tomorrow
  ├── Group by user
  └── Send email notifications
```

## Features

### ✅ Calendar Views
- Month view with task indicators
- Week view with hourly time slots
- Day view with detailed hourly breakdown
- Navigation (prev/next, today)
- View mode switching

### ✅ Task Display
- Priority color coding
- Overdue indicators
- Task count per day
- Click to view/edit task details

### ✅ iCal Integration
- Standard iCal format
- Compatible with Google Calendar, Outlook, Apple Calendar
- Includes all task details
- Priority mapping
- Automatic updates

### ✅ Notifications
- Daily due date reminders
- Tasks due today
- Tasks due tomorrow
- Email notifications (ready for integration)

## Usage

### View Calendar
Navigate to `/projects/calendar` to see the calendar view.

### Export iCal
Click the "Export iCal" button to download the calendar feed, or subscribe to the URL in your calendar application.

### Set Up Notifications
1. Deploy the edge function:
```bash
supabase functions deploy due-date-notifications
```

2. Set up a cron job to run daily:
```sql
-- Using pg_cron extension
SELECT cron.schedule(
  'due-date-notifications',
  '0 8 * * *',  -- 8 AM UTC daily
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/due-date-notifications',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

3. Configure email sending (integrate with your email service):
   - Update the edge function to use your email provider
   - Add email templates
   - Configure SMTP or use a service like SendGrid, Resend, etc.

## Dependencies

- `date-fns`: Date manipulation and formatting
- `@tanstack/react-query`: Data fetching and caching
- `@supabase/supabase-js`: Database queries and edge functions

## File Structure

```
src/
├── components/projects/
│   └── CalendarView.tsx              # Calendar component
├── app/
│   ├── [locale]/(admin)/projects/calendar/
│   │   └── page.tsx                  # Calendar page
│   └── api/projects/ical/
│       └── route.ts                  # iCal feed API
└── supabase/functions/
    └── due-date-notifications/
        └── index.ts                  # Edge function
```

## Future Enhancements

- [ ] Recurring tasks support
- [ ] Task reminders (customizable)
- [ ] Calendar sync (two-way sync with external calendars)
- [ ] Multiple calendar views (agenda, list)
- [ ] Task drag-and-drop in calendar
- [ ] Time zone support
- [ ] Calendar sharing
- [ ] Integration with external calendar APIs (Google, Outlook)
- [ ] Push notifications
- [ ] SMS notifications
