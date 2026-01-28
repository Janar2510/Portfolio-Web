# Kanban Board Implementation

## Overview

The Kanban board provides a complete project management interface with drag-and-drop functionality for organizing tasks across columns. It includes project management, task details, subtasks, and comments.

## Components

### 1. ProjectList

**Location**: `components/projects/ProjectList.tsx`

Sidebar component for managing projects.

**Features:**
- List all projects with status indicators (active, archived, completed)
- Create new projects with name, description, and color
- Edit project details
- Delete projects (with confirmation)
- Visual project selection
- Color-coded project indicators

**Props:**
- `projects`: Array of Project objects
- `currentProjectId`: Currently selected project ID
- `onProjectSelect`: Callback when project is selected
- `onProjectCreate`: Callback to create new project
- `onProjectUpdate`: Callback to update project
- `onProjectDelete`: Callback to delete project

### 2. KanbanBoard

**Location**: `components/projects/KanbanBoard.tsx`

Main board component with drag-and-drop for columns and tasks.

**Features:**
- Drag-and-drop column reordering
- Drag-and-drop task movement between columns
- Drag-and-drop task reordering within columns
- Visual feedback during drag operations
- Horizontal scrolling for multiple columns

**Props:**
- `projectId`: Current project ID
- `columns`: Array of ProjectColumn objects
- `tasks`: Array of ProjectTask objects
- `onColumnsReorder`: Callback when columns are reordered
- `onTasksReorder`: Callback when tasks are reordered (not used, handled by moveTask)
- `onTaskMove`: Callback when task is moved to new column/position
- `onTaskClick`: Callback when task is clicked

### 3. KanbanColumn

**Location**: `components/projects/KanbanColumn.tsx`

Individual column component with sortable tasks.

**Features:**
- Draggable column header
- Sortable task list within column
- Task count display
- Color-coded column indicator
- Add task button (optional)

**Props:**
- `column`: ProjectColumn object
- `tasks`: Array of ProjectTask objects in this column
- `onTaskClick`: Callback when task is clicked
- `onAddTask`: Optional callback to add new task

### 4. TaskCard

**Location**: `components/projects/TaskCard.tsx`

Individual task card component.

**Features:**
- Draggable task card
- Priority badge with color coding
- Due date display with overdue indicator
- Assignee indicator
- Description preview (truncated)
- Visual feedback during drag

**Props:**
- `task`: ProjectTask object
- `onClick`: Callback when card is clicked
- `isDragging`: Whether card is currently being dragged

### 5. TaskDetailModal

**Location**: `components/projects/TaskDetailModal.tsx`

Modal/drawer for viewing and editing task details.

**Features:**
- View task details (title, description, priority, due date, assignee)
- Edit task details inline
- Subtasks/checklist management
  - Create subtasks
  - Toggle completion
  - Delete subtasks
  - Progress indicator (completed/total)
- Comments system
  - Add comments
  - Edit own comments
  - Delete own comments
  - Timestamp display
- Delete task functionality

**Props:**
- `task`: Task object or null
- `isOpen`: Whether modal is open
- `onClose`: Callback to close modal
- `onUpdate`: Callback to update task
- `onDelete`: Callback to delete task
- `subtasks`: Array of Subtask objects
- `comments`: Array of TaskComment objects
- `onSubtaskCreate`: Callback to create subtask
- `onSubtaskUpdate`: Callback to update subtask
- `onSubtaskDelete`: Callback to delete subtask
- `onCommentCreate`: Callback to create comment
- `onCommentUpdate`: Callback to update comment
- `onCommentDelete`: Callback to delete comment
- `currentUserId`: Current user ID for comment ownership

## Main Page

### ProjectsPage

**Location**: `app/[locale]/(admin)/projects/page.tsx`

Main page component that orchestrates all Kanban board functionality.

**Features:**
- React Query integration for all data fetching
- Project list sidebar
- Kanban board view
- Task detail modal
- All CRUD operations with optimistic updates
- Automatic query invalidation on mutations

**Data Flow:**
```
ProjectsPage
  ├── ProjectList (React Query: projects)
  ├── KanbanBoard (React Query: columns, tasks)
  │   ├── KanbanColumn (SortableContext: tasks)
  │   │   └── TaskCard (SortableItem)
  │   └── DragOverlay
  └── TaskDetailModal (React Query: subtasks, comments)
```

## Drag-and-Drop Implementation

### Column Reordering
- Columns can be dragged horizontally to reorder
- Uses `horizontalListSortingStrategy` from `@dnd-kit/sortable`
- Updates `sort_order` in database

### Task Movement
- Tasks can be dragged between columns
- Tasks can be reordered within columns
- Uses `verticalListSortingStrategy` for tasks within columns
- Updates both `column_id` and `sort_order` in database

### Drag ID System
- Columns: `column-{columnId}`
- Tasks: `task-{taskId}`
- Helper functions: `getColumnDragId`, `getTaskDragId`, `getColumnIdFromDragId`, `getTaskIdFromDragId`

## State Management

- **React Query**: All data fetching and caching
- **Local State**: UI state (selected project, selected task, modal open/closed)
- **Mutations**: Optimistic updates with query invalidation

## Features

### ✅ Project Management
- Create, edit, delete projects
- Project status (active, archived, completed)
- Color coding
- Project selection

### ✅ Kanban Board
- Drag-and-drop column reordering
- Drag-and-drop task movement
- Task reordering within columns
- Visual feedback

### ✅ Task Management
- View task details
- Edit task (title, description, priority, due date)
- Delete tasks
- Priority levels (low, medium, high, urgent)
- Due date tracking with overdue indicators

### ✅ Subtasks/Checklist
- Create subtasks
- Toggle completion
- Delete subtasks
- Progress tracking (completed/total)

### ✅ Comments
- Add comments
- Edit own comments
- Delete own comments
- Timestamp display
- User ownership

## Usage

The Kanban board is accessible at `/projects` route (within the admin layout).

```tsx
// The page automatically handles:
// - Project selection
// - Data fetching with React Query
// - All mutations
// - Real-time updates via query invalidation
```

## File Structure

```
src/
├── components/projects/
│   ├── ProjectList.tsx          # Project sidebar
│   ├── KanbanBoard.tsx          # Main board component
│   ├── KanbanColumn.tsx        # Column component
│   ├── TaskCard.tsx            # Task card component
│   ├── TaskDetailModal.tsx     # Task detail modal
│   └── index.ts                # Exports
├── app/[locale]/(admin)/projects/
│   └── page.tsx                # Main page
└── lib/services/
    └── projects.ts             # Project service (server-side)
```

## Dependencies

- `@dnd-kit/core`: Core drag-and-drop functionality
- `@dnd-kit/sortable`: Sortable items and contexts
- `@dnd-kit/utilities`: Utility functions
- `@tanstack/react-query`: Data fetching and caching
- `@radix-ui/react-checkbox`: Checkbox component for subtasks
- `@radix-ui/react-dialog`: Modal component
- `@radix-ui/react-select`: Select component

## Future Enhancements

- [ ] Task assignment UI (user selection)
- [ ] File attachments in task detail
- [ ] Task filtering and search
- [ ] Column customization (add/remove columns)
- [ ] Task templates
- [ ] Bulk operations
- [ ] Keyboard shortcuts
- [ ] Real-time collaboration (via Supabase Realtime)
