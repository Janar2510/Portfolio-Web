/**
 * Settings Panel Component
 * General site settings and management links
 */

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProjectsManager } from '../../projects/ProjectsManager';
import { FormSubmissionsManager } from '../../forms/FormSubmissionsManager';
import { DomainSettings } from '../../domain/DomainSettings';
import { Settings, FolderKanban, Mail, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEditorStore } from '@/stores/portfolio';
import { useUpdateSite } from '@/hooks/portfolio/use-editor';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full flex flex-col"
    >
      <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
        <TabsTrigger
          value="general"
          className="flex items-center gap-2 text-xs"
        >
          <Settings className="h-3 w-3" />
          General
        </TabsTrigger>
        <TabsTrigger
          value="projects"
          className="flex items-center gap-2 text-xs"
        >
          <FolderKanban className="h-3 w-3" />
          Projects
        </TabsTrigger>
        <TabsTrigger
          value="submissions"
          className="flex items-center gap-2 text-xs"
        >
          <Mail className="h-3 w-3" />
          Submissions
        </TabsTrigger>
        <TabsTrigger value="domain" className="flex items-center gap-2 text-xs">
          <Globe className="h-3 w-3" />
          Domain
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-auto">
        <TabsContent value="general" className="mt-0 p-4">
          <GeneralSiteSettings />
        </TabsContent>
        <TabsContent value="projects" className="mt-0">
          <ProjectsManager />
        </TabsContent>
        <TabsContent value="submissions" className="mt-0">
          <FormSubmissionsManager />
        </TabsContent>
        <TabsContent value="domain" className="mt-0">
          <DomainSettings />
        </TabsContent>
      </div>
    </Tabs>
  );
}

function GeneralSiteSettings() {
  const { siteId } = useEditorStore();
  const updateSiteMutation = useUpdateSite();
  const { toast } = useToast();
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);

  const { data: site, isLoading } = useQuery({
    queryKey: ['portfolio-site', siteId],
    queryFn: () => (siteId ? portfolioService.getSiteById(siteId) : null),
    enabled: !!siteId,
  });

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm({
    values: {
      name: site?.name || '',
      subdomain: site?.subdomain || '',
      seo_title: site?.seo_title || '',
      seo_description: site?.seo_description || '',
    },
  });

  if (isLoading)
    return <div className="p-4 text-center">Loading settings...</div>;
  if (!site)
    return (
      <div className="p-4 text-center text-muted-foreground">
        Site not found
      </div>
    );

  const onSubmit = (data: any) => {
    updateSiteMutation.mutate(
      {
        siteId: site.id,
        updates: data,
      },
      {
        onSuccess: () => {
          toast.success('Site updated', {
            description: 'Your site settings have been saved.',
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Site Information</CardTitle>
            <CardDescription className="text-xs">
              General configuration for your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">
                Site Name
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="My Portfolio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdomain" className="text-xs">
                Subdomain
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  id="subdomain"
                  {...register('subdomain')}
                  placeholder="my-portfolio"
                />
                <span className="text-muted-foreground text-xs">
                  .supale.ee
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Site SEO</CardTitle>
            <CardDescription className="text-xs">
              Default SEO settings for your entire site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_seo_title" className="text-xs">
                SEO Title
              </Label>
              <Input
                id="site_seo_title"
                {...register('seo_title')}
                placeholder="My Professional Portfolio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_seo_description" className="text-xs">
                SEO Description
              </Label>
              <Textarea
                id="site_seo_description"
                {...register('seo_description')}
                placeholder="A brief description of your site"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          disabled={!isDirty || updateSiteMutation.isPending}
        >
          {updateSiteMutation.isPending ? 'Saving...' : 'Save Site Settings'}
        </Button>
      </form>
    </div>
  );
}
