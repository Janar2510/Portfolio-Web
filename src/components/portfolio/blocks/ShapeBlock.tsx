'use client';

import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/domain/builder/portfolio';
import { z } from 'zod';

// Define the schema locally for type safety within component,
// though it should match the one in schemas.ts
export const shapeBlockContentSchema = z.object({
  shape: z
    .enum(['square', 'circle', 'triangle', 'diamond'])
    .optional()
    .default('square'),
  color: z.string().optional().default('#000000'),
  width: z.union([z.string(), z.number()]).optional().default(100),
  height: z.union([z.string(), z.number()]).optional().default(100),
});

export type ShapeBlockContent = z.infer<typeof shapeBlockContentSchema>;

interface ShapeBlockProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate?: (
    content: Record<string, unknown>,
    settings?: Record<string, unknown>
  ) => void;
  onDelete?: () => void;
  onAddAfter?: (blockType: string) => void;
  onEdit?: (block: PortfolioBlock) => void;
}

export function ShapeBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: ShapeBlockProps) {
  const content = block.content as ShapeBlockContent;
  const settings = block.settings || {};

  const getShapeStyle = () => {
    const baseStyle = {
      width:
        typeof content.width === 'number'
          ? `${content.width}px`
          : content.width,
      height:
        typeof content.height === 'number'
          ? `${content.height}px`
          : content.height,
      backgroundColor: content.color,
    };

    switch (content.shape) {
      case 'circle':
        return { ...baseStyle, borderRadius: '50%' };
      case 'triangle':
        return {
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderLeft: `${typeof content.width === 'number' ? content.width / 2 : '50px'}px solid transparent`,
          borderRight: `${typeof content.width === 'number' ? content.width / 2 : '50px'}px solid transparent`,
          borderBottom: `${content.height}px solid ${content.color}`,
        };
      case 'diamond':
        return {
          ...baseStyle,
          transform: 'rotate(45deg)',
        };
      default: // square
        return baseStyle;
    }
  };

  return (
    <BaseBlock
      block={block}
      isEditing={isEditing}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onAddAfter={onAddAfter}
      onEdit={onEdit}
      className="w-full flex justify-center py-4"
    >
      <div style={getShapeStyle()} />
    </BaseBlock>
  );
}
