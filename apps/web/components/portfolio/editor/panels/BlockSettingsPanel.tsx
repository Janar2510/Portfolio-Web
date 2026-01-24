/**
 * Block Settings Panel Component
 * Settings for selected block
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useUpdateBlock } from '@/hooks/portfolio/use-editor';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import { FileText, Settings, Layout, Eye } from 'lucide-react';

interface BlockSettingsPanelProps {
  block: PortfolioBlock;
}

export function BlockSettingsPanel({ block }: BlockSettingsPanelProps) {
  const updateBlockMutation = useUpdateBlock();
  const { register, handleSubmit, watch, setValue } = useForm<any>({
    defaultValues: {
      content: block.content,
      settings: block.settings,
      layout: block.layout,
      styles: block.styles,
      is_visible: block.is_visible,
      visible_on: block.visible_on,
    },
  });

  const onSubmit = (data: any) => {
    updateBlockMutation.mutate({
      blockId: block.id,
      updates: data,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
      <Tabs defaultValue="content" className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
          <TabsTrigger value="content" className="flex items-center gap-2 text-xs">
            <FileText className="h-3 w-3" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 text-xs">
            <Settings className="h-3 w-3" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2 text-xs">
            <Layout className="h-3 w-3" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="visibility" className="flex items-center gap-2 text-xs">
            <Eye className="h-3 w-3" />
            Visibility
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto p-4">
          <TabsContent value="content" className="mt-0 space-y-4">
            {/* Dynamic content fields based on block type */}
            {block.block_type === 'hero' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    {...register('content.headline')}
                    placeholder="Your headline here"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subheadline">Subheadline</Label>
                  <Input
                    id="subheadline"
                    {...register('content.subheadline')}
                    placeholder="Your subheadline here"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta_text">CTA Text</Label>
                  <Input
                    id="cta_text"
                    {...register('content.cta_text')}
                    placeholder="Get Started"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta_link">CTA Link</Label>
                  <Input
                    id="cta_link"
                    {...register('content.cta_link')}
                    placeholder="/contact"
                  />
                </div>
              </>
            )}

            {block.block_type === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="text">Text Content</Label>
                <Textarea
                  id="text"
                  {...register('content.text')}
                  placeholder="Enter your text here"
                  rows={6}
                />
              </div>
            )}

            {block.block_type === 'image' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    {...register('content.image_url')}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alt_text">Alt Text</Label>
                  <Input
                    id="alt_text"
                    {...register('content.alt_text')}
                    placeholder="Image description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Input
                    id="caption"
                    {...register('content.caption')}
                    placeholder="Optional caption"
                  />
                </div>
              </>
            )}

            {/* Generic content editor for other block types */}
            {!['hero', 'text', 'image'].includes(block.block_type) && (
              <div className="text-sm text-muted-foreground">
                Content editing for {block.block_type} blocks coming soon...
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-0 space-y-4">
            {/* Block-specific settings */}
            {block.block_type === 'hero' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="alignment">Alignment</Label>
                  <Select
                    value={(watch('settings.alignment') as string) || 'center'}
                    onValueChange={(value) => setValue('settings.alignment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background">Background</Label>
                  <Select
                    value={(watch('settings.background') as string) || 'solid'}
                    onValueChange={(value) => setValue('settings.background', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Select
                    value={(watch('settings.height') as string) || 'medium'}
                    onValueChange={(value) => setValue('settings.height', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {block.block_type === 'text' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="max_width">Max Width</Label>
                  <Input
                    id="max_width"
                    {...register('settings.max_width')}
                    placeholder="800px"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text_align">Text Align</Label>
                  <Select
                    value={(watch('settings.text_align') as string) || 'left'}
                    onValueChange={(value) => setValue('settings.text_align', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {!['hero', 'text'].includes(block.block_type) && (
              <div className="text-sm text-muted-foreground">
                Settings for {block.block_type} blocks coming soon...
              </div>
            )}
          </TabsContent>

          <TabsContent value="layout" className="mt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="layout-width">Width</Label>
              <Select
                value={(watch('layout.width') as string) || 'container'}
                onValueChange={(value) => setValue('layout.width', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="container">Container</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                  <SelectItem value="narrow">Narrow</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="layout-padding">Padding</Label>
              <Select
                value={(watch('layout.padding') as string) || 'default'}
                onValueChange={(value) => setValue('layout.padding', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="layout-alignment">Alignment</Label>
              <Select
                value={(watch('layout.alignment') as string) || 'left'}
                onValueChange={(value) => setValue('layout.alignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="visibility" className="mt-0 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_visible" className="text-xs cursor-pointer">
                  Block Visible
                </Label>
                <Checkbox
                  id="is_visible"
                  checked={watch('is_visible') ?? true}
                  onCheckedChange={(checked) => setValue('is_visible', checked === true)}
                />
              </div>
              <div className="space-y-2 pl-4 border-l-2">
                <Label className="text-xs">Visible On</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="visible_desktop" className="text-xs cursor-pointer">
                      Desktop
                    </Label>
                    <Checkbox
                      id="visible_desktop"
                      checked={watch('visible_on.desktop') ?? true}
                      onCheckedChange={(checked) =>
                        setValue('visible_on.desktop', checked === true)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="visible_tablet" className="text-xs cursor-pointer">
                      Tablet
                    </Label>
                    <Checkbox
                      id="visible_tablet"
                      checked={watch('visible_on.tablet') ?? true}
                      onCheckedChange={(checked) =>
                        setValue('visible_on.tablet', checked === true)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="visible_mobile" className="text-xs cursor-pointer">
                      Mobile
                    </Label>
                    <Checkbox
                      id="visible_mobile"
                      checked={watch('visible_on.mobile') ?? true}
                      onCheckedChange={(checked) =>
                        setValue('visible_on.mobile', checked === true)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>

        <div className="border-t p-4">
          <Button type="submit" className="w-full" disabled={updateBlockMutation.isPending}>
            {updateBlockMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Tabs>
    </form>
  );
}
