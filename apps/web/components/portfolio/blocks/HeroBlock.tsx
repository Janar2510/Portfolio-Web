'use client';

import { BaseBlock } from './BaseBlock';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import type { HeroBlockContent, HeroBlockSettings } from '@/lib/blocks/schema';

interface HeroBlockProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
  onDelete?: () => void;
  onAddAfter?: (blockType: string) => void;
  onEdit?: (block: PortfolioBlock) => void;
}

export function HeroBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: HeroBlockProps) {
  const content = block.content as HeroBlockContent;
  const settings = block.settings as HeroBlockSettings;

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const heightClasses = {
    small: 'min-h-[300px]',
    medium: 'min-h-[500px]',
    large: 'min-h-[700px]',
    full: 'min-h-screen',
  };

  const backgroundStyles = {
    solid: 'bg-background',
    gradient: 'bg-gradient-to-br from-primary/20 via-background to-accent/20',
    image: content.image_url
      ? { backgroundImage: `url(${content.image_url})` }
      : 'bg-background',
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
      <section
        className={cn(
          'relative flex w-full flex-col justify-center px-4 py-16',
          heightClasses[settings.height || 'medium'],
          alignmentClasses[settings.alignment || 'center'],
          settings.background === 'image' && 'bg-cover bg-center',
          settings.overlay && 'before:absolute before:inset-0 before:bg-black/50 before:content-[""]'
        )}
        style={
          settings.background === 'image' && content.image_url
            ? backgroundStyles.image
            : undefined
        }
      >
        <div
          className={cn(
            'relative z-10 flex max-w-4xl flex-col gap-4',
            alignmentClasses[settings.alignment || 'center']
          )}
        >
          {content.headline && (
            <h1
              className={cn(
                'text-4xl font-bold md:text-5xl lg:text-6xl',
                settings.text_color && `text-[${settings.text_color}]`
              )}
            >
              {content.headline}
            </h1>
          )}
          {content.subheadline && (
            <p
              className={cn(
                'text-lg md:text-xl lg:text-2xl',
                settings.text_color && `text-[${settings.text_color}]`
              )}
            >
              {content.subheadline}
            </p>
          )}
          {content.cta_text && content.cta_link && (
            <div className="mt-4">
              <Button asChild size="lg" variant="default">
                <a href={content.cta_link}>{content.cta_text}</a>
              </Button>
            </div>
          )}
        </div>
      </section>
    </BaseBlock>
  );
}
