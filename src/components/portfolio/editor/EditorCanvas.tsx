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
import { SortableBlockWrapper } from './SortableBlockWrapper';
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
      '--primary': styles.colors.primary,
      '--secondary': styles.colors.secondary,
      '--accent': styles.colors.accent,
      '--background': styles.colors.background,
      '--foreground': styles.colors.text,
      '--muted': styles.colors.surface || styles.colors.secondary || '#f1f5f9',
      '--muted-foreground': styles.colors.secondary || '#64748b',
      '--border': styles.colors.border || '#e2e8f0',
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
          style={{
            ...cssVariables,
            backgroundColor: styles?.colors?.background,
            color: styles?.colors?.text,
            fontFamily: (styles?.typography as any)?.fontFamily || 'inherit',
          }}
        >
          <SortableContext items={blockIds} strategy={rectSortingStrategy}>
            <div
              className={cn(
                'p-4 min-h-[500px]',
                previewMode === 'mobile'
                  ? 'flex flex-col space-y-4'
                  : 'grid grid-cols-12 auto-rows-min gap-4'
              )}
            >
              {blocks.length === 0 ? (
                <div className="col-span-12">
                  <BlockPlaceholder
                    onAddBlock={blockType => {
                      addBlockMutation.mutate({
                        blockType,
                        afterBlockId: undefined,
                      });
                    }}
                  />
                </div>
              ) : (
                blocks.map(block => (
                  <SortableBlockWrapper
                    key={block.id}
                    blockId={block.id}
                    isActive={false} // Managed by parent if needed, or simplistic
                    colSpan={block.layout?.colSpan || 12}
                    rowSpan={block.layout?.rowSpan}
                    onResize={() => {
                      // Cycle through common grid widths: 12 (full) -> 6 (half) -> 4 (third) -> 3 (quarter) -> 8 (two-thirds) -> 12
                      const current = block.layout?.colSpan || 12;
                      const next =
                        current === 12
                          ? 6
                          : current === 6
                            ? 4
                            : current === 4
                              ? 3
                              : current === 3
                                ? 8
                                : 12;

                      updateBlockMutation.mutate({
                        blockId: block.id,
                        updates: {
                          layout: {
                            ...block.layout,
                            colSpan: next,
                          },
                        },
                      });
                    }}
                  >
                    <div
                      className={cn(
                        'group relative',
                        selectedBlockId === block.id &&
                        'ring-2 ring-primary ring-offset-2'
                      )}
                      onMouseEnter={() => setHoveredBlockId(block.id)}
                      onMouseLeave={() => setHoveredBlockId(null)}
                      onClick={() => {
                        setSelectedBlockId(block.id);
                        setSelectedBlock(block);
                      }}
                    >
                      {/* Block Toolbar on Hover */}
                      {selectedBlockId === block.id && (
                        <BlockToolbar
                          block={block}
                          onMoveUp={() => {
                            const index = blocks.findIndex(
                              b => b.id === block.id
                            );
                            if (index > 0) {
                              moveBlock(block.id, index - 1);
                            }
                          }}
                          onMoveDown={() => {
                            const index = blocks.findIndex(
                              b => b.id === block.id
                            );
                            if (index < blocks.length - 1) {
                              moveBlock(block.id, index + 1);
                            }
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
                      )}

                      {/* Block Content */}
                      <BlockRenderer
                        block={block}
                        isEditing={view !== 'preview'}
                        onUpdate={updates => {
                          updateBlockMutation.mutate({
                            blockId: block.id,
                            updates,
                          });
                        }}
                        onDelete={() => {
                          deleteBlockMutation.mutate(block.id);
                        }}
                        onAddAfter={blockType => {
                          addBlockMutation.mutate({
                            blockType,
                            afterBlockId: block.id,
                          });
                        }}
                      />
                    </div>
                  </SortableBlockWrapper>
                ))
              )}
            </div>
          </SortableContext>
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
