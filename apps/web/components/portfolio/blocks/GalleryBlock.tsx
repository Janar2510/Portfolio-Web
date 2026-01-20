'use client';

import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import type { GalleryBlockContent, GalleryBlockSettings } from '@/lib/blocks/schema';
import Image from 'next/image';

interface GalleryBlockProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
  onDelete?: () => void;
  onAddAfter?: (blockType: string) => void;
  onEdit?: (block: PortfolioBlock) => void;
}

export function GalleryBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: GalleryBlockProps) {
  const content = block.content as GalleryBlockContent;
  const settings = block.settings as GalleryBlockSettings;

  const images = content.images || [];

  if (images.length === 0 && !isEditing) {
    return null;
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
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
      <section className="w-full px-4 py-8">
        {content.title && (
          <h2 className="mb-6 text-center text-3xl font-semibold">
            {content.title}
          </h2>
        )}

        {images.length === 0 && isEditing ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted">
            <p className="text-sm text-muted-foreground">
              No images. Click to add images to this gallery.
            </p>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-4',
              settings.layout === 'grid' && gridCols[settings.columns || 3],
              settings.layout === 'masonry' && 'columns-1 md:columns-2 lg:columns-3',
              settings.layout === 'carousel' && 'flex overflow-x-auto'
            )}
            style={{ gap: settings.gap || '1rem' }}
          >
            {images.map((image) => (
              <div
                key={image.id}
                className={cn(
                  'relative overflow-hidden rounded-lg',
                  settings.layout === 'masonry' && 'break-inside-avoid mb-4',
                  settings.layout === 'carousel' && 'flex-shrink-0 w-64'
                )}
                style={{
                  aspectRatio: settings.aspect_ratio || undefined,
                }}
              >
                <Image
                  src={image.url}
                  alt={image.alt || ''}
                  fill
                  className="object-cover"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-sm text-white">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </BaseBlock>
  );
}
