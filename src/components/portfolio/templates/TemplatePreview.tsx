'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Tablet, Smartphone, X, Check } from 'lucide-react';
import { PortfolioTemplate, PortfolioBlock } from '@/domain/builder/portfolio';
import { BlockRenderer } from '../editor/BlockRenderer';
import { FontLoader } from '../public/FontLoader';

interface TemplatePreviewProps {
  template: PortfolioTemplate;
  onClose: () => void;
  onSelect: () => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export function TemplatePreview({
  template,
  onClose,
  onSelect,
}: TemplatePreviewProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  const deviceFrames = {
    desktop: { width: '100%', height: '100%', icon: Monitor, scale: 1 },
    tablet: { width: '768px', height: '100%', icon: Tablet, scale: 0.8 },
    mobile: { width: '375px', height: '100%', icon: Smartphone, scale: 0.8 },
  };

  const currentFrame = deviceFrames[deviceType];

  // Extract blocks from the template for the preview
  const { blocks, styles } = useMemo(() => {
    // Portfolios use the blocks from the first page in the schema
    const blocks = template.pages_schema?.[0]?.blocks || [];

    // Mapped blocks with necessary IDs for the renderer
    const mappedBlocks: PortfolioBlock[] = blocks.map((b, idx) => ({
      ...b,
      id: `preview-block-${idx}`,
      page_id: 'preview-page',
      anchor_id: b.block_type + '-' + idx,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_visible: true,
      styles: {},
      sort_order: idx,
    })) as PortfolioBlock[];

    // Map template styles schema to renderer's expected format
    const mappedStyles = {
      color_palette: {
        background: template.styles_schema?.color_palette?.background || '#ffffff',
        text: template.styles_schema?.color_palette?.text || '#000000',
        primary: template.styles_schema?.color_palette?.primary || '#3b82f6',
        secondary: template.styles_schema?.color_palette?.secondary || '#64748b',
        surface: template.styles_schema?.color_palette?.surface || '#f8fafc',
        textSecondary: template.styles_schema?.color_palette?.textSecondary || '#64748b',
        border: template.styles_schema?.color_palette?.border || 'rgba(0,0,0,0.1)'
      },
      typography: {
        headingFont: template.styles_schema?.typography?.headingFont || 'Inter',
        bodyFont: template.styles_schema?.typography?.bodyFont || 'Inter'
      }
    };

    return { blocks: mappedBlocks, styles: mappedStyles };
  }, [template]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0 grid grid-cols-2 md:grid-cols-3 items-center space-y-0">
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle className="text-lg font-extrabold flex items-center gap-2 tracking-tight">
                {template.name}
              </DialogTitle>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <Button
              type="button"
              onClick={onSelect}
              size="sm"
              className="gap-2 px-6 h-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-lg transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              Choose This Template
            </Button>
          </div>

          <div className="flex items-center justify-end gap-3">
            <div className="hidden sm:flex items-center bg-muted/30 rounded-full p-1 border border-border/50">
              {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map(device => {
                const Icon = deviceFrames[device].icon;
                return (
                  <Button
                    key={device}
                    type="button"
                    variant={deviceType === device ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 w-9 p-0 rounded-full"
                    onClick={() => setDeviceType(device)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </Button>
                );
              })}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden bg-zinc-100 dark:bg-zinc-900 relative">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="bg-white shadow-2xl transition-all duration-300 ease-in-out overflow-hidden relative"
              style={{
                width: currentFrame.width,
                height: currentFrame.height,
                maxWidth: '100%',
                borderRadius: deviceType === 'mobile' ? '40px' : deviceType === 'tablet' ? '24px' : '0px',
                border: deviceType !== 'desktop' ? '12px solid #27272a' : 'none',
                transform: 'translate3d(0, 0, 0)',
                perspective: '1000px',
              }}
            >
              <div
                id="preview-scroll-container"
                className="w-full h-full overflow-y-auto scrollbar-hide bg-white text-black scroll-smooth"
                style={{
                  backgroundColor: styles?.color_palette?.background || '#ffffff',
                  color: styles?.color_palette?.text || '#000000',
                  fontFamily: styles?.typography?.bodyFont || 'inherit',
                }}
              >
                <FontLoader
                  headingFont={styles?.typography?.headingFont}
                  bodyFont={styles?.typography?.bodyFont}
                />

                <style jsx global>{`
                  #preview-scroll-container {
                    --background: ${styles?.color_palette?.background || '#ffffff'};
                    --foreground: ${styles?.color_palette?.text || '#000000'};
                    --primary: ${styles?.color_palette?.primary || '#000000'};
                    --secondary: ${styles?.color_palette?.secondary || '#666666'};
                    --muted: ${styles?.color_palette?.surface || '#f1f5f9'};
                    --muted-foreground: ${styles?.color_palette?.textSecondary || '#64748b'};
                    --border: ${styles?.color_palette?.border || 'rgba(0,0,0,0.1)'};
                    --portfolio-primary: ${styles?.color_palette?.primary || '#000000'};
                    --portfolio-heading-font: ${styles?.typography?.headingFont || 'inherit'};
                    --portfolio-body-font: ${styles?.typography?.bodyFont || 'inherit'};
                  }
                  #preview-scroll-container h1, h2, h3, h4, h5, h6 {
                    font-family: var(--portfolio-heading-font);
                  }
                `}</style>

                {blocks.length > 0 ? (
                  <div className="min-h-full">
                    {blocks.map(block => (
                      <BlockRenderer
                        key={block.id}
                        block={block}
                        isEditing={false}
                        onUpdate={() => { }}
                        onDelete={() => { }}
                        siteId="preview"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No preview content available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
