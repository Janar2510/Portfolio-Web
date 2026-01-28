/**
 * Block Placeholder Component
 * Empty state when no blocks exist, with add block button
 */

'use client';

import { Button } from '@/components/ui/button';
import { Plus, Layout } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BlockPlaceholderProps {
  onAddBlock: (blockType: string) => void;
}

export function BlockPlaceholder({ onAddBlock }: BlockPlaceholderProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md w-full border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Layout className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Start Building</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first block to start building your page. Choose from
                layouts, content, media, and interactive blocks.
              </p>
            </div>
            <Button onClick={() => onAddBlock('hero')} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Block
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
