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
import { ProjectGridBlock } from '../blocks/ProjectGridBlock';
import { SkillsBlock } from '../blocks/SkillsBlock';
import { StatsBlock } from '../blocks/StatsBlock';

interface BlockRendererProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate: (updates: Partial<PortfolioBlock>) => void;
  onDelete: () => void;
  onAddAfter?: (blockType: string) => void;
  onEdit?: (block: PortfolioBlock) => void;
  siteId?: string; // Optional site_id for public pages
}

export function BlockRenderer({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
  siteId,
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
    siteId, // Pass siteId to blocks that need it
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
    case 'project-grid':
      return <ProjectGridBlock {...blockProps} />;
    case 'skills':
      return <SkillsBlock {...blockProps} />;
    case 'stats':
      return <StatsBlock {...blockProps} />;
    default:
      return (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Unknown block type: {block.block_type}
        </div>
      );
  }
}
