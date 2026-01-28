'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import type { ProjectColumn, ProjectTask } from './KanbanBoard';

interface KanbanColumnProps {
  column: ProjectColumn;
  tasks: ProjectTask[];
  onTaskClick: (task: ProjectTask) => void;
  onAddTask?: (columnId: string) => void;
}

function getTaskDragId(taskId: string): string {
  return `task-${taskId}`;
}

export function KanbanColumn({
  column,
  tasks,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskIds = tasks.map(task => getTaskDragId(task.id));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex h-full min-w-[280px] flex-col rounded-lg border bg-muted/30',
        isDragging && 'opacity-50'
      )}
    >
      {/* Column Header */}
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center gap-2 border-b p-3 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: column.color || '#3b82f6' }}
        />
        <h3 className="flex-1 font-semibold">{column.name}</h3>
        <span className="text-sm text-muted-foreground">{tasks.length}</span>
      </div>

      {/* Tasks */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No tasks
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add Task Button */}
      {onAddTask && (
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onAddTask(column.id)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      )}
    </div>
  );
}
