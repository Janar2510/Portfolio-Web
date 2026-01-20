'use client';

import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import type { TextBlockContent, TextBlockSettings } from '@/lib/blocks/schema';

interface TextBlockProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
  onDelete?: () => void;
  onAddAfter?: (blockType: string) => void;
  onEdit?: (block: PortfolioBlock) => void;
}

export function TextBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: TextBlockProps) {
  const content = block.content as TextBlockContent;
  const settings = block.settings as TextBlockSettings;

  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
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
          'mx-auto w-full px-4 py-8',
          textAlignClasses[settings.text_align || 'left'],
          fontSizeClasses[settings.font_size || 'medium']
        )}
        style={{
          maxWidth: settings.max_width || '800px',
          padding: settings.padding || undefined,
        }}
      >
        {content.title && (
          <h2 className="mb-4 text-2xl font-semibold md:text-3xl">
            {content.title}
          </h2>
        )}
        {content.html ? (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        ) : (
          <p className="whitespace-pre-line leading-relaxed">{content.text}</p>
        )}
      </section>
    </BaseBlock>
  );
}
