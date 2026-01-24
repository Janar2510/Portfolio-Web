'use client';

import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DraggableBlockItemProps {
    id: string;
    type: string;
    children: React.ReactNode;
    className?: string;
}

export function DraggableBlockItem({ id, type, children, className }: DraggableBlockItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: {
            type: 'sidebar-block',
            blockType: type,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(className, isDragging ? 'opacity-50 z-50' : '')}
        >
            {children}
        </div>
    );
}
