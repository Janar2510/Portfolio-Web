'use client';

import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/domain/builder/portfolio';
import type {
  VideoBlockContent,
  VideoBlockSettings,
} from '@/lib/blocks/schema';

interface VideoBlockProps {
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

export function VideoBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: VideoBlockProps) {
  const content = block.content as VideoBlockContent;
  const settings = block.settings as VideoBlockSettings;

  if (!content.video_url && !isEditing) {
    return null;
  }

  const getVideoEmbedUrl = () => {
    if (content.video_type === 'youtube') {
      const videoId = content.video_url.split('v=')[1]?.split('&')[0];
      if (!videoId) return null;
      return `https://www.youtube.com/embed/${videoId}?autoplay=${content.autoplay ? 1 : 0}&loop=${content.loop ? 1 : 0}&mute=${content.muted ? 1 : 0}`;
    }
    if (content.video_type === 'vimeo') {
      const videoId = content.video_url.split('/').pop();
      if (!videoId) return null;
      return `https://player.vimeo.com/video/${videoId}?autoplay=${content.autoplay ? 1 : 0}&loop=${content.loop ? 1 : 0}&muted=${content.muted ? 1 : 0}`;
    }
    return content.video_url;
  };

  const aspectRatioMap: Record<string, string> = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '21/9': 'aspect-[21/9]',
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
        <div
          className={cn(
            'mx-auto',
            aspectRatioMap[settings.aspect_ratio || '16/9'] || 'aspect-video',
            settings.rounded && 'rounded-lg overflow-hidden',
            settings.width && `max-w-[${settings.width}]`
          )}
        >
          {content.video_url ? (
            content.video_type === 'youtube' ||
            content.video_type === 'vimeo' ? (
              <iframe
                src={getVideoEmbedUrl() || ''}
                className="h-full w-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Video player"
              />
            ) : (
              <video
                src={content.video_url}
                controls={settings.controls}
                autoPlay={content.autoplay}
                loop={content.loop}
                muted={content.muted}
                className="h-full w-full object-cover"
                poster={content.thumbnail_url}
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
              <p className="text-sm text-muted-foreground">
                No video URL provided
              </p>
            </div>
          )}
        </div>
      </section>
    </BaseBlock>
  );
}
