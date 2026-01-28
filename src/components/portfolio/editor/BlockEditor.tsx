'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { PortfolioBlock } from '@/domain/builder/portfolio';
import { getDragId, getBlockIdFromDragId } from '@/lib/blocks/dnd';
import { BlockRenderer } from './BlockRenderer';
import { SortableBlockWrapper } from './SortableBlockWrapper';

interface BlockEditorProps {
  blocks: PortfolioBlock[];
  onBlocksChange: (blocks: PortfolioBlock[]) => void;
  onBlockUpdate: (blockId: string, updates: Partial<PortfolioBlock>) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockAdd: (blockType: string, afterBlockId?: string) => void;
  onBlockEdit?: (block: PortfolioBlock) => void;
  isEditing?: boolean;
}

export function BlockEditor({
  blocks,
  onBlocksChange,
  onBlockUpdate,
  onBlockDelete,
  onBlockAdd,
  onBlockEdit,
  isEditing = true,
}: BlockEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = getBlockIdFromDragId(active.id as string);
    const overId = getBlockIdFromDragId(over.id as string);

    const oldIndex = blocks.findIndex(block => block.id === activeId);
    const newIndex = blocks.findIndex(block => block.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map(
        (block, index) => ({
          ...block,
          sort_order: index,
        })
      );

      onBlocksChange(newBlocks);

      // Update sort_order in database for all affected blocks
      newBlocks.forEach((block, index) => {
        if (block.sort_order !== index) {
          onBlockUpdate(block.id, { sort_order: index });
        }
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const blockIds = blocks.map(block => getDragId(block.id));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {blocks.map(block => (
            <SortableBlockWrapper
              key={block.id}
              blockId={block.id}
              isActive={activeId === getDragId(block.id)}
            >
              <BlockRenderer
                block={block}
                isEditing={isEditing}
                onUpdate={updates => onBlockUpdate(block.id, updates)}
                onDelete={() => onBlockDelete(block.id)}
                onAddAfter={blockType => onBlockAdd(blockType, block.id)}
                onEdit={onBlockEdit}
              />
            </SortableBlockWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
