'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Tablet, Smartphone, X, Check, Loader2 } from 'lucide-react';
import type {
  PortfolioTemplate,
  PortfolioBlock,
} from '@/lib/services/portfolio';
import Image from 'next/image';
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
  const [iframeLoading, setIframeLoading] = useState(true);

  const deviceFrames = {
    desktop: { width: '100%', height: '100%', icon: Monitor, scale: 1 },
    tablet: { width: '768px', height: '100%', icon: Tablet, scale: 0.8 },
    mobile: { width: '375px', height: '100%', icon: Smartphone, scale: 0.8 },
  };

  const currentFrame = deviceFrames[deviceType];

  // Extract blocks from the template definition for the homepage
  const { blocks, styles } = useMemo(() => {
    // Check if it's a "real" PortfolioTemplate from DB or a Converted one
    // The converted one stores pages_schema as an array of page objects
    const pages = template.pages_schema as any as Array<{
      slug: string;
      is_homepage: boolean;
      blocks: any[];
    }>;

    const homepage = pages?.find(p => p.is_homepage) || pages?.[0];

    // Map raw block data to PortfolioBlock structure expected by renderer
    // We generate fake IDs since these aren't in DB yet
    const mappedBlocks: PortfolioBlock[] = (homepage?.blocks || []).map(
      (b, idx) => ({
        id: `preview-block-${idx}`,
        page_id: 'preview-page',
        block_type: b.block_type,
        anchor_id: b.anchor_id,
        content: b.content || {},
        settings: b.settings || {},
        sort_order: b.sort_order ?? idx,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_visible: true,
        styles: {},
      })
    );

    const mappedStyles = template.styles_schema as any;

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
                {template.is_premium && (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    PRO
                  </Badge>
                )}
              </DialogTitle>
            </div>
          </div>

          {/* Centered Action Button */}
          <div className="hidden md:flex justify-center">
            <Button
              type="button"
              onClick={onSelect}
              size="sm"
              className="gap-2 px-6 h-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Check className="h-3.5 w-3.5" />
              Choose This Template
            </Button>
          </div>

          <div className="flex items-center justify-end gap-3">
            {/* Device Switcher */}
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

        {/* Action Button for mobile (since header middle is hidden on small screens) */}
        <div className="md:hidden flex-shrink-0 p-3 border-b bg-background flex justify-center">
          <Button
            type="button"
            onClick={onSelect}
            size="sm"
            className="w-full gap-2 h-10 rounded-lg bg-primary font-bold text-sm"
          >
            <Check className="h-4 w-4" />
            Choose This Template
          </Button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-hidden bg-zinc-100 dark:bg-zinc-900 relative">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="bg-white shadow-2xl transition-all duration-300 ease-in-out overflow-hidden relative"
              style={{
                width: currentFrame.width,
                height: currentFrame.height,
                maxWidth: '100%',
                borderRadius:
                  deviceType === 'mobile'
                    ? '40px'
                    : deviceType === 'tablet'
                      ? '24px'
                      : '0px',
                border:
                  deviceType !== 'desktop' ? '12px solid #27272a' : 'none',
                // This transform creates a new containing block for position: fixed elements
                transform: 'translate3d(0, 0, 0)',
                perspective: '1000px',
              }}
            >
              {/* Live Renderer Frame */}
              <div
                id="preview-scroll-container"
                className="w-full h-full overflow-y-auto scrollbar-hide bg-white text-black scroll-smooth"
                style={{
                  backgroundColor:
                    styles?.color_palette?.background || '#ffffff',
                  color: styles?.color_palette?.text || '#000000',
                  fontFamily: styles?.typography?.bodyFont || 'inherit',
                }}
              >
                <FontLoader
                  headingFont={styles?.typography?.headingFont}
                  bodyFont={styles?.typography?.bodyFont}
                />

                {/* Inject Styles */}
                <style jsx global>{`
                  #preview-scroll-container {
                    --background: ${styles?.color_palette?.background ||
                    '#ffffff'};
                    --foreground: ${styles?.color_palette?.text || '#000000'};
                    --primary: ${styles?.color_palette?.primary || '#000000'};
                    --primary-foreground: #ffffff;
                    --secondary: ${styles?.color_palette?.secondary ||
                    '#666666'};
                    --secondary-foreground: #ffffff;
                    --muted: ${styles?.color_palette?.surface || '#f1f5f9'};
                    --muted-foreground: ${styles?.color_palette
                      ?.textSecondary || '#64748b'};
                    --border: ${styles?.color_palette?.border ||
                    'rgba(0,0,0,0.1)'};

                    --portfolio-primary: ${styles?.color_palette?.primary ||
                    '#000000'};
                    --portfolio-secondary: ${styles?.color_palette?.secondary ||
                    '#666666'};
                    --portfolio-background: ${styles?.color_palette
                      ?.background || '#ffffff'};
                    --portfolio-heading-font: ${styles?.typography
                      ?.headingFont || 'inherit'};
                    --portfolio-body-font: ${styles?.typography?.bodyFont ||
                    'inherit'};
                  }
                  #preview-scroll-container h1,
                  #preview-scroll-container h2,
                  #preview-scroll-container h3,
                  #preview-scroll-container h4,
                  #preview-scroll-container h5,
                  #preview-scroll-container h6 {
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
                        onUpdate={() => {}}
                        onDelete={() => {}}
                        siteId="preview"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No preview content available
                    </p>
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
