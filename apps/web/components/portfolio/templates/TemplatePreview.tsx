/**
 * Template Preview Modal
 * Full-screen template preview with device frames
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Tablet, Smartphone, X, Check } from 'lucide-react';
import type { PortfolioTemplate } from '@/lib/portfolio/types';
import Image from 'next/image';

interface TemplatePreviewProps {
  template: PortfolioTemplate;
  onClose: () => void;
  onSelect: () => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export function TemplatePreview({ template, onClose, onSelect }: TemplatePreviewProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  const deviceFrames = {
    desktop: { width: '100%', height: '600px', icon: Monitor },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    mobile: { width: '375px', height: '667px', icon: Smartphone },
  };

  const currentFrame = deviceFrames[deviceType];
  const DeviceIcon = currentFrame.icon;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              {template.description && (
                <DialogDescription className="mt-1">
                  {template.description}
                </DialogDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {template.is_featured && (
                <Badge variant="default" className="bg-amber-500">
                  Featured
                </Badge>
              )}
              {template.is_premium && <Badge variant="secondary">Premium</Badge>}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          {/* Device Switcher */}
          <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/50">
            <div className="flex items-center gap-2">
              {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map((device) => {
                const Icon = deviceFrames[device].icon;
                return (
                  <Button
                    key={device}
                    variant={deviceType === device ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDeviceType(device)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {device.charAt(0).toUpperCase() + device.slice(1)}
                  </Button>
                );
              })}
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview Frame */}
          <div className="flex-1 overflow-auto p-6 bg-muted/30">
            <div className="flex justify-center">
              <div
                className="relative bg-white rounded-lg shadow-2xl overflow-hidden border-8 border-gray-800"
                style={{
                  width: currentFrame.width,
                  height: currentFrame.height,
                  maxWidth: '100%',
                }}
              >
                {template.preview_images && template.preview_images.length > 0 ? (
                  <Image
                    src={template.preview_images[0]}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                ) : template.thumbnail_url ? (
                  <Image
                    src={template.thumbnail_url}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <p className="text-muted-foreground">Preview not available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info & Actions */}
          <div className="px-6 py-4 border-t bg-background">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Pages included:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {template.pages_schema && Array.isArray(template.pages_schema) ? (
                      template.pages_schema.slice(0, 4).map((page: any, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-3 w-3" />
                          {page.title || page.slug}
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No pages defined</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.features && template.features.length > 0 ? (
                      template.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No features listed</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={onSelect} size="lg" className="min-w-[200px]">
                  Use This Template
                </Button>
                {template.demo_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={template.demo_url} target="_blank" rel="noopener noreferrer">
                      View Live Demo →
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
