'use client';

import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import { z } from 'zod';

export const frameBlockContentSchema = z.object({
    borderColor: z.string().optional().default('#000000'),
    borderWidth: z.union([z.string(), z.number()]).optional().default(2),
    borderRadius: z.union([z.string(), z.number()]).optional().default(0),
    backgroundColor: z.string().optional().default('transparent'),
    padding: z.union([z.string(), z.number()]).optional().default(20),
    minHeight: z.union([z.string(), z.number()]).optional().default(200),
});

export type FrameBlockContent = z.infer<typeof frameBlockContentSchema>;

interface FrameBlockProps {
    block: PortfolioBlock;
    isEditing?: boolean;
    onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
    onDelete?: () => void;
    onAddAfter?: (blockType: string) => void;
    onEdit?: (block: PortfolioBlock) => void;
}

export function FrameBlock({
    block,
    isEditing = false,
    onUpdate,
    onDelete,
    onAddAfter,
    onEdit,
}: FrameBlockProps) {
    const content = block.content as FrameBlockContent;

    const style = {
        borderColor: content.borderColor,
        borderWidth: typeof content.borderWidth === 'number' ? `${content.borderWidth}px` : content.borderWidth,
        borderRadius: typeof content.borderRadius === 'number' ? `${content.borderRadius}px` : content.borderRadius,
        backgroundColor: content.backgroundColor,
        borderStyle: 'solid',
        padding: typeof content.padding === 'number' ? `${content.padding}px` : content.padding,
        minHeight: typeof content.minHeight === 'number' ? `${content.minHeight}px` : content.minHeight,
    };

    return (
        <BaseBlock
            block={block}
            isEditing={isEditing}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddAfter={onAddAfter}
            onEdit={onEdit}
            className="w-full"
        >
            <div
                style={style}
                className="w-full relative"
            >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 border-2 border-dashed border-gray-400 m-2">
                    Frame Content Placeholder
                </div>
            </div>
        </BaseBlock>
    );
}
