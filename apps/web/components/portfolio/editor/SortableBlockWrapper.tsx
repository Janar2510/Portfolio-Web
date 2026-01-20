'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDragId } from '@/lib/blocks/dnd';

interface SortableBlockWrapperProps {
  blockId: string;
  children: React.ReactNode;
  isActive?: boolean;
}

export function SortableBlockWrapper({
  blockId,
  children,
  isActive = false,
}: SortableBlockWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getDragId(blockId),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        isDragging && 'z-50',
        isActive && 'ring-2 ring-primary'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'absolute left-0 top-0 z-10 flex h-full w-8 cursor-grab items-center justify-center bg-muted/50 opacity-0 transition-opacity group-hover:opacity-100',
          isDragging && 'opacity-100 cursor-grabbing'
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Block Content */}
      <div className={cn('pl-8', isDragging && 'pointer-events-none')}>
        {children}
      </div>
    </div>
  );
}
