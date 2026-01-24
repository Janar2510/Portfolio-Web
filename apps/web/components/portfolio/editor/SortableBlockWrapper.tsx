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
  colSpan?: number;
  rowSpan?: number;
  onResize?: () => void;
}

export function SortableBlockWrapper({
  blockId,
  children,
  isActive = false,
  colSpan = 12,
  rowSpan,
  onResize,
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
    transform: CSS.Transform.toString(transform), // TODO: dnd-kit transform might need adjustment for grid
    transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: `span ${colSpan}`,
    gridRow: rowSpan ? `span ${rowSpan}` : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative h-full flex flex-col',
        isDragging && 'z-50',
        isActive && 'ring-2 ring-primary'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'absolute left-0 top-0 z-10 flex h-full w-6 cursor-grab items-center justify-center bg-muted/50 opacity-0 transition-opacity group-hover:opacity-100',
          isDragging && 'opacity-100 cursor-grabbing bg-primary/10'
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Block Content */}
      <div className={cn('pl-6 h-full', isDragging && 'pointer-events-none')}>
        {children}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute right-0 bottom-0 cursor-ew-resize p-2 opacity-0 group-hover:opacity-100 z-20"
        onClick={(e) => {
          e.stopPropagation();
          onResize?.();
        }}
        title="Click to resize (Full -> Half -> Third -> Quarter)"
      >
        <div className="w-4 h-4 bg-primary/20 hover:bg-primary rounded-tl-lg shadow-sm" />
      </div>
    </div>
  );
}
