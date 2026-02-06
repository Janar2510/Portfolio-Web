/**
 * Block Toolbar Component
 * Floating toolbar for block actions (move, duplicate, delete, settings)
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Copy,
  Trash2,
  Settings,
  MoreVertical,
  Layers,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/domain/builder/portfolio';

interface BlockToolbarProps {
  block: PortfolioBlock;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  onUpdateLayout?: (layout: Partial<PortfolioBlock['layout']>) => void;
  className?: string;
}

export function BlockToolbar({
  block,
  onDuplicate,
  onDelete,
  onSettings,
  onUpdateLayout,
  className,
}: BlockToolbarProps) {
  const zIndex = block.layout?.zIndex ?? 10;

  return (
    <div
      className={cn(
        'absolute -top-12 left-0 z-20 flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full shadow-2xl p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200',
        className
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onUpdateLayout?.({ zIndex: zIndex + 10 })}
        title="Bring to Front"
        className="h-7 w-7 p-0"
      >
        <ChevronUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onUpdateLayout?.({ zIndex: Math.max(0, zIndex - 10) })}
        title="Send to Back"
        className="h-7 w-7 p-0"
      >
        <ChevronDown className="h-3 w-3" />
      </Button>
      <div className="h-4 w-px bg-border mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onSettings}
        disabled={!onSettings}
        className="h-7 w-7 p-0"
      >
        <Settings className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDuplicate}
        disabled={!onDuplicate}
        className="h-7 w-7 p-0"
      >
        <Copy className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={!onDelete}
        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
      <div className="h-4 w-px bg-border mx-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => console.log('Lock block')}>
            {block.is_locked ? 'Unlock Block' : 'Lock Block'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => console.log('Copy block data')}>
            Copy Block Data
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => console.log('Export block')}>
            Export Block
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
