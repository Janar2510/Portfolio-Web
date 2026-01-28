/**
 * Template Gallery Component
 * Browse and filter portfolio templates
 */

'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService, PortfolioTemplate } from '@/domain/builder/portfolio';
import type {
  TemplateCategory,
} from '@/lib/portfolio/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Star, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TemplateCard } from './TemplateCard';
import { TemplatePreview } from './TemplatePreview';

interface TemplateGalleryProps {
  onTemplateSelect?: (templateId: string) => void;
  showFeatured?: boolean;
}

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'minimal',
  'creative',
  'professional',
  'developer',
  'photographer',
  'designer',
  'agency',
  'freelancer',
];

export function TemplateGallery({
  onTemplateSelect,
  showFeatured = false,
}: TemplateGalleryProps) {
  const t = useTranslations('portfolio');
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | 'all'
  >('all');
  const [previewTemplate, setPreviewTemplate] =
    useState<PortfolioTemplate | null>(null);

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['portfolio-templates', selectedCategory, showFeatured],
    queryFn: async () => {
      if (showFeatured) {
        const { data, error } = await supabase
          .from('portfolio_templates')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
      }

      if (selectedCategory === 'all') {
        return await portfolioService.getTemplates();
      }

      return await portfolioService.getTemplates(selectedCategory);
    },
  });

  // Filter templates by search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;

    const query = searchQuery.toLowerCase();
    return templates.filter(
      template =>
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query) ||
        template.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    );
  }, [templates, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Choose a Template</h2>
            <p className="text-muted-foreground mt-1">
              Select a template to get started or start from scratch
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        {!showFeatured && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {TEMPLATE_CATEGORIES.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        )}

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No templates found</p>
            {searchQuery && (
              <p className="text-sm mt-2">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => setPreviewTemplate(template)}
                onSelect={() => {
                  if (onTemplateSelect) {
                    onTemplateSelect(template.id);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Start from Scratch Option */}
        {!showFeatured && (
          <div className="pt-6 border-t">
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Start from Scratch</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Build your portfolio from a blank canvas
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => onTemplateSelect?.('')}
                  >
                    Start Building
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={() => {
            if (onTemplateSelect) {
              onTemplateSelect(previewTemplate.id);
            }
            setPreviewTemplate(null);
          }}
        />
      )}
    </>
  );
}
