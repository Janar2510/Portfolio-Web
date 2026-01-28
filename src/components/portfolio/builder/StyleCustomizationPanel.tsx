'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Palette, Type, Layout } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PortfolioStyle } from '@/domain/builder/portfolio';

interface StyleCustomizationPanelProps {
  style: PortfolioStyle | null;
  onSave: (style: Partial<PortfolioStyle>) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function StyleCustomizationPanel({
  style,
  onSave,
  isOpen,
  onClose,
}: StyleCustomizationPanelProps) {
  const { register, handleSubmit, watch, setValue, reset } =
    useForm<PortfolioStyle>({
      defaultValues: style || undefined,
    });

  useEffect(() => {
    if (style) {
      reset(style);
    }
  }, [style, reset]);

  const onSubmit = async (data: PortfolioStyle) => {
    await onSave(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="flex h-full flex-col border-l bg-background">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Style Customization</h2>
        <p className="text-sm text-muted-foreground">
          Customize the design of your portfolio site
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <Tabs
          defaultValue="colors"
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList className="mx-4 mt-4 grid w-auto grid-cols-3">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="spacing" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Spacing
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="colors" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primary">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary"
                      type="color"
                      {...register('color_palette.primary')}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      placeholder="#000000"
                      {...register('color_palette.primary')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary"
                      type="color"
                      {...register('color_palette.secondary')}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      placeholder="#666666"
                      {...register('color_palette.secondary')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent"
                      type="color"
                      {...register('color_palette.accent')}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      placeholder="#0066ff"
                      {...register('color_palette.accent')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background"
                      type="color"
                      {...register('color_palette.background')}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      placeholder="#ffffff"
                      {...register('color_palette.background')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text"
                      type="color"
                      {...register('color_palette.text')}
                      className="h-10 w-20"
                    />
                    <Input
                      type="text"
                      placeholder="#000000"
                      {...register('color_palette.text')}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headingFont">Heading Font</Label>
                  <Select
                    value={watch('typography.headingFont') || 'Inter'}
                    onValueChange={value =>
                      setValue('typography.headingFont', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Playfair Display">
                        Playfair Display
                      </SelectItem>
                      <SelectItem value="JetBrains Mono">
                        JetBrains Mono
                      </SelectItem>
                      <SelectItem value="Lora">Lora</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFont">Body Font</Label>
                  <Select
                    value={watch('typography.bodyFont') || 'Inter'}
                    onValueChange={value =>
                      setValue('typography.bodyFont', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Playfair Display">
                        Playfair Display
                      </SelectItem>
                      <SelectItem value="JetBrains Mono">
                        JetBrains Mono
                      </SelectItem>
                      <SelectItem value="Lora">Lora</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scale">Font Scale</Label>
                  <Select
                    value={watch('typography.scale') || '1.25'}
                    onValueChange={value => setValue('typography.scale', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.125">Small (1.125)</SelectItem>
                      <SelectItem value="1.25">Default (1.25)</SelectItem>
                      <SelectItem value="1.3">Medium (1.3)</SelectItem>
                      <SelectItem value="1.4">Large (1.4)</SelectItem>
                      <SelectItem value="1.5">Extra Large (1.5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spacing_scale">Spacing Scale</Label>
                  <Select
                    value={watch('spacing_scale') || 'default'}
                    onValueChange={value => setValue('spacing_scale', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom_css">Custom CSS (Pro)</Label>
                  <Textarea
                    id="custom_css"
                    rows={10}
                    placeholder="/* Add your custom CSS here */"
                    {...register('custom_css')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Advanced customization for pro users
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="border-t p-4">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Styles</Button>
            </div>
          </div>
        </Tabs>
      </form>
    </div>
  );
}
