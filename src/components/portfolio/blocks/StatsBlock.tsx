/**
 * Stats Block Component
 * Displays statistics in a visual format
 */

'use client';

import { useEffect, useState } from 'react';
import { BaseBlock } from './BaseBlock';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/domain/builder/portfolio';

interface StatsBlockProps {
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

export function StatsBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: StatsBlockProps) {
  const content = block.content as {
    title?: string;
    stats?: Array<{
      id: string;
      label: string;
      value: string | number;
      suffix?: string;
      icon?: string;
    }>;
  };

  const settings = block.settings as {
    layout?: 'grid' | 'horizontal';
    columns?: number;
    animation?: boolean;
  };

  const stats = content.stats || [];
  const layout = settings.layout || 'grid';
  const columns = settings.columns || 4;
  const animate = settings.animation !== false;

  // Animation state
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    if (animate && !isEditing) {
      const timers = stats.map((stat, index) => {
        const numericValue =
          typeof stat.value === 'number'
            ? stat.value
            : parseFloat(stat.value.toString().replace(/[^0-9.]/g, ''));
        if (isNaN(numericValue)) return null;

        return setTimeout(() => {
          const duration = 2000;
          const steps = 60;
          const increment = numericValue / steps;
          let current = 0;

          const interval = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
              current = numericValue;
              clearInterval(interval);
            }
            setAnimatedValues(prev => ({
              ...prev,
              [stat.id]: Math.floor(current),
            }));
          }, duration / steps);
        }, index * 100);
      });

      return () => {
        timers.forEach(timer => timer && clearTimeout(timer));
      };
    } else {
      // Set final values immediately
      const finalValues: Record<string, number> = {};
      stats.forEach(stat => {
        const numericValue =
          typeof stat.value === 'number'
            ? stat.value
            : parseFloat(stat.value.toString().replace(/[^0-9.]/g, ''));
        if (!isNaN(numericValue)) {
          finalValues[stat.id] = numericValue;
        }
      });
      setAnimatedValues(finalValues);
    }
  }, [stats, animate, isEditing]);

  const formatValue = (stat: (typeof stats)[0]) => {
    if (typeof stat.value === 'number') {
      return animate && animatedValues[stat.id] !== undefined
        ? animatedValues[stat.id]
        : stat.value;
    }
    return stat.value;
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
          <h2 className="text-3xl font-bold mb-8 text-center text-[var(--portfolio-text)]">
            {content.title}
          </h2>
        )}

        {stats.length === 0 ? (
          <div className="text-center py-12 text-[var(--portfolio-text)] opacity-60">
            {isEditing
              ? 'Add stats in the block settings.'
              : 'No stats to display.'}
          </div>
        ) : (
          <div
            className={cn(
              layout === 'grid' &&
              `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`,
              layout === 'horizontal' && 'flex flex-wrap justify-center gap-8'
            )}
          >
            {stats.map((stat, index) => (
              <Card
                key={`${stat.id || 'stat'}-${index}`}
                className="text-center bg-[var(--portfolio-text)]/5 border-[var(--portfolio-text)]/10"
              >
                <CardContent className="p-6">
                  {stat.icon && (
                    <div className="text-4xl mb-4">{stat.icon}</div>
                  )}
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-[var(--portfolio-text)]">
                    {formatValue(stat)}
                    {stat.suffix && (
                      <span className="text-2xl">{stat.suffix}</span>
                    )}
                  </div>
                  <div className="text-sm text-[var(--portfolio-text)] opacity-60 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </BaseBlock>
  );
}
