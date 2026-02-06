'use client';

import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/domain/builder/portfolio';
import type { TextBlockContent, TextBlockSettings } from '@/lib/blocks/schema';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('../editor/RichTextEditor').then(mod => mod.RichTextEditor), { ssr: false });

interface TextBlockProps {
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

  const layout = block.layout || {};
  const width = typeof layout.width === 'number' ? layout.width : 800;

  // Proportional scaling factor based on a reference width (800px)
  const referenceWidth = 800;
  const scale = width / referenceWidth;

  return (
    <BaseBlock
      block={block}
      isEditing={isEditing}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onAddAfter={onAddAfter}
      onEdit={onEdit}
      className="w-full h-full overflow-hidden"
    >
      <div
        style={{
          width: `${referenceWidth}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <section
          className={cn(
            'w-full px-4 py-8',
            textAlignClasses[settings.text_align || 'left'],
            fontSizeClasses[settings.font_size || 'medium']
          )}
          style={{
            padding: settings.padding || undefined,
          }}
        >
          {/* Title Editing */}
          {isEditing ? (
            <input
              value={content.title || ''}
              onChange={(e) => onUpdate?.({ title: e.target.value })}
              placeholder="Block Title (Optional)"
              className={cn(
                "mb-4 text-2xl font-semibold md:text-3xl bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted/30 w-full",
                textAlignClasses[settings.text_align || 'left']
              )}
            />
          ) : (
            content.title && (
              <h2 className="mb-4 text-2xl md:text-3xl font-bold" style={{ color: 'var(--portfolio-text)', fontFamily: 'var(--portfolio-font-heading)' }}>
                {content.title}
              </h2>
            )
          )}

          {/* Body Editing */}
          {isEditing ? (
            <RichTextEditor
              content={content.html || content.text || ''}
              onChange={(html: string) => onUpdate?.({ html })}
              className={cn(
                "min-h-[100px]",
                textAlignClasses[settings.text_align || 'left']
              )}
            />
          ) : (
            content.html ? (
              <div
                className="prose prose-lg max-w-none dark:prose-invert"
                style={{ color: 'var(--portfolio-text)', fontFamily: 'var(--portfolio-font-body)' }}
                dangerouslySetInnerHTML={{ __html: content.html }}
              />
            ) : (
              <p className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--portfolio-text)', fontFamily: 'var(--portfolio-font-body)' }}>{content.text}</p>
            )
          )}
        </section>
      </div>
    </BaseBlock>
  );
}
