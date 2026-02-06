/**
 * Block Settings Panel Component
 * Settings for selected block
 */

'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUpdateBlock } from '@/hooks/portfolio/use-editor';
import type { PortfolioBlock } from '@/domain/builder/portfolio';
import { FileText, Settings, Layout, Eye, Plus, Trash2 } from 'lucide-react';

interface BlockSettingsPanelProps {
  block: PortfolioBlock;
}

export function BlockSettingsPanel({ block }: BlockSettingsPanelProps) {
  const updateBlockMutation = useUpdateBlock();
  const { register, handleSubmit, watch, setValue, control } = useForm<any>({
    defaultValues: {
      content: block.content,
      settings: block.settings,
      layout: block.layout,
      styles: block.styles,
      is_visible: block.is_visible,
      visible_on: block.visible_on,
    },
  });

  // Hooks for list editing
  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: 'content.features',
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: 'content.skills',
  });

  const {
    fields: statFields,
    append: appendStat,
    remove: removeStat,
  } = useFieldArray({
    control,
    name: 'content.stats',
  });

  const onSubmit = (data: any) => {
    updateBlockMutation.mutate({
      blockId: block.id,
      updates: data,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
      <Tabs
        defaultValue="content"
        className="flex flex-col flex-1 overflow-hidden"
      >
        <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
          <TabsTrigger
            value="content"
            className="flex items-center gap-2 text-xs"
          >
            <FileText className="h-3 w-3" />
            Content
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-2 text-xs"
          >
            <Settings className="h-3 w-3" />
            Settings
          </TabsTrigger>
          <TabsTrigger
            value="layout"
            className="flex items-center gap-2 text-xs"
          >
            <Layout className="h-3 w-3" />
            Layout
          </TabsTrigger>
          <TabsTrigger
            value="visibility"
            className="flex items-center gap-2 text-xs"
          >
            <Eye className="h-3 w-3" />
            Visibility
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto p-4">
          <TabsContent value="content" className="mt-0 space-y-4">
            {/* Dynamic content fields based on block type */}
            {(
              ['hero', 'organic-hero', 'infinite-hero', 'brand-hero'] as any
            ).includes(block.block_type) && (
                <>
                  {(block.block_type === 'organic-hero' ||
                    block.block_type === 'hero') && (
                      <div className="space-y-2">
                        <Label htmlFor="slogan">Slogan / Badge</Label>
                        <Input
                          id="slogan"
                          {...register(
                            block.block_type === 'hero'
                              ? 'content.badge'
                              : 'content.slogan'
                          )}
                          placeholder="NATURE IN HARMONY"
                        />
                      </div>
                    )}
                  {block.block_type === 'brand-hero' && (
                    <div className="space-y-2">
                      <Label htmlFor="logoText">Logo Text</Label>
                      <Input
                        id="logoText"
                        {...register('content.logoText')}
                        placeholder="Midnight"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      {...register(
                        block.block_type === 'brand-hero'
                          ? 'content.title'
                          : 'content.headline'
                      )}
                      placeholder="Your headline here"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subheadline">Subheadline</Label>
                    {block.block_type === 'infinite-hero' ? (
                      <Textarea
                        id="subheadline"
                        {...register('content.subheadline')}
                        placeholder="Your subheadline here"
                        rows={3}
                      />
                    ) : (
                      <Input
                        id="subheadline"
                        {...register(
                          block.block_type === 'brand-hero'
                            ? 'content.subtitle'
                            : 'content.subheadline'
                        )}
                        placeholder="Your subheadline here"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta_text">CTA Text</Label>
                    <Input
                      id="cta_text"
                      {...register(
                        block.block_type === 'brand-hero'
                          ? 'content.ctaText'
                          : 'content.cta_text'
                      )}
                      placeholder="Get Started"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta_link">CTA Link</Label>
                    <Input
                      id="cta_link"
                      {...register(
                        block.block_type === 'brand-hero'
                          ? 'content.ctaLink'
                          : 'content.cta_link'
                      )}
                      placeholder="/contact"
                    />
                  </div>
                  {block.block_type === 'brand-hero' && (
                    <div className="space-y-2">
                      <Label htmlFor="versionText">Version Text</Label>
                      <Input
                        id="versionText"
                        {...register('content.versionText')}
                        placeholder="v1.0.4 - 2024"
                      />
                    </div>
                  )}
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

            {block.block_type === 'gallery' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gallery_title">Title</Label>
                  <Input
                    id="gallery_title"
                    {...register('content.title')}
                    placeholder="My Gallery"
                  />
                </div>
                <div className="text-sm text-muted-foreground p-3 bg-muted rounded">
                  Image management for gallery is handled via the block itself
                  in the preview.
                </div>
              </div>
            )}

            {block.block_type === 'projects' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projects_title">Title</Label>
                  <Input
                    id="projects_title"
                    {...register('content.title')}
                    placeholder="Featured Projects"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projects_limit">Limit</Label>
                  <Input
                    id="projects_limit"
                    type="number"
                    {...register('content.limit', { valueAsNumber: true })}
                    placeholder="6"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projects_category">Filter by Category</Label>
                  <Input
                    id="projects_category"
                    {...register('content.category')}
                    placeholder="e.g. Graphic Design"
                  />
                </div>
              </div>
            )}

            {block.block_type === 'form' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="form_title">Title</Label>
                  <Input
                    id="form_title"
                    {...register('content.title')}
                    placeholder="Get In Touch"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form_description">Description</Label>
                  <Textarea
                    id="form_description"
                    {...register('content.description')}
                    placeholder="Enter description..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form_submit_text">Submit Button Text</Label>
                  <Input
                    id="form_submit_text"
                    {...register('content.submit_text')}
                    placeholder="Submit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form_success_message">Success Message</Label>
                  <Textarea
                    id="form_success_message"
                    {...register('content.success_message')}
                    placeholder="Thank you! We will get back to you soon."
                    rows={2}
                  />
                </div>
              </div>
            )}

            {block.block_type === 'header' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="header_logo_text">Logo Text</Label>
                  <Input
                    id="header_logo_text"
                    {...register('content.logo_text')}
                    placeholder="Portfolio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="header_logo_image">Logo Image URL</Label>
                  <Input
                    id="header_logo_image"
                    {...register('content.logo_image')}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {block.block_type === 'footer' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="footer_copyright">Copyright Text</Label>
                  <Input
                    id="footer_copyright"
                    {...register('content.copyright_text')}
                    placeholder="© 2024 Portfolio"
                  />
                </div>
              </div>
            )}

            {block.block_type === 'features' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="features_title">Title</Label>
                  <Input
                    id="features_title"
                    {...register('content.title')}
                    placeholder="Our Features"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features_description">Description</Label>
                  <Textarea
                    id="features_description"
                    {...register('content.description')}
                    placeholder="Enter description..."
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">
                      Items
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendFeature({
                          title: 'New Feature',
                          description: 'Description',
                          icon: 'Star',
                        })
                      }
                      className="h-7 px-2"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {featureFields.map((field, index) => (
                      <Card key={field.id} className="relative p-3 bg-muted/30">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                        <div className="space-y-2">
                          <Input
                            {...register(`content.features.${index}.title`)}
                            placeholder="Title"
                            className="bg-background h-8"
                          />
                          <Textarea
                            {...register(
                              `content.features.${index}.description`
                            )}
                            placeholder="Description"
                            rows={2}
                            className="bg-background text-xs"
                          />
                          <Input
                            {...register(`content.features.${index}.icon`)}
                            placeholder="Icon (Lucide name)"
                            className="bg-background h-8 text-xs font-mono"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {block.block_type === 'skills' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="skills_title">Title</Label>
                  <Input
                    id="skills_title"
                    {...register('content.title')}
                    placeholder="Professional Skills"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">
                      Skills
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendSkill({
                          id: Math.random().toString(36).substr(2, 9),
                          name: 'New Skill',
                          level: 80,
                        })
                      }
                      className="h-7 px-2"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {skillFields.map((field, index) => (
                      <Card key={field.id} className="relative p-3 bg-muted/30">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeSkill(index)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                        <div className="space-y-2">
                          <Input
                            {...register(`content.skills.${index}.name`)}
                            placeholder="Skill Name"
                            className="bg-background h-8"
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              {...register(`content.skills.${index}.level`, {
                                valueAsNumber: true,
                              })}
                              placeholder="80"
                              min={0}
                              max={100}
                              className="bg-background h-8 w-20"
                            />
                            <span className="text-xs text-muted-foreground">
                              %
                            </span>
                            <Input
                              {...register(`content.skills.${index}.category`)}
                              placeholder="Category"
                              className="bg-background h-8 flex-1"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {block.block_type === 'stats' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="stats_title">Title</Label>
                  <Input
                    id="stats_title"
                    {...register('content.title')}
                    placeholder="By the Numbers"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">
                      Statistics
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendStat({
                          id: Math.random().toString(36).substr(2, 9),
                          label: 'New Stat',
                          value: '100',
                        })
                      }
                      className="h-7 px-2"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {statFields.map((field, index) => (
                      <Card key={field.id} className="relative p-3 bg-muted/30">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeStat(index)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                        <div className="space-y-2">
                          <Input
                            {...register(`content.stats.${index}.label`)}
                            placeholder="Label (e.g. Projects)"
                            className="bg-background h-8"
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              {...register(`content.stats.${index}.value`)}
                              placeholder="Value"
                              className="bg-background h-8 flex-1"
                            />
                            <Input
                              {...register(`content.stats.${index}.suffix`)}
                              placeholder="Suffix"
                              className="bg-background h-8 w-16"
                            />
                          </div>
                          <Input
                            {...register(`content.stats.${index}.icon`)}
                            placeholder="Icon (Emoji)"
                            className="bg-background h-8 text-xs"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
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

            {block.block_type === 'video' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    {...register('content.video_url')}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video_type">Video Type</Label>
                  <Select
                    value={(watch('content.video_type') as string) || 'youtube'}
                    onValueChange={value =>
                      setValue('content.video_type', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="direct">Direct Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Generic content editor for other block types */}
            {![
              'hero',
              'organic-hero',
              'infinite-hero',
              'brand-hero',
              'text',
              'image',
              'video',
              'gallery',
              'projects',
              'form',
              'header',
              'footer',
              'features',
              'skills',
              'stats',
            ].includes(block.block_type) && (
                <div className="text-sm text-muted-foreground">
                  Content editing for {block.block_type} blocks coming soon...
                </div>
              )}
          </TabsContent>

          <TabsContent value="settings" className="mt-0 space-y-4">
            {/* Block-specific settings */}
            {(
              ['hero', 'organic-hero', 'infinite-hero', 'brand-hero'] as any
            ).includes(block.block_type) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="hero-height">Height</Label>
                    <Select
                      value={(watch('settings.height') as string) || 'full'}
                      onValueChange={value => setValue('settings.height', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="full">Full Height</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {block.block_type === 'hero' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="alignment">Alignment</Label>
                        <Select
                          value={
                            (watch('settings.alignment') as string) || 'center'
                          }
                          onValueChange={value =>
                            setValue('settings.alignment', value)
                          }
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
                          value={
                            (watch('settings.background') as string) || 'gradient'
                          }
                          onValueChange={value =>
                            setValue('settings.background', value)
                          }
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
                    </>
                  )}
                  {block.block_type === 'infinite-hero' && (
                    <div className="space-y-2">
                      <Label htmlFor="overlay_variant">Overlay Variant</Label>
                      <Select
                        value={
                          (watch('settings.overlay_variant') as string) ||
                          'vignette'
                        }
                        onValueChange={value =>
                          setValue('settings.overlay_variant', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="vignette">Vignette</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                    onValueChange={value =>
                      setValue('settings.text_align', value)
                    }
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

            {block.block_type === 'gallery' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="gallery_layout">Layout</Label>
                  <Select
                    value={(watch('settings.layout') as string) || 'grid'}
                    onValueChange={value => setValue('settings.layout', value)}
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
                  <Label htmlFor="gallery_cols">Columns</Label>
                  <Input
                    id="gallery_cols"
                    type="number"
                    min={1}
                    max={6}
                    {...register('settings.columns', { valueAsNumber: true })}
                  />
                </div>
              </>
            )}

            {block.block_type === 'projects' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="projects_layout">Layout</Label>
                  <Select
                    value={(watch('settings.layout') as string) || 'grid'}
                    onValueChange={value => setValue('settings.layout', value)}
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
                  <Label htmlFor="projects_cols">Columns</Label>
                  <Input
                    id="projects_cols"
                    type="number"
                    min={1}
                    max={4}
                    {...register('settings.columns', { valueAsNumber: true })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_description">Show Description</Label>
                  <Checkbox
                    id="show_description"
                    checked={watch('settings.show_description') ?? true}
                    onCheckedChange={checked =>
                      setValue('settings.show_description', checked === true)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_tags">Show Tags</Label>
                  <Checkbox
                    id="show_tags"
                    checked={watch('settings.show_tags') ?? false}
                    onCheckedChange={checked =>
                      setValue('settings.show_tags', checked === true)
                    }
                  />
                </div>
              </>
            )}

            {block.block_type === 'form' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="form_layout">Layout</Label>
                  <Select
                    value={(watch('settings.layout') as string) || 'single'}
                    onValueChange={value => setValue('settings.layout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Column</SelectItem>
                      <SelectItem value="two-column">Two Columns</SelectItem>
                      <SelectItem value="split-with-info">
                        Split with Info
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="button_style">Button Style</Label>
                  <Select
                    value={
                      (watch('settings.button_style') as string) || 'primary'
                    }
                    onValueChange={value =>
                      setValue('settings.button_style', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {block.block_type === 'header' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="header_layout">Layout</Label>
                  <Select
                    value={(watch('settings.layout') as string) || 'simple'}
                    onValueChange={value => setValue('settings.layout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="centered">Centered</SelectItem>
                      <SelectItem value="split">Split</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="header_sticky">Sticky Header</Label>
                  <Checkbox
                    id="header_sticky"
                    checked={watch('settings.sticky') ?? true}
                    onCheckedChange={checked =>
                      setValue('settings.sticky', checked === true)
                    }
                  />
                </div>
              </div>
            )}

            {block.block_type === 'skills' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills_layout">Layout</Label>
                  <Select
                    value={(watch('settings.layout') as string) || 'bars'}
                    onValueChange={value => setValue('settings.layout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bars">Progress Bars</SelectItem>
                      <SelectItem value="badges">Badges</SelectItem>
                      <SelectItem value="grid">Grid Cards</SelectItem>
                      <SelectItem value="circular">Circular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {watch('settings.layout') === 'grid' && (
                  <div className="space-y-2">
                    <Label htmlFor="skills_cols">Columns</Label>
                    <Input
                      id="skills_cols"
                      type="number"
                      min={1}
                      max={6}
                      {...register('settings.columns', { valueAsNumber: true })}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_level">Show Level (%)</Label>
                  <Checkbox
                    id="show_level"
                    checked={watch('settings.show_level') ?? true}
                    onCheckedChange={checked =>
                      setValue('settings.show_level', checked === true)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_category">Show Category</Label>
                  <Checkbox
                    id="show_category"
                    checked={watch('settings.show_category') ?? false}
                    onCheckedChange={checked =>
                      setValue('settings.show_category', checked === true)
                    }
                  />
                </div>
              </div>
            )}

            {block.block_type === 'stats' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stats_layout">Layout</Label>
                  <Select
                    value={(watch('settings.layout') as string) || 'grid'}
                    onValueChange={value => setValue('settings.layout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="horizontal">Horizontal Row</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stats_cols">Columns</Label>
                  <Input
                    id="stats_cols"
                    type="number"
                    min={1}
                    max={6}
                    {...register('settings.columns', { valueAsNumber: true })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="stats_animation">Animated Counting</Label>
                  <Checkbox
                    id="stats_animation"
                    checked={watch('settings.animation') ?? true}
                    onCheckedChange={checked =>
                      setValue('settings.animation', checked === true)
                    }
                  />
                </div>
              </div>
            )}

            {![
              'hero',
              'organic-hero',
              'infinite-hero',
              'brand-hero',
              'text',
              'gallery',
              'projects',
              'form',
              'header',
              'skills',
              'stats',
            ].includes(block.block_type) && (
                <div className="text-sm text-muted-foreground">
                  Settings for {block.block_type} blocks coming soon...
                </div>
              )}
          </TabsContent>

          <TabsContent value="layout" className="mt-0 space-y-4">
            {/* Freeform Position Controls */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Position
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="layout-x" className="text-xs">X</Label>
                  <Input
                    id="layout-x"
                    type="number"
                    {...register('layout.x', { valueAsNumber: true })}
                    placeholder="20"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="layout-y" className="text-xs">Y</Label>
                  <Input
                    id="layout-y"
                    type="number"
                    {...register('layout.y', { valueAsNumber: true })}
                    placeholder="20"
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* Size Controls */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Size
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="layout-width" className="text-xs">Width</Label>
                  <Input
                    id="layout-width"
                    type="number"
                    {...register('layout.width', { valueAsNumber: true })}
                    placeholder="600"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="layout-height" className="text-xs">Height</Label>
                  <Input
                    id="layout-height"
                    type="number"
                    {...register('layout.height', { valueAsNumber: true })}
                    placeholder="200"
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* Layer Controls */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Layer Order
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={() => {
                    const currentZ = (watch('layout.zIndex') as number) || 10;
                    setValue('layout.zIndex', currentZ + 10);
                  }}
                >
                  ↑ Bring Forward
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={() => {
                    const currentZ = (watch('layout.zIndex') as number) || 10;
                    setValue('layout.zIndex', Math.max(1, currentZ - 10));
                  }}
                >
                  ↓ Send Back
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="layout-zindex" className="text-xs">Z-Index:</Label>
                <Input
                  id="layout-zindex"
                  type="number"
                  {...register('layout.zIndex', { valueAsNumber: true })}
                  placeholder="10"
                  className="h-7 w-20 text-xs"
                />
              </div>
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
                  onCheckedChange={checked =>
                    setValue('is_visible', checked === true)
                  }
                />
              </div>
              <div className="space-y-2 pl-4 border-l-2">
                <Label className="text-xs">Visible On</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="visible_desktop"
                      className="text-xs cursor-pointer"
                    >
                      Desktop
                    </Label>
                    <Checkbox
                      id="visible_desktop"
                      checked={watch('visible_on.desktop') ?? true}
                      onCheckedChange={checked =>
                        setValue('visible_on.desktop', checked === true)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="visible_tablet"
                      className="text-xs cursor-pointer"
                    >
                      Tablet
                    </Label>
                    <Checkbox
                      id="visible_tablet"
                      checked={watch('visible_on.tablet') ?? true}
                      onCheckedChange={checked =>
                        setValue('visible_on.tablet', checked === true)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="visible_mobile"
                      className="text-xs cursor-pointer"
                    >
                      Mobile
                    </Label>
                    <Checkbox
                      id="visible_mobile"
                      checked={watch('visible_on.mobile') ?? true}
                      onCheckedChange={checked =>
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
          <Button
            type="submit"
            className="w-full"
            disabled={updateBlockMutation.isPending}
          >
            {updateBlockMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Tabs>
    </form>
  );
}
