'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService, PortfolioTemplate } from '@/domain/builder/portfolio';
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
import { Loader2, Check, Eye, Sparkles, Layout } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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

  const { data: templates = [], isLoading } = useQuery<PortfolioTemplate[]>({
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
  const categories = [
    'all',
    ...Array.from(new Set(templates.map(t => t.category || 'other'))),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#68A9A5]/10 border border-[#68A9A5]/20">
            <Sparkles className="h-6 w-6 text-[#68A9A5]" />
          </div>
          <h3 className="text-2xl font-bold font-display text-white">
            Choose Your Starting Point
          </h3>
        </div>
        <p className="text-white/40 text-lg max-w-2xl">
          Select a professionally crafted template. You can fully customize every detail later.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-10 flex-wrap h-auto p-1.5 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
          {categories.map(cat => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="capitalize px-6 py-2.5 rounded-xl transition-all data-[state=active]:bg-[#68A9A5] data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              {cat === 'all' ? 'All Templates' : cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => {
          const filteredTemplates = templates.filter(t =>
            category === 'all' ? true : (t.category || 'other') === category
          );

          return (
            <TabsContent key={category} value={category} className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={cn(
                          "group relative overflow-hidden transition-all duration-500 bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 rounded-[2.5rem]",
                          selectedTemplateId === template.id &&
                          "bg-white/10 border-[#68A9A5] ring-2 ring-[#68A9A5]/20 shadow-xl shadow-[#68A9A5]/10"
                        )}
                        onClick={() => setPreviewTemplate(template)}
                      >
                        {/* Image Container */}
                        <div className="aspect-[4/3] relative overflow-hidden rounded-t-[2.5rem] bg-zinc-900/50">
                          {template.thumbnail_url ? (
                            <Image
                              src={template.thumbnail_url}
                              alt={template.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                              <Layout className="h-12 w-12 text-white/10 mb-2" />
                              <span className="text-sm font-bold text-white/20 uppercase tracking-widest">
                                Preview Unavailable
                              </span>
                            </div>
                          )}

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[4px]">
                            <Button
                              type="button"
                              variant="secondary"
                              className="gap-2 bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-base font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                              onClick={e => {
                                e.stopPropagation();
                                setPreviewTemplate(template);
                              }}
                            >
                              <Eye className="h-5 w-5" />
                              Preview
                            </Button>
                          </div>

                          {/* Selection Status */}
                          {selectedTemplateId === template.id && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute top-6 right-6 bg-[#68A9A5] text-white rounded-full p-2.5 shadow-xl"
                            >
                              <Check className="h-5 w-5" />
                            </motion.div>
                          )}
                        </div>

                        <CardContent className="p-6 relative">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-xl font-bold font-display text-white">
                              {template.name}
                            </h4>
                            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                {template.category || 'Modern'}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-white/50 line-clamp-2 leading-relaxed h-10">
                            {template.description || 'A professional, high-converting portfolio layout designed for creatives.'}
                          </p>
                        </CardContent>

                        {/* Decorative accent */}
                        <div className={cn(
                          "absolute bottom-0 left-0 right-0 h-1 bg-[#68A9A5] transition-transform duration-500 origin-left scale-x-0 group-hover:scale-x-100",
                          selectedTemplateId === template.id && "scale-x-100"
                        )} />
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
