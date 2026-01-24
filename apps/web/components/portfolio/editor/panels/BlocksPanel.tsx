/**
 * Blocks Panel Component
 * Block library for adding new blocks
 */

'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { blockRegistry } from '@/lib/portfolio/blocks/registry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DraggableBlockItem } from './DraggableBlockItem';

const BLOCK_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'layout', name: 'Layout' },
  { id: 'content', name: 'Content' },
  { id: 'media', name: 'Media' },
  { id: 'interactive', name: 'Interactive' },
  { id: 'portfolio', name: 'Portfolio' },
] as const;

export function BlocksPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allBlocks = blockRegistry.getAll();

  const filteredBlocks = useMemo(() => {
    let filtered = allBlocks;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (block) => block.metadata.category === selectedCategory
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (block) =>
          block.metadata.name.toLowerCase().includes(query) ||
          block.metadata.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allBlocks, selectedCategory, searchQuery]);

  const handleAddBlock = (blockType: string) => {
    // TODO: Implement add block
    console.log('Add block:', blockType);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search blocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {BLOCK_CATEGORIES.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Blocks Grid */}
      <div className="space-y-2">
        {filteredBlocks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No blocks found
          </div>
        ) : (
          filteredBlocks.map((entry) => {
            const { metadata } = entry;
            const Icon = typeof metadata.icon === 'string'
              ? () => <span>{metadata.icon}</span>
              : metadata.icon;

            return (
              <DraggableBlockItem
                key={metadata.type}
                id={`sidebar-block-${metadata.type}`}
                type={metadata.type}
              >
                <Card
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleAddBlock(metadata.type)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-sm">{metadata.name}</CardTitle>
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
              </DraggableBlockItem>
            );
          })
        )}
      </div>
    </div>
  );
}
