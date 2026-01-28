'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useEditorStore, useBlocksStore, useStylesStore } from '@/stores/portfolio';
import { useSavePage, useUpdateSite } from '@/hooks/portfolio/use-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { toast } from 'sonner';

export function PageSettingsPanel() {
  const { currentPage, siteId } = useEditorStore();
  const { blocks, updateBlock } = useBlocksStore();
  const { styles, updateColors, updateAssets, updateSiteTitle, updateBio } = useStylesStore();
  const savePageMutation = useSavePage();
  const updateSiteMutation = useUpdateSite();

  // Find Hero Block
  const heroBlock = blocks.find(b => b.block_type === 'hero');
  const aboutBlock = blocks.find(b => b.block_type === 'about');

  const { register, handleSubmit, setValue, watch, control } = useForm({
    defaultValues: {
      siteTitle: styles?.siteTitle || '',
      bio: styles?.bio || '',
      heroTitle: (heroBlock?.content?.headline as string) || (heroBlock?.content?.title as string) || '',
      heroSubtitle: (heroBlock?.content?.subheadline as string) || (heroBlock?.content?.subtitle as string) || '',
      primaryColor: styles?.colors?.primary || '#000000',
      backgroundColor: styles?.colors?.background || '#ffffff',
      textColor: styles?.colors?.text || '#000000',
      accentColor: styles?.colors?.accent || '#7c3aed',
      logoUrl: styles?.assets?.logo || '',
      avatarUrl: styles?.assets?.avatar || '',
    },
  });

  // Sync form with store changes if they happen externally
  useEffect(() => {
    if (styles?.siteTitle) setValue('siteTitle', styles.siteTitle);
    if (styles?.bio) setValue('bio', styles.bio);
    if (heroBlock?.content?.headline || heroBlock?.content?.title)
      setValue('heroTitle', (heroBlock.content.headline || heroBlock.content.title) as string);
    if (heroBlock?.content?.subheadline || heroBlock?.content?.subtitle)
      setValue('heroSubtitle', (heroBlock.content.subheadline || heroBlock.content.subtitle) as string);
    if (styles?.colors?.primary) setValue('primaryColor', styles.colors.primary);
    if (styles?.colors?.background) setValue('backgroundColor', styles.colors.background);
    if (styles?.colors?.text) setValue('textColor', styles.colors.text);
    if (styles?.colors?.accent) setValue('accentColor', styles.colors.accent);
    if (styles?.assets?.logo) setValue('logoUrl', styles.assets.logo);
    if (styles?.assets?.avatar) setValue('avatarUrl', styles.assets.avatar);
  }, [styles, heroBlock, setValue]);

  const onSubmit = async (data: any) => {
    try {
      // 1. Update Site Metadata (Store)
      updateSiteTitle(data.siteTitle);
      updateBio(data.bio);

      // 2. Update Hero Content (Store) - Support both headline/title and subheadline/subtitle
      if (heroBlock) {
        updateBlock(heroBlock.id, {
          content: {
            ...heroBlock.content,
            headline: data.heroTitle,
            title: data.heroTitle, // Backward compat
            subheadline: data.heroSubtitle,
            subtitle: data.heroSubtitle, // Backward compat
          },
        });
      }

      // 3. Update Colors (Store)
      updateColors({
        primary: data.primaryColor,
        background: data.backgroundColor,
        text: data.textColor,
        accent: data.accentColor,
      });

      // 4. Update Assets (Store)
      updateAssets({
        logo: data.logoUrl,
        avatar: data.avatarUrl,
      });

      // 5. Save Everything (Persist to DB)
      await savePageMutation.mutateAsync();

      toast.success('Site settings saved successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings.');
    }
  };

  if (!currentPage || !styles) return <div>Loading settings...</div>;

  return (
    <div className="p-4 space-y-6 pb-20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Site Title</Label>
              <Input {...register('siteTitle')} placeholder="My Portfolio" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Logo URL</Label>
              <Input {...register('logoUrl')} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Avatar URL</Label>
              <Input {...register('avatarUrl')} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Bio</Label>
              <Textarea {...register('bio')} rows={4} placeholder="Write about yourself..." />
            </div>
          </CardContent>
        </Card>

        {heroBlock && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Headline</Label>
                <Input {...register('heroTitle')} placeholder="Hello, I am..." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Subtitle</Label>
                <Input {...register('heroSubtitle')} placeholder="Product Designer..." />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Theme Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Primary</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-8 h-8 p-0 border-none" {...register('primaryColor')} />
                  <Input {...register('primaryColor')} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Background</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-8 h-8 p-0 border-none" {...register('backgroundColor')} />
                  <Input {...register('backgroundColor')} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Text</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-8 h-8 p-0 border-none" {...register('textColor')} />
                  <Input {...register('textColor')} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Accent</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-8 h-8 p-0 border-none" {...register('accentColor')} />
                  <Input {...register('accentColor')} className="flex-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={savePageMutation.isPending}>
          {savePageMutation.isPending ? 'Saving...' : 'Save All Changes'}
        </Button>
      </form>
    </div>
  );
}
