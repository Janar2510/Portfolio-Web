'use client';

import { useForm } from 'react-hook-form';
import { useEditorStore } from '@/stores/portfolio';
import { useUpdatePage } from '@/hooks/portfolio/use-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { toast } from 'sonner';

export function PageSettingsPanel() {
  const { currentPage } = useEditorStore();
  const updatePageMutation = useUpdatePage();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm({
    values: {
      title: currentPage?.title || '',
      slug: currentPage?.slug || '',
      seo_title: currentPage?.seo_title || '',
      seo_description: currentPage?.seo_description || '',
      is_published: currentPage?.is_published ?? true,
    },
  });

  if (!currentPage) return null;

  const onSubmit = (data: any) => {
    updatePageMutation.mutate(
      {
        pageId: currentPage.id,
        updates: data,
      },
      {
        onSuccess: () => {
          toast.success('Page updated', {
            description: 'Your page settings have been saved.',
          });
        },
      }
    );
  };

  return (
    <div className="p-4 space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">General Settings</CardTitle>
            <CardDescription className="text-xs">
              Basic information about this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs">
                Page Title
              </Label>
              <Input id="title" {...register('title')} placeholder="Home" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs">
                URL Slug
              </Label>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground text-xs">/</span>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="home"
                  disabled={currentPage.is_homepage}
                />
              </div>
              {currentPage.is_homepage && (
                <p className="text-[10px] text-muted-foreground">
                  The homepage slug cannot be changed.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">SEO Settings</CardTitle>
            <CardDescription className="text-xs">
              Improve search engine visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seo_title" className="text-xs">
                SEO Title
              </Label>
              <Input
                id="seo_title"
                {...register('seo_title')}
                placeholder="Search engine title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo_description" className="text-xs">
                SEO Description
              </Label>
              <Textarea
                id="seo_description"
                {...register('seo_description')}
                placeholder="Description for search results"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Visibility</CardTitle>
            <CardDescription className="text-xs">
              Control if this page is public
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_published" className="text-xs cursor-pointer">
                Published
              </Label>
              <Checkbox
                id="is_published"
                checked={watch('is_published')}
                onCheckedChange={checked =>
                  setValue('is_published', checked === true, {
                    shouldDirty: true,
                  })
                }
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Unpublished pages are only visible in the editor.
            </p>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          disabled={!isDirty || updatePageMutation.isPending}
        >
          {updatePageMutation.isPending ? 'Saving...' : 'Save Page Settings'}
        </Button>
      </form>
    </div>
  );
}
