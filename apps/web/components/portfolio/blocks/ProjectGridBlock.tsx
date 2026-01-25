/**
 * Project Grid Block Component
 * Displays a grid of portfolio projects with categories and immersive hover effects
 */

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import { useEditorStore } from '@/stores/portfolio';

interface ProjectGridBlockProps {
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

export function ProjectGridBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: ProjectGridBlockProps) {
  const { currentPage } = useEditorStore();
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);

  const [activeCategory, setActiveCategory] = useState("All");

  const content = block.content as {
    title?: string;
    limit?: number;
    category?: string;
    tags?: string[];
  };

  const settings = block.settings as {
    layout?: 'grid' | 'masonry' | 'list';
    columns?: number;
    show_excerpt?: boolean;
    show_tags?: boolean;
    show_category?: boolean;
    aspect_ratio?: 'square' | 'video' | 'portrait' | 'auto';
  };

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: [
      'portfolio-projects',
      currentPage?.site_id,
      content.category,
      content.tags,
    ],
    queryFn: async () => {
      if (!currentPage?.site_id) return [];
      const allProjects = await portfolioService.getProjects(
        currentPage.site_id
      );

      // Filter by content category if specified in block config
      let filtered = allProjects;
      if (content.category) {
        filtered = filtered.filter((p: any) => p.category === content.category);
      }

      // Filter by tags if specified
      if (content.tags && content.tags.length > 0) {
        filtered = filtered.filter((p: any) =>
          content.tags?.some(tag => p.tags?.includes(tag))
        );
      }

      // Apply limit
      if (content.limit) {
        filtered = filtered.slice(0, content.limit);
      }

      return filtered;
    },
    enabled: !!currentPage?.site_id,
  });

  // Calculate distinct categories from fetched projects
  const categories = ["All", ...Array.from(new Set(projects.map((p: any) => p.category).filter(Boolean)))];

  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter((p: any) => p.category === activeCategory);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const columns = settings.columns || 3;
  const layout = settings.layout || 'grid';

  const aspectRatios = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[4/5]',
    auto: 'aspect-auto',
  };

  return (
    <BaseBlock
      block={block}
      isEditing={isEditing}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onAddAfter={onAddAfter}
      onEdit={onEdit}
      className="w-full bg-black py-32"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-primary mb-4">Portfolio</h2>
          {content.title && (
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-10">
              {content.title}
            </h3>
          )}

          {/* Category Tabs */}
          {settings.show_category && categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-4 mb-16 animate-fade-in">
              {categories.map(cat => (
                <button
                  key={cat as string}
                  onClick={() => setActiveCategory(cat as string)}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {cat as string}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground animate-pulse">
            Loading masterpieces...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <p className="text-slate-500 italic">
              {isEditing
                ? 'No projects found. Add projects in the sidebar or change filters.'
                : 'No projects to display.'}
            </p>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-8',
              layout === 'grid' && gridCols[columns as keyof typeof gridCols],
              layout === 'masonry' && 'columns-1 md:columns-2 lg:columns-3',
              layout === 'list' && 'flex flex-col gap-4'
            )}
          >
            {filteredProjects.map((project: any, i: number) => (
              <div
                key={project.id}
                className={cn(
                  "group relative overflow-hidden rounded-[2rem] bg-slate-900 border border-white/5 transition-all duration-700 animate-slide-up",
                  aspectRatios[settings.aspect_ratio || 'portrait']
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {project.thumbnail_url && (
                  <Image
                    src={project.thumbnail_url}
                    alt={project.title || 'Project'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}

                {/* Immersive Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-10 flex flex-col justify-end backdrop-blur-[2px]">
                  <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {project.category || 'Featured'}
                  </span>
                  <h4 className="text-3xl font-bold text-white mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    {project.title}
                  </h4>
                  {settings.show_excerpt && project.excerpt && (
                    <p className="text-slate-300 text-sm mb-6 line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                      {project.excerpt}
                    </p>
                  )}
                  <button className="w-fit text-sm font-bold border-b-2 border-primary pb-1 hover:border-white transition-all transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">
                    View Case Study
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action Button below grid */}
        {filteredProjects.length > 0 && (
          <div className="mt-20 text-center animate-fade-in animate-delay-500">
            <button className="px-10 py-4 bg-transparent border-2 border-primary hover:bg-primary text-white font-bold rounded-full transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-primary/20">
              View All Projects
            </button>
          </div>
        )}
      </div>
    </BaseBlock>
  );
}
