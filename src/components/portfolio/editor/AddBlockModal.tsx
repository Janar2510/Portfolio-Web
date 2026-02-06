/**
 * Add Block Modal Component
 * Modal for selecting and adding a new block
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { blockRegistry } from '@/domain/builder/blocks/registry';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BLOCK_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'layout', name: 'Layout' },
  { id: 'content', name: 'Content' },
  { id: 'media', name: 'Media' },
  { id: 'interactive', name: 'Interactive' },
  { id: 'portfolio', name: 'Portfolio' },
] as const;

interface AddBlockModalProps {
  onClose: () => void;
  onSelect: (blockType: string) => void;
}

export function AddBlockModal({ onClose, onSelect }: AddBlockModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allBlocks = blockRegistry.getAll();

  const filteredBlocks = useMemo(() => {
    let filtered = allBlocks;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        block => block.metadata.category === selectedCategory
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        block =>
          block.metadata.name.toLowerCase().includes(query) ||
          block.metadata.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allBlocks, selectedCategory, searchQuery]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col" aria-describedby="add-block-desc">
        <DialogDescription id="add-block-desc" className="sr-only">
          Select a block to add to your site
        </DialogDescription>
        <DialogHeader>
          <DialogTitle>Add Block</DialogTitle>
          <DialogDescription>
            Choose a block to add to your page
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blocks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {BLOCK_CATEGORIES.map(category => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Blocks Grid */}
          <div className="flex-1 overflow-auto">
            {filteredBlocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No blocks found
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredBlocks.map(entry => {
                  const { metadata } = entry;
                  const icon = metadata.icon;
                  const Icon =
                    typeof icon === 'string'
                      ? () => <span>{icon}</span>
                      : icon;

                  return (
                    <Card
                      key={metadata.type}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onSelect(metadata.type)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-sm">
                              {metadata.name}
                            </CardTitle>
                          </div>
                          {metadata.isPremium && (
                            <Badge variant="secondary" className="text-xs">
                              Pro
                            </Badge>
                          )}
                        </div>
                        {metadata.description && (
                          <CardDescription className="text-xs mt-1">
                            {metadata.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
