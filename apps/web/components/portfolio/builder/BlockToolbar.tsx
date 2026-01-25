'use client';

import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { blockRegistry, type BlockType } from '@/lib/blocks/schema';
import { iconMap } from '@/lib/blocks/icons';

interface BlockToolbarProps {
  onBlockAdd: (blockType: BlockType) => void;
  disabled?: boolean;
}

export function BlockToolbar({
  onBlockAdd,
  disabled = false,
}: BlockToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const blocksByCategory = {
    content: ['hero', 'text', 'projects'] as BlockType[],
    media: ['image', 'gallery', 'video'] as BlockType[],
    interactive: ['form'] as BlockType[],
  };

  const categoryLabels = {
    content: 'Content',
    media: 'Media',
    interactive: 'Interactive',
  };

  return (
    <div className="flex items-center gap-2 border-b bg-background p-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled}>
            <Plus className="mr-2 h-4 w-4" />
            Add Block
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2">
            {Object.entries(blocksByCategory).map(([category, blockTypes]) => (
              <div key={category} className="mb-4 last:mb-0">
                <div className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </div>
                <div className="space-y-1">
                  {blockTypes.map(blockType => {
                    const metadata = blockRegistry[blockType];
                    const Icon = iconMap[blockType] || FileText;
                    return (
                      <button
                        key={blockType}
                        onClick={() => {
                          onBlockAdd(blockType);
                          setIsOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent'
                        )}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">{metadata.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {metadata.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
