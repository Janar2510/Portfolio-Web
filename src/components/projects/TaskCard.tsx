'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/domain/projects';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MoreHorizontal, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 p-4 rounded-xl border border-primary/50 bg-primary/10 h-[100px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative"
      onClick={(e) => {
        // Prevent drag click interference if needed, usually dnd-kit handles it
        onClick?.();
      }}
    >
      <Card className="p-4 bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-primary/20 transition-all rounded-xl cursor-grab active:cursor-grabbing">
        <div className="flex justify-between items-start mb-2">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
            task.priority === 'urgent' && "bg-red-500/20 text-red-500",
            task.priority === 'high' && "bg-orange-500/20 text-orange-500",
            task.priority === 'medium' && "bg-yellow-500/20 text-yellow-500",
            task.priority === 'low' && "bg-blue-500/20 text-blue-500",
            task.priority === 'none' && "bg-white/5 text-white/30",
          )}>
            {task.priority !== 'none' ? task.priority : 'Task'}
          </span>
          <button className="text-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <h4 className="text-sm font-medium text-white mb-2 line-clamp-2">{task.title}</h4>

        <div className="flex items-center justify-between mt-3 text-xs text-white/40">
          <div className="flex items-center gap-3">
            {task.due_date && (
              <div className={cn(
                "flex items-center gap-1",
                new Date(task.due_date) < new Date() && "text-red-400"
              )}>
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(task.due_date), 'MMM d')}</span>
              </div>
            )}
            {/* Attachments Placeholder */}
            {/* <div className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            <span>1</span>
                        </div> */}
          </div>

          {/* Relations Indicator */}
          {/* Note: This would ideally be passed in as a prop or part of the task object if joined. 
                 For now, we'll leave it as a placeholder or need to fetch it. 
                 Skipping fetch in card for performance. */}
        </div>
      </Card>
    </div>
  );
}
