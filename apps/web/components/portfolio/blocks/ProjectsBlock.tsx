'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import type { ProjectsBlockContent, ProjectsBlockSettings } from '@/lib/blocks/schema';
import { useEditorStore } from '@/stores/portfolio';

interface ProjectsBlockProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
  onDelete?: () => void;
  onAddAfter?: (blockType: string) => void;
  onEdit?: (block: PortfolioBlock) => void;
  siteId?: string; // Optional site_id for public pages
}

export function ProjectsBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
  siteId: propSiteId,
}: ProjectsBlockProps) {
  const content = block.content as ProjectsBlockContent;
  const settings = block.settings as ProjectsBlockSettings;
  const { currentPage } = useEditorStore();
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);

  // Use prop siteId (for public pages) or currentPage site_id (for editor)
  const siteId = propSiteId || currentPage?.site_id;

  // Fetch projects from database
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['portfolio-projects', siteId, content.category, content.tags],
    queryFn: async () => {
      if (!siteId) return [];
      return await portfolioService.getProjects(siteId, {
        category: content.category,
        tags: content.tags,
        limit: content.limit || 6,
      });
    },
    enabled: !!siteId && !isEditing,
  });

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
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

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted">
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? 'No projects found. Projects will appear here when you create them.'
                : 'No projects to display.'}
            </p>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-6',
              settings.layout === 'grid' && gridCols[settings.columns || 3],
              settings.layout === 'list' && 'grid-cols-1',
              settings.layout === 'masonry' && 'columns-1 md:columns-2 lg:columns-3'
            )}
          >
            {projects.map((project) => (
              <div
                key={project.id}
                className="group rounded-lg border bg-card p-4 transition-shadow hover:shadow-lg"
              >
                {project.thumbnail_url && (
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <h3 className="mb-2 text-xl font-semibold">{project.title}</h3>
                {settings.show_description && (project.excerpt || project.description) && (
                  <p className="mb-3 text-sm text-muted-foreground">
                    {project.excerpt || project.description}
                  </p>
                )}
                {settings.show_tags && project.tags && Array.isArray(project.tags) && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {settings.show_category && project.category && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">
                      {project.category}
                    </span>
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
