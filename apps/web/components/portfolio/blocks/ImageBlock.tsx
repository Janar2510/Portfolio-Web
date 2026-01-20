'use client';

import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import type { ImageBlockContent, ImageBlockSettings } from '@/lib/blocks/schema';
import Image from 'next/image';
import Link from 'next/link';

interface ImageBlockProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
  onDelete?: () => void;
  onAddAfter?: (blockType: string) => void;
  onEdit?: (block: PortfolioBlock) => void;
}

export function ImageBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: ImageBlockProps) {
  const content = block.content as ImageBlockContent;
  const settings = block.settings as ImageBlockSettings;

  if (!content.image_url && !isEditing) {
    return null;
  }

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const ImageContent = (
    <div
      className={cn(
        'relative inline-block',
        settings.rounded && 'rounded-lg',
        settings.shadow && 'shadow-lg'
      )}
      style={{ width: settings.width || '100%' }}
    >
      {content.image_url ? (
        <Image
          src={content.image_url}
          alt={content.alt || ''}
          width={800}
          height={600}
          className={cn(
            'h-auto w-full object-cover',
            settings.rounded && 'rounded-lg'
          )}
        />
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
          <p className="text-sm text-muted-foreground">No image selected</p>
        </div>
      )}
      {content.caption && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {content.caption}
        </p>
      )}
    </div>
  );

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
      <section className="w-full px-4 py-8">
        <div
          className={cn(
            'flex',
            alignmentClasses[settings.alignment || 'center']
          )}
        >
          {content.link_url ? (
            <Link href={content.link_url} className="block">
              {ImageContent}
            </Link>
          ) : (
            ImageContent
          )}
        </div>
      </section>
    </BaseBlock>
  );
}
