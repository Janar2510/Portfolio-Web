'use client';

import React from 'react';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import { HeroBlock } from '../blocks/HeroBlock';
import { TextBlock } from '../blocks/TextBlock';
import { GalleryBlock } from '../blocks/GalleryBlock';
import { ProjectsBlock } from '../blocks/ProjectsBlock';
import { FormBlock } from '../blocks/FormBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { VideoBlock } from '../blocks/VideoBlock';

interface BlockRendererProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate: (updates: Partial<PortfolioBlock>) => void;
  onDelete: () => void;
  onAddAfter?: (blockType: string) => void;
  onEdit?: (block: PortfolioBlock) => void;
}

export function BlockRenderer({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: BlockRendererProps) {
  const blockProps = {
    block,
    isEditing,
    onUpdate: (content: Record<string, unknown>, settings?: Record<string, unknown>) => {
      onUpdate({
        content: { ...block.content, ...content },
        settings: settings ? { ...block.settings, ...settings } : block.settings,
      });
    },
    onDelete,
    onAddAfter,
    onEdit,
  };

  switch (block.block_type) {
    case 'hero':
      return <HeroBlock {...blockProps} />;
    case 'text':
      return <TextBlock {...blockProps} />;
    case 'gallery':
      return <GalleryBlock {...blockProps} />;
    case 'projects':
      return <ProjectsBlock {...blockProps} />;
    case 'form':
      return <FormBlock {...blockProps} />;
    case 'image':
      return <ImageBlock {...blockProps} />;
    case 'video':
      return <VideoBlock {...blockProps} />;
    default:
      return (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Unknown block type: {block.block_type}
        </div>
      );
  }
}
