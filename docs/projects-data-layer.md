# Projects Data Layer Documentation

## Overview

The projects data layer consists of 6 main tables with comprehensive RLS policies, indexes, and triggers for a complete project management system with Kanban boards.

## Tables

### 1. `projects`
Main project container.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `name` (TEXT)
- `description` (TEXT, nullable)
- `status` (TEXT, default: 'active') - 'active', 'archived', 'completed'
- `color` (TEXT, nullable) - Visual identification
- `linked_contact_id` (UUID, FK → contacts.id, nullable)
- `linked_deal_id` (UUID, FK → deals.id, nullable)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Constraints:**
- Status check constraint: 'active', 'archived', 'completed'

### 2. `project_columns`
Kanban board columns for projects.

**Columns:**
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects.id)
- `name` (TEXT)
- `sort_order` (INTEGER, default: 0)
- `color` (TEXT, nullable)
- `is_done_column` (BOOLEAN, default: false) - Marks completion column
- `created_at` (TIMESTAMPTZ)

### 3. `tasks`
Tasks within projects.

**Columns:**
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects.id)
- `column_id` (UUID, FK → project_columns.id)
- `title` (TEXT)
- `description` (TEXT, nullable)
- `assignee_id` (UUID, FK → profiles.id, nullable)
- `due_date` (DATE, nullable)
- `due_time` (TIME, nullable)
- `priority` (TEXT, nullable) - 'low', 'medium', 'high', 'urgent'
- `sort_order` (INTEGER, default: 0)
- `completed_at` (TIMESTAMPTZ, nullable)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Constraints:**
- Priority check constraint: 'low', 'medium', 'high', 'urgent'

### 4. `subtasks`
Checklist items for tasks.

**Columns:**
- `id` (UUID, PK)
- `task_id` (UUID, FK → tasks.id)
- `title` (TEXT)
- `is_completed` (BOOLEAN, default: false)
- `sort_order` (INTEGER, default: 0)
- `created_at` (TIMESTAMPTZ)

### 5. `task_comments`
Comments on tasks.

**Columns:**
- `id` (UUID, PK)
- `task_id` (UUID, FK → tasks.id)
- `user_id` (UUID, FK → profiles.id)
- `content` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 6. `task_attachments`
File attachments for tasks.

**Columns:**
- `id` (UUID, PK)
- `task_id` (UUID, FK → tasks.id)
- `file_name` (TEXT)
- `file_path` (TEXT) - Supabase Storage path
- `file_size` (INTEGER, nullable)
- `mime_type` (TEXT, nullable)
- `uploaded_by` (UUID, FK → profiles.id)
- `created_at` (TIMESTAMPTZ)

## Row Level Security (RLS)

All projects tables have RLS enabled with comprehensive policies:

### `projects`

**SELECT:**
- **"Users can view own projects"** - Users can only view their own projects
  - `auth.uid() = user_id`

**INSERT:**
- **"Users can insert own projects"** - Users can only create projects for themselves
  - `WITH CHECK (auth.uid() = user_id)`

**UPDATE:**
- **"Users can update own projects"** - Users can only update their own projects
  - `USING (auth.uid() = user_id)`

**DELETE:**
- **"Users can delete own projects"** - Users can only delete their own projects
  - `USING (auth.uid() = user_id)`

### `project_columns`

**SELECT/INSERT/UPDATE/DELETE:**
- Users can manage columns of their own projects only
- Policies check project ownership via EXISTS subquery

### `tasks`

**SELECT/INSERT/UPDATE/DELETE:**
- Users can manage tasks of their own projects only
- Policies check project ownership via EXISTS subquery

### `subtasks`

**SELECT/INSERT/UPDATE/DELETE:**
- Users can manage subtasks of tasks in their own projects
- Policies check project ownership via JOIN with tasks and projects

### `task_comments`

**SELECT:**
- Users can view comments on tasks in their own projects

**INSERT:**
- Users can insert comments on tasks in their own projects
- Must be the comment author (`auth.uid() = user_id`)

**UPDATE/DELETE:**
- Users can only update/delete their own comments
  - `USING (auth.uid() = user_id)`

### `task_attachments`

**SELECT:**
- Users can view attachments on tasks in their own projects

**INSERT:**
- Users can insert attachments on tasks in their own projects
- Must be the uploader (`auth.uid() = uploaded_by`)

**DELETE:**
- Users can only delete attachments they uploaded
  - `USING (auth.uid() = uploaded_by)`

## Indexes

All tables have optimized indexes for common queries:

### `projects`
- `idx_projects_user_id` - User's projects
- `idx_projects_status` - Projects by status
- `idx_projects_linked_contact` - Projects linked to contacts
- `idx_projects_linked_deal` - Projects linked to deals

### `project_columns`
- `idx_project_columns_project_id` - Columns by project
- `idx_project_columns_sort_order` - Sorted columns per project

### `tasks`
- `idx_tasks_project_id` - Tasks by project
- `idx_tasks_column_id` - Tasks by column
- `idx_tasks_assignee` - Tasks by assignee
- `idx_tasks_due_date` - Tasks by due date
- `idx_tasks_priority` - Tasks by priority
- `idx_tasks_sort_order` - Sorted tasks per column
- `idx_tasks_completed` - Completed tasks

### `subtasks`
- `idx_subtasks_task_id` - Subtasks by task
- `idx_subtasks_sort_order` - Sorted subtasks per task

### `task_comments`
- `idx_task_comments_task_id` - Comments by task
- `idx_task_comments_user_id` - Comments by user
- `idx_task_comments_created` - Comments by creation date

### `task_attachments`
- `idx_task_attachments_task_id` - Attachments by task
- `idx_task_attachments_uploaded_by` - Attachments by uploader

## Triggers

### Updated At Triggers
- **`set_projects_updated_at`** - Updates `updated_at` on project changes
- **`set_tasks_updated_at`** - Updates `updated_at` on task changes
- **`set_task_comments_updated_at`** - Updates `updated_at` on comment changes

### Task Completion Trigger
- **`set_task_completed_at`** - Automatically sets/clears `completed_at` when task is moved to/from done column
  - Uses `handle_task_completion()` function
  - Checks `is_done_column` flag on `project_columns`

## Permissions

- `authenticated` role: Full CRUD on all tables
- RLS policies enforce user-level access control

## Security Model

### Multi-Tenant Isolation
- All data is isolated by `user_id` at the project level
- RLS policies ensure users can only access their own projects
- Cascading policies ensure related data (columns, tasks, etc.) is also protected

### Data Relationships
- Projects → Columns → Tasks → Subtasks/Comments/Attachments
- All relationships respect project ownership
- Foreign keys with CASCADE ensure data integrity

## Usage Example

```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();

// Create a project
const { data: project } = await supabase
  .from('projects')
  .insert({
    name: 'My Project',
    description: 'Project description',
    user_id: userId, // Automatically set by RLS
  })
  .select()
  .single();

// Create columns
const { data: columns } = await supabase
  .from('project_columns')
  .insert([
    { project_id: project.id, name: 'To Do', sort_order: 0 },
    { project_id: project.id, name: 'In Progress', sort_order: 1 },
    { project_id: project.id, name: 'Done', sort_order: 2, is_done_column: true },
  ])
  .select();

// Create a task
const { data: task } = await supabase
  .from('tasks')
  .insert({
    project_id: project.id,
    column_id: columns[0].id,
    title: 'My Task',
    priority: 'high',
  })
  .select()
  .single();
```

## Verification

Run this to verify everything:

```sql
-- Check tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('projects', 'project_columns', 'tasks', 'subtasks', 'task_comments', 'task_attachments');

-- Check RLS policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('projects', 'project_columns', 'tasks', 'subtasks', 'task_comments', 'task_attachments')
GROUP BY tablename;

-- Check indexes
SELECT tablename, COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('projects', 'project_columns', 'tasks', 'subtasks', 'task_comments', 'task_attachments')
GROUP BY tablename;

-- Check triggers
SELECT event_object_table, COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('projects', 'project_columns', 'tasks', 'subtasks', 'task_comments', 'task_attachments')
GROUP BY event_object_table;
```

## Next Steps

The projects data layer is complete and ready to use! You can now:

1. ✅ Use service layer to create projects, columns, tasks
2. ✅ Build Kanban board UI
3. ✅ Implement task management features
4. ✅ Add drag-and-drop for tasks between columns
5. ✅ Build task detail views

All data is secured with RLS and ready for production use.
