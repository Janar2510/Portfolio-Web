'use client';

import {
  Palette,
  Layers,
  Monitor,
  Sparkles,
  Zap,
  Shield,
  Star,
  Code,
  Smartphone,
  Globe,
  PenTool,
  Cpu,
  Database,
  Cloud,
  TrendingUp,
  Camera,
  Briefcase,
  Leaf,
  Home,
  Compass,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type {
  FeaturesBlockContent,
  FeaturesBlockSettings,
} from '@/lib/blocks/schema';
import type { PortfolioBlock } from '@/domain/builder/portfolio';

// Icon mapping - expanded
const iconMap: Record<string, LucideIcon> = {
  Palette,
  Layers,
  Monitor,
  Sparkles,
  Zap,
  Shield,
  Star,
  Code,
  Smartphone,
  Globe,
  PenTool,
  Cpu,
  Database,
  Cloud,
  TrendingUp,
  Camera,
  Briefcase,
  Leaf,
  Home,
  Compass,
  Activity,
};

interface FeaturesBlockProps {
  block: PortfolioBlock;
  isEditing?: boolean;
}

export function FeaturesBlock({
  block,
  isEditing = false,
}: FeaturesBlockProps) {
  const content = (block.content || {}) as FeaturesBlockContent;
  const settings = (block.settings || {}) as FeaturesBlockSettings;

  const features = content.features || [];
  const columns = settings.columns || 3;
  const showIcon = settings.show_icon !== false;
  const isGlass = settings.background === 'glass';

  const getGridClasses = (cols: number) => {
    switch (cols) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-3';
    }
  };

  return (
    <BaseBlock block={block} isEditing={isEditing}>
      <div
        className={cn(
          'py-20 md:py-32 transition-colors duration-300',
          // Only force background color if specifically requested or if glass (implied dark context usually)
          // But better to rely on global template styles unless overridden.
          // For 'Artisanal', we want that dark feel.
          isGlass ? 'bg-transparent' : 'bg-transparent text-foreground'
        )}
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              {content.title && (
                <>
                  <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
                    What I Do
                  </h2>
                  <h3
                    className={cn(
                      'text-4xl md:text-5xl font-serif font-bold',
                      isGlass ? 'text-white' : 'text-foreground'
                    )}
                  >
                    {content.title}
                  </h3>
                </>
              )}
            </div>
            {content.description && (
              <p
                className={cn(
                  'max-w-md leading-relaxed text-lg',
                  isGlass ? 'text-slate-300' : 'text-muted-foreground'
                )}
              >
                {content.description}
              </p>
            )}
          </div>

          <div className={cn('grid gap-8', getGridClasses(columns))}>
            {features.map((feature, idx) => {
              const IconComponent =
                feature.icon && iconMap[feature.icon]
                  ? iconMap[feature.icon]
                  : Sparkles;

              return (
                <div
                  key={idx}
                  className={cn(
                    'group p-10 rounded-3xl transition-all duration-500 hover:-translate-y-2',
                    isGlass
                      ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                      : 'bg-surface border border-border hover:shadow-lg hover:border-primary/50 text-card-foreground'
                  )}
                >
                  {showIcon && (
                    <div
                      className={cn(
                        'mb-6 p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform',
                        isGlass ? 'bg-black/40' : 'bg-primary/10'
                      )}
                    >
                      <IconComponent
                        className={cn(
                          'transition-colors',
                          isGlass
                            ? 'text-indigo-400 group-hover:text-indigo-300'
                            : 'text-primary'
                        )}
                        size={32}
                      />
                    </div>
                  )}
                  <h4
                    className={cn(
                      'text-xl font-bold mb-4',
                      isGlass ? 'text-white' : 'text-foreground'
                    )}
                  >
                    {feature.title}
                  </h4>
                  <p
                    className={cn(
                      'text-sm leading-relaxed',
                      isGlass ? 'text-slate-400' : 'text-muted-foreground'
                    )}
                  >
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BaseBlock>
  );
}
