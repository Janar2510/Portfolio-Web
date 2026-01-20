'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectTask } from './KanbanBoard';

interface TaskCardProps {
  task: ProjectTask;
  onClick?: () => void;
  isDragging?: boolean;
}

function getTaskDragId(taskId: string): string {
  return `task-${taskId}`;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
};

export function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: getTaskDragId(task.id),
    disabled: isDragging,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    !task.completed_at;

  const priority = task.priority || 'low';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'cursor-grab rounded-lg border bg-background p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
        isOverdue && 'border-red-300 bg-red-50/50'
      )}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="flex-1 font-medium text-sm">{task.title}</h4>
          {task.priority && (
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-xs font-medium',
                priorityColors[priority]
              )}
            >
              {task.priority}
            </span>
          )}
        </div>

        {task.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {task.due_date && (
            <div className={cn('flex items-center gap-1', isOverdue && 'text-red-600')}>
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(task.due_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {isOverdue && <AlertCircle className="h-3 w-3" />}
            </div>
          )}
          {task.assignee_id && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Assigned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
