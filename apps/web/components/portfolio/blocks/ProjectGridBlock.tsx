/**
 * Project Grid Block Component
 * Displays a grid of portfolio projects
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { BaseBlock } from './BaseBlock';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import { useEditorStore } from '@/stores/portfolio';

interface ProjectGridBlockProps {
  block: PortfolioBlock;
  isEditing?: boolean;
  onUpdate?: (content: Record<string, unknown>, settings?: Record<string, unknown>) => void;
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
  };

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['portfolio-projects', currentPage?.site_id, content.category, content.tags],
    queryFn: async () => {
      if (!currentPage?.site_id) return [];
      const allProjects = await portfolioService.getProjects(currentPage.site_id);
      
      // Filter by category if specified
      let filtered = allProjects;
      if (content.category) {
        filtered = filtered.filter((p: any) => p.category === content.category);
      }
      
      // Filter by tags if specified
      if (content.tags && content.tags.length > 0) {
        filtered = filtered.filter((p: any) => 
          content.tags?.some((tag) => p.tags?.includes(tag))
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

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const columns = settings.columns || 3;
  const layout = settings.layout || 'grid';

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
          <h2 className="text-3xl font-bold mb-8 text-center">{content.title}</h2>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isEditing ? 'No projects found. Add projects in the Projects section.' : 'No projects to display.'}
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-6',
              layout === 'grid' && gridCols[columns as keyof typeof gridCols],
              layout === 'masonry' && 'columns-1 md:columns-2 lg:columns-3',
              layout === 'list' && 'flex flex-col gap-4'
            )}
          >
            {projects.map((project: any) => (
              <Card
                key={project.id}
                className={cn(
                  'overflow-hidden transition-all hover:shadow-lg',
                  layout === 'masonry' && 'break-inside-avoid mb-6',
                  layout === 'list' && 'flex flex-row'
                )}
              >
                {project.thumbnail_url && (
                  <div
                    className={cn(
                      'relative overflow-hidden',
                      layout === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-video'
                    )}
                  >
                    <Image
                      src={project.thumbnail_url}
                      alt={project.title || 'Project'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    {settings.show_category && project.category && (
                      <Badge variant="secondary">{project.category}</Badge>
                    )}
                  </div>
                  {settings.show_excerpt && project.excerpt && (
                    <CardDescription className="mt-2">{project.excerpt}</CardDescription>
                  )}
                  {settings.show_tags && project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                {project.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {project.description}
                    </p>
                    <Button asChild variant="link" className="mt-4 p-0">
                      <Link href={`/projects/${project.slug}`}>View Project →</Link>
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </BaseBlock>
  );
}
