'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';

interface BaseBlockProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  children: React.ReactNode;
  className?: string;
  onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
  onDelete?: () => void;
  onAddAfter?: (blockType: string) => void;
  onEdit?: (block: PortfolioBlock) => void;
  showControls?: boolean;
}

export function BaseBlock({
  block,
  isEditing = false,
  children,
  className,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
  showControls = true,
}: BaseBlockProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!isEditing) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn('group relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Block Content */}
      <div className="relative">{children}</div>

      {/* Editing Controls */}
      {showControls && isHovered && (
        <div className="absolute right-2 top-2 z-20 flex gap-1 rounded-md bg-background/90 p-1 shadow-lg backdrop-blur-sm">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(block);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {onAddAfter && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                // Open add block menu - to be implemented
                console.log('Add block after', block.id);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Block Border (when editing) */}
      {isHovered && (
        <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-primary/50" />
      )}
    </div>
  );
}
