'use client';

import React from 'react';
import type { PortfolioBlock } from '@/domain/builder/portfolio';
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
import { HeaderBlock } from '../blocks/HeaderBlock';
import { FooterBlock } from '../blocks/FooterBlock';
import { FrameBlock } from '../blocks/FrameBlock';
import { ShapeBlock } from '../blocks/ShapeBlock';
import { FeaturesBlock } from '../blocks/FeaturesBlock';
import { SplitHeroBlock } from '../blocks/SplitHeroBlock';
import { OrganicHeroBlock } from '../blocks/OrganicHeroBlock';
import dynamic from 'next/dynamic';

const BrandHeroBlock = dynamic(
  () => import('../blocks/BrandHeroBlock').then(mod => mod.BrandHeroBlock),
  {
    ssr: false,
    loading: () => <div className="h-screen w-full bg-black animate-pulse" />,
  }
);

const InfiniteHeroBlock = dynamic(() => import('../blocks/InfiniteHeroBlock'), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-black animate-pulse" />,
});

const CyberHeroBlock = dynamic(
  () => import('../blocks/CyberHeroBlock').then(mod => mod.CyberHeroBlock),
  {
    ssr: false,
    loading: () => <div className="h-screen w-full bg-black animate-pulse" />,
  }
);

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
    onUpdate: (
      content: Record<string, unknown>,
      settings?: Record<string, unknown>
    ) => {
      onUpdate({
        content: { ...block.content, ...content },
        settings: settings
          ? { ...block.settings, ...settings }
          : block.settings,
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
    case 'infinite-hero':
      return <InfiniteHeroBlock {...blockProps} />;
    case 'split-hero':
      return <SplitHeroBlock {...blockProps} />;
    case 'cyber-hero':
      return <CyberHeroBlock {...blockProps} />;
    case 'organic-hero':
      return <OrganicHeroBlock {...blockProps} />;
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
    case 'header':
      return <HeaderBlock {...blockProps} />;
    case 'footer':
      return <FooterBlock {...blockProps} />;
    case 'contact-form':
      return <FormBlock {...blockProps} />;
    case 'section':
      // 'section' blocks in template definition seem to be used as headers/dividers.
      // We can map them to TextBlock with specific settings or just TextBlock for now
      // since we don't have a dedicated SectionBlock yet.
      // Or we can treat them as a container if we had nested blocks.
      // For now, let's render them as TextBlocks if they have content,
      // or just a wrapper if we assume they are just layout.
      // Given 'title' in content from converter, TextBlock is a good fit.
      // We'll rename the type in props or let TextBlock handle it?
      // TextBlock expects 'text' content. Converter sends 'title'.
      // Only TextBlock handles generic text. Let's start with TextBlock.
      return <TextBlock {...blockProps} />;
    case 'brand-hero':
      return <BrandHeroBlock {...blockProps} />;
    case 'frame':
      return <FrameBlock {...blockProps} />;
    case 'shape':
      return <ShapeBlock {...blockProps} />;
    case 'features':
      return <FeaturesBlock {...blockProps} />;
    default:
      return (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Unknown block type: {block.block_type}
        </div>
      );
  }
}
