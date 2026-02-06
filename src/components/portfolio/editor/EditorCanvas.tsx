/**
 * Editor Canvas Component
 * Main editing area with drag-and-drop block support
 */

'use client';

import { useState } from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import {
  useBlocksStore,
  useEditorStore,
  useStylesStore,
} from '@/stores/portfolio';
import { BlockRenderer } from './BlockRenderer';
import { FreeformBlockWrapper } from './FreeformBlockWrapper';
import { BlockPlaceholder } from './BlockPlaceholder';
import { BlockToolbar } from './BlockToolbar';
import {
  useAddBlock,
  useUpdateBlock,
  useDeleteBlock,
  useDuplicateBlock,
} from '@/hooks/portfolio/use-editor';
import { AddBlockModal } from './AddBlockModal';
import { cn } from '@/lib/utils';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PortfolioPage } from '@/domain/builder/portfolio';
import { getDragId, getBlockIdFromDragId } from '@/lib/blocks/dnd';

interface EditorCanvasProps {
  page: PortfolioPage;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  view: 'canvas' | 'preview' | 'split';
}

export function EditorCanvas({ page, previewMode, view }: EditorCanvasProps) {
  const {
    blocks,
    moveBlock,
    setSelectedBlock,
    selectedBlock,
    setHoveredBlockId,
    duplicateBlock,
  } = useBlocksStore();
  const { selectedBlockId, setSelectedBlockId } = useEditorStore();
  const { styles, darkModeEnabled } = useStylesStore();

  const cssVariables = styles?.colors
    ? ({
      '--portfolio-primary': styles.colors.primary,
      '--portfolio-secondary': styles.colors.secondary,
      '--portfolio-accent': styles.colors.accent,
      '--portfolio-background': styles.colors.background,
      '--portfolio-text': styles.colors.text,
      '--portfolio-surface': styles.colors.surface || styles.colors.secondary || '#f1f5f9',
      '--portfolio-border': styles.colors.border || '#e2e8f0',
      '--portfolio-font-heading': (styles.typography as any)?.headingFont || (styles.typography as any)?.heading || 'inherit',
      '--portfolio-font-body': (styles.typography as any)?.bodyFont || (styles.typography as any)?.body || 'inherit',
    } as React.CSSProperties)
    : {};

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
  });

  /* Drag functionality moved to Layout */

  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [addBlockAfterId, setAddBlockAfterId] = useState<string | undefined>();

  const addBlockMutation = useAddBlock();
  const updateBlockMutation = useUpdateBlock();
  const deleteBlockMutation = useDeleteBlock();
  const duplicateBlockMutation = useDuplicateBlock();

  const blockIds = blocks.map(block => getDragId(block.id));

  // Preview mode styles
  const previewStyles = {
    desktop: 'w-full',
    tablet: 'max-w-3xl mx-auto',
    mobile: 'max-w-sm mx-auto',
  };

  const previewIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  const PreviewIcon = previewIcons[previewMode];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      {/* Preview Mode Indicator */}
      {view === 'preview' && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-background border-b">
          <PreviewIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground capitalize">
            {previewMode} Preview
          </span>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto" ref={setNodeRef}>
        <div
          className={cn(
            'min-h-full bg-background transition-all duration-300',
            view === 'preview' && previewStyles[previewMode],
            view === 'split' && 'max-w-6xl mx-auto',
            isOver && 'ring-2 ring-primary ring-inset',
            darkModeEnabled && 'dark'
          )}
          id="preview-scroll-container"
          style={{
            ...cssVariables,
            backgroundColor: 'var(--portfolio-background)',
            color: 'var(--portfolio-text)',
            fontFamily: 'var(--portfolio-font-body)',
          }}
        >
          <div
            className={cn(
              'p-4 min-h-[800px] relative w-full',
              darkModeEnabled && 'dark'
            )}
            style={{
              overflowY: 'auto'
            }}
          >
            {blocks.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[400px]">
                  <BlockPlaceholder
                    onAddBlock={blockType => {
                      addBlockMutation.mutate({
                        blockType,
                        afterBlockId: undefined,
                      });
                    }}
                  />
                </div>
              </div>
            ) : (
              blocks.map(block => (
                <FreeformBlockWrapper
                  key={block.id}
                  block={block}
                  isEditing={view !== 'preview'}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => {
                    setSelectedBlockId(block.id);
                    setSelectedBlock(block);
                  }}
                  onLayoutUpdate={(layoutUpdates) => {
                    updateBlockMutation.mutate({
                      blockId: block.id,
                      updates: {
                        layout: {
                          ...block.layout,
                          ...layoutUpdates,
                        },
                      },
                    });
                  }}
                >
                  <div
                    className={cn(
                      'group relative w-full h-full',
                      selectedBlockId === block.id && 'z-10'
                    )}
                    data-block-id={block.id}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      setHoveredBlockId(block.id);
                    }}
                    onMouseLeave={() => setHoveredBlockId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBlockId(block.id);
                      setSelectedBlock(block);
                    }}
                  >
                    <BlockToolbar
                      block={block}
                      // Removed MoveUp/Down as we are freeform now
                      onUpdateLayout={(layoutUpdates) => {
                        updateBlockMutation.mutate({
                          blockId: block.id,
                          updates: {
                            layout: {
                              ...block.layout,
                              ...layoutUpdates,
                            },
                          },
                        });
                      }}
                      onDuplicate={() => {
                        duplicateBlockMutation.mutate(block.id);
                      }}
                      onDelete={() => {
                        if (confirm('Delete this block?')) {
                          deleteBlockMutation.mutate(block.id);
                        }
                      }}
                      onSettings={() => {
                        setSelectedBlockId(block.id);
                        setSelectedBlock(block);
                      }}
                    />

                    <BlockRenderer
                      block={block}
                      isEditing={view !== 'preview'}
                      isSelected={selectedBlockId === block.id}
                      onUpdate={updates => {
                        updateBlockMutation.mutate({
                          blockId: block.id,
                          updates,
                        });
                      }}
                      onDelete={() => {
                        deleteBlockMutation.mutate(block.id);
                      }}
                    />
                  </div>
                </FreeformBlockWrapper>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Block Button */}
      {blocks.length > 0 && view !== 'preview' && (
        <div className="sticky bottom-4 left-1/2 -translate-x-1/2 z-10">
          <Button
            onClick={() => {
              setShowAddBlockModal(true);
              setAddBlockAfterId(undefined);
            }}
            size="lg"
            className="shadow-lg"
          >
            + Add Block
          </Button>
        </div>
      )}

      {/* Add Block Modal */}
      {showAddBlockModal && (
        <AddBlockModal
          onClose={() => {
            setShowAddBlockModal(false);
            setAddBlockAfterId(undefined);
          }}
          onSelect={blockType => {
            addBlockMutation.mutate({
              blockType,
              afterBlockId: addBlockAfterId,
            });
            setShowAddBlockModal(false);
            setAddBlockAfterId(undefined);
          }}
        />
      )}
    </div>
  );
}
