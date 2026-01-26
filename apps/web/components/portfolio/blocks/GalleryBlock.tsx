import { useState } from 'react';
import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import type {
  GalleryBlockContent,
  GalleryBlockSettings,
} from '@/lib/blocks/schema';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MediaLibrary } from '../media/MediaLibrary';

interface GalleryBlockProps {
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
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  const images = content.images || [];

  if (images.length === 0 && !isEditing) {
    return null;
  }

  const handleAddImages = (selectedItems: any[]) => {
    const newImages = selectedItems.map(item => ({
      id: item.id,
      url: item.optimized_url || item.file_path,
      alt: item.alt_text || item.file_name,
      caption: '',
    }));

    onUpdate?.({
      ...content,
      images: [...images, ...newImages],
    });
    setIsMediaLibraryOpen(false);
  };

  const handleRemoveImage = (id: string) => {
    onUpdate?.({
      ...content,
      images: images.filter(img => img.id !== id),
    });
  };

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

        <div
          className={cn(
            'grid gap-4',
            settings.layout === 'grid' && gridCols[settings.columns || 3],
            settings.layout === 'masonry' &&
              'columns-1 md:columns-2 lg:columns-3',
            settings.layout === 'carousel' && 'flex overflow-x-auto'
          )}
          style={{ gap: settings.gap || '1rem' }}
        >
          {images.map(image => (
            <div
              key={image.id}
              className={cn(
                'relative group overflow-hidden rounded-lg',
                settings.layout === 'masonry' && 'break-inside-avoid mb-4',
                settings.layout === 'carousel' && 'flex-shrink-0 w-64'
              )}
              style={{
                aspectRatio: settings.aspect_ratio || undefined,
                minHeight: '200px',
              }}
            >
              <Image
                src={image.url}
                alt={image.alt || ''}
                fill
                className="object-cover"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-sm text-white opacity-100 group-hover:opacity-0 transition-opacity">
                  {image.caption}
                </div>
              )}

              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveImage(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {isEditing && (
            <button
              onClick={() => setIsMediaLibraryOpen(true)}
              className={cn(
                'flex items-center justify-center rounded-lg border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 transition-all min-h-[200px]',
                settings.layout === 'carousel' && 'flex-shrink-0 w-64'
              )}
            >
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-muted-foreground" />
                <span className="mt-2 block text-sm font-medium text-muted-foreground">
                  Add Images
                </span>
              </div>
            </button>
          )}
        </div>

        <Dialog open={isMediaLibraryOpen} onOpenChange={setIsMediaLibraryOpen}>
          <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Select Images</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden p-6">
              <MediaLibrary multiple onSelectMultiple={handleAddImages} />
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </BaseBlock>
  );
}
