'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PortfolioBlock } from '@/lib/services/portfolio';
import {
  type BlockType,
  heroBlockContentSchema,
  heroBlockSettingsSchema,
  textBlockContentSchema,
  textBlockSettingsSchema,
  galleryBlockContentSchema,
  galleryBlockSettingsSchema,
  projectsBlockContentSchema,
  projectsBlockSettingsSchema,
  formBlockContentSchema,
  formBlockSettingsSchema,
  imageBlockContentSchema,
  imageBlockSettingsSchema,
  videoBlockContentSchema,
  videoBlockSettingsSchema,
} from '@/lib/blocks/schema';
import { z } from 'zod';

interface BlockEditingPanelProps {
  block: PortfolioBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string, content: Record<string, unknown>, settings: Record<string, unknown>) => void;
}

export function BlockEditingPanel({
  block,
  isOpen,
  onClose,
  onSave,
}: BlockEditingPanelProps) {
  if (!block) return null;

  const getSchema = () => {
    switch (block.block_type) {
      case 'hero':
        return {
          content: heroBlockContentSchema,
          settings: heroBlockSettingsSchema,
        };
      case 'text':
        return {
          content: textBlockContentSchema,
          settings: textBlockSettingsSchema,
        };
      case 'gallery':
        return {
          content: galleryBlockContentSchema,
          settings: galleryBlockSettingsSchema,
        };
      case 'projects':
        return {
          content: projectsBlockContentSchema,
          settings: projectsBlockSettingsSchema,
        };
      case 'form':
        return {
          content: formBlockContentSchema,
          settings: formBlockSettingsSchema,
        };
      case 'image':
        return {
          content: imageBlockContentSchema,
          settings: imageBlockSettingsSchema,
        };
      case 'video':
        return {
          content: videoBlockContentSchema,
          settings: videoBlockSettingsSchema,
        };
      default:
        return null;
    }
  };

  const schema = getSchema();
  if (!schema) return null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(z.object({ content: schema.content, settings: schema.settings })),
    defaultValues: {
      content: block.content,
      settings: block.settings,
    },
  });

  useEffect(() => {
    if (block) {
      reset({
        content: block.content,
        settings: block.settings,
      });
    }
  }, [block, reset]);

  const onSubmit = (data: { content: Record<string, unknown>; settings: Record<string, unknown> }) => {
    onSave(block.id, data.content, data.settings);
    onClose();
  };

  const renderContentFields = () => {
    switch (block.block_type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" {...register('content.headline')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subheadline">Subheadline</Label>
              <Input id="subheadline" {...register('content.subheadline')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta_text">CTA Text</Label>
              <Input id="cta_text" {...register('content.cta_text')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta_link">CTA Link</Label>
              <Input id="cta_link" {...register('content.cta_link')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Background Image URL</Label>
              <Input id="image_url" {...register('content.image_url')} />
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input id="title" {...register('content.title')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text">Text</Label>
              <Textarea id="text" rows={6} {...register('content.text')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="html">HTML (optional, overrides text)</Label>
              <Textarea id="html" rows={6} {...register('content.html')} />
            </div>
          </div>
        );
      case 'gallery':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gallery_title">Title (optional)</Label>
              <Input id="gallery_title" {...register('content.title')} />
            </div>
            <div className="space-y-2">
              <Label>Images</Label>
              <p className="text-sm text-muted-foreground">
                Image management will be implemented separately
              </p>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projects_title">Title (optional)</Label>
              <Input id="projects_title" {...register('content.title')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Limit</Label>
              <Input
                id="limit"
                type="number"
                {...register('content.limit', { valueAsNumber: true })}
              />
            </div>
          </div>
        );
      case 'form':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form_title">Title (optional)</Label>
              <Input id="form_title" {...register('content.title')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form_description">Description (optional)</Label>
              <Textarea id="form_description" {...register('content.description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="submit_text">Submit Button Text</Label>
              <Input id="submit_text" {...register('content.submit_text')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="success_message">Success Message</Label>
              <Textarea id="success_message" {...register('content.success_message')} />
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" {...register('content.image_url')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input id="alt" {...register('content.alt')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input id="caption" {...register('content.caption')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link_url">Link URL (optional)</Label>
              <Input id="link_url" {...register('content.link_url')} />
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL</Label>
              <Input id="video_url" {...register('content.video_url')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video_type">Video Type</Label>
              <Select
                value={watch('content.video_type') as string}
                onValueChange={(value) => setValue('content.video_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                  <SelectItem value="direct">Direct URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL (optional)</Label>
              <Input id="thumbnail_url" {...register('content.thumbnail_url')} />
            </div>
          </div>
        );
      default:
        return <div>Unknown block type</div>;
    }
  };

  const renderSettingsFields = () => {
    switch (block.block_type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alignment">Alignment</Label>
              <Select
                value={watch('settings.alignment') as string}
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
                value={watch('settings.background') as string}
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
                value={watch('settings.height') as string}
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
          </div>
        );
      case 'text':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max_width">Max Width</Label>
              <Input id="max_width" {...register('settings.max_width')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text_align">Text Align</Label>
              <Select
                value={watch('settings.text_align') as string}
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
          </div>
        );
      case 'gallery':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="layout">Layout</Label>
              <Select
                value={watch('settings.layout') as string}
                onValueChange={(value) => setValue('settings.layout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="masonry">Masonry</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="columns">Columns</Label>
              <Input
                id="columns"
                type="number"
                min="1"
                max="6"
                {...register('settings.columns', { valueAsNumber: true })}
              />
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projects_layout">Layout</Label>
              <Select
                value={watch('settings.layout') as string}
                onValueChange={(value) => setValue('settings.layout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="masonry">Masonry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projects_columns">Columns</Label>
              <Input
                id="projects_columns"
                type="number"
                min="1"
                max="4"
                {...register('settings.columns', { valueAsNumber: true })}
              />
            </div>
          </div>
        );
      case 'form':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form_layout">Layout</Label>
              <Select
                value={watch('settings.layout') as string}
                onValueChange={(value) => setValue('settings.layout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Column</SelectItem>
                  <SelectItem value="two-column">Two Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="button_style">Button Style</Label>
              <Select
                value={watch('settings.button_style') as string}
                onValueChange={(value) => setValue('settings.button_style', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image_alignment">Alignment</Label>
              <Select
                value={watch('settings.alignment') as string}
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
              <Label htmlFor="image_width">Width</Label>
              <Input id="image_width" {...register('settings.width')} />
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aspect_ratio">Aspect Ratio</Label>
              <Select
                value={watch('settings.aspect_ratio') as string}
                onValueChange={(value) => setValue('settings.aspect_ratio', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16/9">16:9</SelectItem>
                  <SelectItem value="4/3">4:3</SelectItem>
                  <SelectItem value="1/1">1:1</SelectItem>
                  <SelectItem value="21/9">21:9</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="video_width">Width</Label>
              <Input id="video_width" {...register('settings.width')} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Block</DialogTitle>
          <DialogDescription>
            Configure the content and settings for this block.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="space-y-4 mt-4">
              {renderContentFields()}
            </TabsContent>
            <TabsContent value="settings" className="space-y-4 mt-4">
              {renderSettingsFields()}
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
