/**
 * Block Toolbar Component
 * Floating toolbar for block actions (move, duplicate, delete, settings)
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Settings,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';

interface BlockToolbarProps {
  block: PortfolioBlock;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  className?: string;
}

export function BlockToolbar({
  block,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onSettings,
  className,
}: BlockToolbarProps) {
  return (
    <div
      className={cn(
        'absolute -top-10 left-0 z-20 flex items-center gap-1 bg-background border rounded-md shadow-lg p-1',
        className
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onMoveUp}
        disabled={!onMoveUp}
        className="h-7 w-7 p-0"
      >
        <ArrowUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onMoveDown}
        disabled={!onMoveDown}
        className="h-7 w-7 p-0"
      >
        <ArrowDown className="h-3 w-3" />
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
