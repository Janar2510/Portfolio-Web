'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/domain/builder/portfolio';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { generateSiteFromTemplate } from '@/domain/builder/generator';
import {
  useBlocksStore,
  useStylesStore,
  useEditorStore,
} from '@/stores/portfolio';
import { Loader2 } from 'lucide-react';
import {
  useAddBlock,
  useUpdateBlock,
  useReplacePageContent,
} from '@/hooks/portfolio/use-editor';
import { toast } from 'sonner';

export function TemplatesPanel() {
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);
  const { setBlocks } = useBlocksStore();
  const { setStyles } = useStylesStore();
  const { currentPage } = useEditorStore();
  const addBlockMutation = useAddBlock();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['portfolio-templates'],
    queryFn: async () => {
      // fetching with category 'portfolio' or 'business' to see our static ones
      return await portfolioService.getTemplates();
    },
  });

  const replacePageContentMutation = useReplacePageContent();

  const handleApplyTemplate = async (templateId: string) => {
    if (
      !confirm(
        'This will replace your current page content with the template. Continue?'
      )
    ) {
      return;
    }

    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        toast.error('Template not found');
        return;
      }

      // Apply styles
      if (template.styles_schema) {
        const currentStyles = useStylesStore.getState().styles;

        const newStyles = {
          ...(currentStyles || {}),
          colors: {
            ...currentStyles?.colors,
            ...template.styles_schema.color_palette,
          },
          typography: {
            ...currentStyles?.typography,
            ...template.styles_schema.typography,
          },
        };

        setStyles(newStyles as any);
        toast.success('Styles applied');
      }

      // Replace page content
      const blocks = template.pages_schema?.[0]?.blocks || [];
      await replacePageContentMutation.mutateAsync(
        blocks.map(b => ({
          block_type: b.block_type,
          content: b.content,
          settings: b.settings || {},
        }))
      );

      toast.success('Template applied successfully');
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast.error('Failed to apply template');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <h3 className="font-medium leading-none">Templates</h3>
        <p className="text-sm text-muted-foreground">
          Apply a template to your page.
        </p>
      </div>

      <div className="grid gap-4">
        {templates.map(template => (
          <Card
            key={template.id}
            className="cursor-pointer hover:ring-2 hover:ring-primary transition-all overflow-hidden group"
            onClick={() => handleApplyTemplate(template.id)}
          >
            <div
              className={`h-24 w-full bg-muted relative flex items-center justify-center overflow-hidden border-b`}
            >
              {/* Visual Preview Stub */}
              <div className="scale-65 h-full w-full opacity-80 group-hover:scale-75 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                {template.id === 'artisanal-vision' && (
                  <div className="w-full h-full bg-[#020202] p-2 flex flex-col gap-1 items-center justify-center text-center">
                    <div className="text-[#6366f1] text-[6px] font-bold uppercase tracking-widest opacity-80">
                      Digital Artist
                    </div>
                    <div className="text-white font-serif text-[10px] leading-tight max-w-[80%]">
                      Capturing the Unseen Realm
                    </div>
                    <div className="w-8 h-[1px] bg-[#6366f1]/50 my-1"></div>
                    <div className="grid grid-cols-3 gap-1 w-full px-2">
                      <div className="h-4 bg-white/5 rounded-sm"></div>
                      <div className="h-4 bg-white/5 rounded-sm"></div>
                      <div className="h-4 bg-white/5 rounded-sm"></div>
                    </div>
                  </div>
                )}
                {template.id === 'neon-noir' && (
                  <div className="w-full h-full bg-[#050505] p-2 flex flex-col gap-2 border border-[#00ffcc]/20">
                    <div className="text-[#00ffcc] font-mono text-[8px] flex items-center gap-1">
                      <div className="w-1 h-1 bg-[#00ffcc] animate-pulse"></div>
                      SYSTEM.ROOT
                    </div>
                    <div className="h-8 w-full bg-gradient-to-r from-[#00ffcc]/10 to-transparent border-l-2 border-[#00ffcc] flex items-center px-2">
                      <div className="h-1 w-12 bg-[#00ffcc]/40"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="h-4 bg-[#ff00ff]/5 rounded-sm border border-[#ff00ff]/10"></div>
                      <div className="h-4 bg-[#ff00ff]/5 rounded-sm border border-[#ff00ff]/10"></div>
                    </div>
                  </div>
                )}
                {template.id === 'bento-grid' && (
                  <div className="w-full h-full bg-[#050505] p-2 grid grid-cols-4 grid-rows-3 gap-1">
                    <div className="col-span-2 row-span-1 bg-[#68A9A5]/20 rounded-sm"></div>
                    <div className="col-span-1 row-span-1 bg-white/5 rounded-sm"></div>
                    <div className="col-span-1 row-span-2 bg-[#68A9A5]/40 rounded-sm"></div>
                    <div className="col-span-2 row-span-1 bg-white/5 rounded-sm"></div>
                    <div className="col-span-1 row-span-1 bg-[#68A9A5]/10 rounded-sm"></div>
                    <div className="col-span-2 row-span-1 bg-white/10 rounded-sm"></div>
                  </div>
                )}
                {!['espresso', 'ava', 'bernadette', 'emily', 'artisanal-vision', 'neon-noir', 'bento-grid'].includes(
                  template.id
                ) && (
                    <div className="w-full h-full bg-muted/50 p-2 flex flex-col items-center justify-center gap-2">
                      <div className="h-2 w-12 bg-primary/20 rounded"></div>
                      <div className="h-16 w-full bg-background border rounded-sm flex flex-col gap-1 p-1">
                        <div className="h-1 w-full bg-muted"></div>
                        <div className="h-1 w-3/4 bg-muted"></div>
                        <div className="flex-1"></div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">{template.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
