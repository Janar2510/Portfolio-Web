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
                {template.id === 'espresso' && (
                  <div className="w-full h-full bg-[#2B211E] p-2 flex flex-col gap-2">
                    <div className="text-[#EFEBE9] font-serif text-[8px]">
                      The Espresso Stroll
                    </div>
                    <div className="h-12 w-full bg-[#3E2723] rounded-sm"></div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="h-6 bg-[#4E342E] rounded-sm"></div>
                      <div className="h-6 bg-[#4E342E] rounded-sm"></div>
                    </div>
                  </div>
                )}
                {template.id === 'ava' && (
                  <div className="w-full h-full bg-[#FFF8F5] p-2 flex flex-col justify-center text-center">
                    <div className="text-[#1F2937] font-bold text-[10px] leading-tight mb-2">
                      Creative copywriter
                    </div>
                    <div className="h-1 w-8 bg-[#FF8A65] mx-auto mb-2"></div>
                    <div className="text-[6px] text-gray-400">Introduction</div>
                  </div>
                )}
                {template.id === 'bernadette' && (
                  <div className="w-full h-full bg-[#F5F5F4] p-2 flex flex-row items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-[#D7CCC8] flex-shrink-0"></div>
                    <div className="space-y-1">
                      <div className="h-2 w-16 bg-[#8D6E63] rounded-full"></div>
                      <div className="h-1 w-12 bg-[#D6D3D1] rounded-full"></div>
                    </div>
                  </div>
                )}
                {template.id === 'emily' && (
                  <div className="w-full h-full bg-[#FAFAFA] p-2 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="h-1 w-8 bg-black"></div>
                      <div className="h-1 w-4 bg-gray-300"></div>
                    </div>
                    <div className="mt-2 text-[8px] font-serif leading-tight">
                      Creative copywriter helping your business stand out
                    </div>
                    <div className="h-16 w-full bg-gray-200 mt-1"></div>
                  </div>
                )}
                {!['espresso', 'ava', 'bernadette', 'emily'].includes(
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
