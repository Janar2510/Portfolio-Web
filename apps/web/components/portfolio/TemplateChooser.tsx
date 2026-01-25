'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import type { PortfolioTemplate } from '@/lib/services/portfolio';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Check, Eye, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { TemplatePreview } from './templates/TemplatePreview';

interface TemplateChooserProps {
  selectedTemplateId: string | null;
  onTemplateSelect: (templateId: string) => void;
}

export function TemplateChooser({
  selectedTemplateId,
  onTemplateSelect,
}: TemplateChooserProps) {
  const t = useTranslations('portfolio');
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);
  const [previewTemplate, setPreviewTemplate] =
    useState<PortfolioTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['portfolio-templates'],
    queryFn: async () => {
      return await portfolioService.getTemplates();
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading templates...</p>
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

  // Categories
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category || 'other')))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          Choose a Starting Point
        </h3>
        <p className="text-sm text-muted-foreground">
          Select a professionally designed template to jumpstart your portfolio.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto p-1 bg-muted/40">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="capitalize px-4 py-2">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => {
          const filteredTemplates = templates.filter(t =>
            category === 'all' ? true : (t.category || 'other') === category
          );

          return (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                  <Card
                    key={template.id}
                    className={`group relative overflow-hidden transition-all duration-300 border-2 hover:shadow-xl hover:translate-y-[-4px] ${selectedTemplateId === template.id
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-transparent hover:border-primary/20'
                      }`}
                    onClick={() => onTemplateSelect(template.id)}
                  >
                    {/* Image Container */}
                    <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg bg-muted">
                      {template.thumbnail_url ? (
                        <Image
                          src={template.thumbnail_url}
                          alt={template.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                          <span className="text-4xl font-bold opacity-20">
                            {template.name.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <Button
                          variant="secondary"
                          className="gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTemplate(template);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          Preview Template
                        </Button>
                      </div>

                      {/* Selection Badge */}
                      {selectedTemplateId === template.id && (
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-2 shadow-lg animate-in zoom-in-50">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 bg-card/50 backdrop-blur-sm">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-base font-bold">{template.name}</CardTitle>
                        {template.is_premium && (
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Pro
                          </span>
                        )}
                      </div>
                      <CardDescription className="text-xs line-clamp-2 mb-3">
                        {template.description}
                      </CardDescription>

                      {/* Tags */}
                      {/* We can infer tags from category or style keywords if available */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-muted px-2 py-1 rounded text-muted-foreground capitalize">
                          {template.category || 'Portfolio'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={() => {
            onTemplateSelect(previewTemplate.id);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
}
