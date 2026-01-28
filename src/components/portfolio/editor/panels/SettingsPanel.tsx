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
import { SiteService } from '@/domain/builder/services';
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
  // Using the new SiteService which defaults its own internal client
  // But since we are client-side, we can just rely on the hook's mutation or
  // construct SiteService if safely possible.
  // Actually, SiteService creates a client. Let's assume it works or use direct query if needed.
  // Ideally we should use a hook wrapping SiteService.
  // For now let's construct it.
  const siteService = new SiteService();

  const { data: site, isLoading } = useQuery({
    queryKey: ['portfolio-site', siteId],
    queryFn: () => (siteId ? siteService.getSite(siteId) : null),
    enabled: !!siteId,
  });

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm({
    values: {
      subdomain: site?.slug || '', // Mapped to slug
      seo_title: '', // TODO: Add to TemplateConfig
      seo_description: '', // TODO: Add to TemplateConfig
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
        updates: {
          slug: data.subdomain, // Mapped back to slug
        },
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
            {/* Name field removed as it's not in Step 4 schema */}
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

        {/* SEO Settings temporarily disabled until added to schema */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-sm">Site SEO</CardTitle>
             ...
          </CardHeader>
          <CardContent className="space-y-4">
            ...
          </CardContent>
        </Card> */}

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
