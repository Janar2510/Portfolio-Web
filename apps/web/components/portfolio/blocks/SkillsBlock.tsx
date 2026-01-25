/**
 * Skills Block Component
 * Displays skills in a visual format
 */

'use client';

import { BaseBlock } from './BaseBlock';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PortfolioBlock } from '@/lib/services/portfolio';

interface SkillsBlockProps {
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

export function SkillsBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onAddAfter,
  onEdit,
}: SkillsBlockProps) {
  const content = block.content as {
    title?: string;
    skills?: Array<{
      id: string;
      name: string;
      level: number; // 0-100
      category?: string;
      icon?: string;
    }>;
  };

  const settings = block.settings as {
    layout?: 'bars' | 'badges' | 'grid' | 'circular';
    show_level?: boolean;
    show_category?: boolean;
    columns?: number;
  };

  const skills = content.skills || [];
  const layout = settings.layout || 'bars';
  const columns = settings.columns || 3;

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
          <h2 className="text-3xl font-bold mb-8 text-center">
            {content.title}
          </h2>
        )}

        {skills.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {isEditing
              ? 'Add skills in the block settings.'
              : 'No skills to display.'}
          </div>
        ) : (
          <div
            className={cn(
              'space-y-6',
              layout === 'grid' &&
                `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`
            )}
          >
            {layout === 'bars' &&
              skills.map((skill, index) => (
                <div
                  key={`${skill.id || 'skill'}-${index}`}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {skill.icon && (
                        <span className="text-xl">{skill.icon}</span>
                      )}
                      <span className="font-medium">{skill.name}</span>
                      {settings.show_category && skill.category && (
                        <Badge variant="outline" className="text-xs">
                          {skill.category}
                        </Badge>
                      )}
                    </div>
                    {settings.show_level && (
                      <span className="text-sm text-muted-foreground">
                        {skill.level}%
                      </span>
                    )}
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              ))}

            {layout === 'badges' && (
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <Badge
                    key={`${skill.id || 'skill'}-${index}`}
                    variant="secondary"
                    className="text-base px-4 py-2"
                  >
                    {skill.icon && <span className="mr-2">{skill.icon}</span>}
                    {skill.name}
                    {settings.show_level && (
                      <span className="ml-2 text-xs opacity-70">
                        {skill.level}%
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            )}

            {layout === 'grid' &&
              skills.map((skill, index) => (
                <div
                  key={`${skill.id || 'skill'}-${index}`}
                  className="p-6 border rounded-lg text-center space-y-2"
                >
                  {skill.icon && (
                    <div className="text-4xl mb-2">{skill.icon}</div>
                  )}
                  <div className="font-semibold">{skill.name}</div>
                  {settings.show_level && (
                    <div className="text-sm text-muted-foreground">
                      {skill.level}%
                    </div>
                  )}
                  {settings.show_category && skill.category && (
                    <Badge variant="outline" className="text-xs">
                      {skill.category}
                    </Badge>
                  )}
                </div>
              ))}

            {layout === 'circular' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {skills.map((skill, index) => (
                  <div
                    key={`${skill.id || 'skill'}-${index}`}
                    className="flex flex-col items-center space-y-2"
                  >
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(skill.level / 100) * 251.2} 251.2`}
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">
                          {skill.level}%
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{skill.name}</div>
                      {settings.show_category && skill.category && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {skill.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </BaseBlock>
  );
}
