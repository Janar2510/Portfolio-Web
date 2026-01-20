'use client';

import { BaseBlock } from './BaseBlock';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import type { ProjectsBlockContent, ProjectsBlockSettings } from '@/lib/blocks/schema';

interface ProjectsBlockProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
  onDelete?: () => void;
  onAddAfter?: (blockType: string) => void;
  onEdit?: (block: PortfolioBlock) => void;
}

export function ProjectsBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: ProjectsBlockProps) {
  const content = block.content as ProjectsBlockContent;
  const settings = block.settings as ProjectsBlockSettings;

  // TODO: Fetch actual projects from database
  const projects: Array<{
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    tags?: string[];
  }> = [];

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

        {projects.length === 0 && isEditing ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted">
            <p className="text-sm text-muted-foreground">
              No projects found. Projects will appear here when you create them.
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
            {projects.slice(0, content.limit || 6).map((project) => (
              <div
                key={project.id}
                className="group rounded-lg border bg-card p-4 transition-shadow hover:shadow-lg"
              >
                {project.image_url && (
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <h3 className="mb-2 text-xl font-semibold">{project.title}</h3>
                {settings.show_description && project.description && (
                  <p className="mb-3 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                )}
                {settings.show_tags && project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
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
