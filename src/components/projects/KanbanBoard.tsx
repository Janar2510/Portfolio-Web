'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

export interface ProjectColumn {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
  color: string | null;
  is_done_column: boolean;
  created_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  column_id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  due_date: string | null;
  due_time: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent' | null;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface KanbanBoardProps {
  projectId: string;
  columns: ProjectColumn[];
  tasks: ProjectTask[];
  onColumnsReorder: (columns: ProjectColumn[]) => void;
  onTasksReorder: (tasks: ProjectTask[]) => void;
  onTaskMove: (
    taskId: string,
    newColumnId: string,
    newSortOrder: number
  ) => void;
  onTaskClick: (task: ProjectTask) => void;
  onTaskCreate: (columnId: string, title: string) => void;
}

function getColumnDragId(columnId: string): string {
  return `column-${columnId}`;
}

function getTaskDragId(taskId: string): string {
  return `task-${taskId}`;
}

function getColumnIdFromDragId(dragId: string): string {
  return dragId.replace('column-', '');
}

function getTaskIdFromDragId(dragId: string): string {
  return dragId.replace('task-', '');
}

export function KanbanBoard({
  projectId,
  columns,
  tasks,
  onColumnsReorder,
  onTasksReorder,
  onTaskMove,
  onTaskClick,
  onTaskCreate,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const dragId = event.active.id as string;

    if (dragId.startsWith('task-')) {
      const taskId = getTaskIdFromDragId(dragId);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setActiveTask(task);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTask(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Handle column reordering
    if (activeIdStr.startsWith('column-') && overIdStr.startsWith('column-')) {
      const activeColumnId = getColumnIdFromDragId(activeIdStr);
      const overColumnId = getColumnIdFromDragId(overIdStr);

      const oldIndex = columns.findIndex(col => col.id === activeColumnId);
      const newIndex = columns.findIndex(col => col.id === overColumnId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newColumns = arrayMove(columns, oldIndex, newIndex).map(
          (col, index) => ({
            ...col,
            sort_order: index,
          })
        );
        onColumnsReorder(newColumns);
      }
      return;
    }

    // Handle task movement between columns
    if (activeIdStr.startsWith('task-')) {
      const taskId = getTaskIdFromDragId(activeIdStr);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Moving to a column
      if (overIdStr.startsWith('column-')) {
        const newColumnId = getColumnIdFromDragId(overIdStr);
        const tasksInNewColumn = tasks.filter(t => t.column_id === newColumnId);
        const newSortOrder = tasksInNewColumn.length;
        onTaskMove(taskId, newColumnId, newSortOrder);
        return;
      }

      // Moving within same column or to another task
      if (overIdStr.startsWith('task-')) {
        const overTaskId = getTaskIdFromDragId(overIdStr);
        const overTask = tasks.find(t => t.id === overTaskId);
        if (!overTask) return;

        const newColumnId = overTask.column_id;
        const tasksInColumn = tasks
          .filter(t => t.column_id === newColumnId && t.id !== taskId)
          .sort((a, b) => a.sort_order - b.sort_order);

        const overIndex = tasksInColumn.findIndex(t => t.id === overTaskId);
        const newSortOrder =
          overIndex >= 0 ? overIndex + 1 : tasksInColumn.length;

        onTaskMove(taskId, newColumnId, newSortOrder);
        return;
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveTask(null);
  };

  const columnIds = columns.map(col => getColumnDragId(col.id));

  // Group tasks by column
  const tasksByColumn = columns.reduce(
    (acc, column) => {
      acc[column.id] = tasks
        .filter(task => task.column_id === column.id)
        .sort((a, b) => a.sort_order - b.sort_order);
      return acc;
    },
    {} as Record<string, ProjectTask[]>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] || []}
              onTaskClick={onTaskClick}
              onAddTask={columnId => {
                const title = prompt('Enter task title:');
                if (title) onTaskCreate(columnId, title);
              }}
            />
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="w-64 rounded-lg border bg-background p-3 shadow-lg">
            <TaskCard task={activeTask} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
