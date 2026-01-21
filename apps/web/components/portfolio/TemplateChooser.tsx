'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import type { PortfolioTemplate } from '@/lib/services/portfolio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TemplateChooserProps {
  selectedTemplateId: string | null;
  onTemplateSelect: (templateId: string) => void;
}

export function TemplateChooser({ selectedTemplateId, onTemplateSelect }: TemplateChooserProps) {
  const t = useTranslations('portfolio');
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['portfolio-templates'],
    queryFn: async () => {
      return await portfolioService.getTemplates();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No templates available</p>
      </div>
    );
  }

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
    const category = template.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, PortfolioTemplate[]>);

  return (
    <div className="space-y-6">
      {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground capitalize">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplateId === template.id
                    ? 'ring-2 ring-primary-500 border-primary-500'
                    : ''
                }`}
                onClick={() => onTemplateSelect(template.id)}
              >
                <CardHeader className="p-0">
                  {template.thumbnail_url ? (
                    <div className="relative w-full h-48 bg-muted rounded-t-lg overflow-hidden">
                      <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedTemplateId === template.id && (
                        <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-t-lg flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary-600 dark:text-primary-300">
                            {template.name.charAt(0).toUpperCase()}
                          </span>
                      {selectedTemplateId === template.id && (
                        <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-base mb-1">{template.name}</CardTitle>
                  {template.description && (
                    <CardDescription className="text-sm line-clamp-2">
                      {template.description}
                    </CardDescription>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
