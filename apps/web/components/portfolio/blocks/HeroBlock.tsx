'use client';

import { BaseBlock } from './BaseBlock';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import type { HeroBlockContent, HeroBlockSettings } from '@/lib/blocks/schema';
import { ArrowRight, MousePointer2 } from 'lucide-react';

interface HeroBlockProps {
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

export function HeroBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: HeroBlockProps) {
  const content = (block.content || {}) as HeroBlockContent;
  const settings = (block.settings || {}) as HeroBlockSettings;

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const heightClasses = {
    small: 'min-h-[40vh] py-20',
    medium: 'min-h-[60vh] py-32',
    large: 'min-h-[80vh] py-40',
    full: 'min-h-screen py-32',
  };

  const currentAlignment = settings.alignment || 'center';
  const currentHeight = settings.height || 'medium';

  return (
    <BaseBlock
      block={block}
      isEditing={isEditing}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onAddAfter={onAddAfter}
      onEdit={onEdit}
      className={cn(
        'w-full overflow-hidden',
        alignmentClasses[currentAlignment]
      )}
    >
      <section
        className={cn(
          'relative flex w-full flex-col justify-center px-6 md:px-12 transition-all duration-700',
          heightClasses[currentHeight],
          alignmentClasses[currentAlignment],
          settings.background === 'image' && 'bg-cover bg-center bg-no-repeat'
        )}
        style={{
          backgroundColor: content.headline?.includes('Petra')
            ? '#BC4E3F'
            : undefined,
          backgroundImage:
            settings.background === 'image' && content.image_url
              ? `url(${content.image_url})`
              : undefined,
        }}
      >
        <div
          className={cn(
            'relative z-10 flex max-w-7xl flex-col gap-2',
            alignmentClasses[currentAlignment]
          )}
        >
          {content.badge && (
            <span
              className={cn(
                'inline-block mb-1 text-2xl tracking-[0.1em] font-serif italic text-white/90 animate-slide-up',
                settings.headline_style === 'script' ||
                  content.headline?.includes('Petra')
                  ? ''
                  : 'px-4 py-1.5 font-bold uppercase border border-primary/30 bg-primary/10 text-primary rounded-full animate-pulse'
              )}
            >
              {content.badge}
            </span>
          )}

          {content.headline && (
            <h1
              className={cn(
                'tracking-tighter leading-[0.5] animate-slide-up py-4 md:py-16 text-white',
                settings.headline_style === 'script' ||
                  content.headline?.includes('Petra')
                  ? 'font-script text-[180px] md:text-[250px] lg:text-[350px]'
                  : 'text-7xl md:text-[8vw] lg:text-[12vw] font-extrabold',
                settings.headline_style === 'serif' ? 'font-serif' : ''
              )}
            >
              {content.headline}
            </h1>
          )}

          <style jsx>{`
            @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap');
            .font-script {
              font-family: 'Pinyon Script', cursive;
              text-transform: none;
              letter-spacing: normal;
              font-weight: 400;
            }
          `}</style>

          {content.subheadline && (
            <p
              className={cn(
                'text-lg md:text-[1.2vw] lg:text-[1.4vw] font-light leading-relaxed opacity-90 text-balance animate-slide-up animate-delay-200 mt-4 max-w-2xl',
                settings.headline_style === 'script' ||
                  content.headline === 'Petra'
                  ? 'text-white'
                  : 'text-slate-300',
                currentAlignment === 'center' ? 'mx-auto' : ''
              )}
            >
              {content.subheadline}
            </p>
          )}

          <div
            className={cn(
              'flex flex-col sm:flex-row items-center gap-6 mt-10 animate-scale-in animate-delay-300',
              currentAlignment === 'center' ? 'justify-center' : ''
            )}
          >
            {content.cta_text && content.cta_link && (
              <Button
                asChild
                size="lg"
                className={cn(
                  'px-10 h-14 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105',
                  settings.headline_style === 'script' ||
                    content.headline === 'Petra'
                    ? 'bg-[#5D99FA] text-white hover:bg-[#5D99FA]/90 rounded-none shadow-2xl'
                    : 'rounded-full shadow-xl hover:shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                <a href={content.cta_link} className="flex items-center gap-2">
                  {content.cta_text}
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Scroll indicator for full height heros */}
        {currentHeight === 'full' && content.show_scroll_indicator && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-[10px] uppercase tracking-widest font-bold">
              Scroll
            </span>
            <MousePointer2 size={20} />
          </div>
        )}
      </section>
    </BaseBlock>
  );
}
