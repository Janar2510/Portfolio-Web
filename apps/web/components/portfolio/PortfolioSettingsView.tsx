/**
 * Portfolio Settings View Component
 * Standalone settings page for portfolio site management
 */

'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { ProjectsManager } from './projects/ProjectsManager';
import { FormSubmissionsManager } from './forms/FormSubmissionsManager';
import { DomainSettings } from './domain/DomainSettings';
import {
  Settings,
  FolderKanban,
  Mail,
  Globe,
  ArrowLeft,
  Save,
} from 'lucide-react';
import type { PortfolioSite } from '@/lib/services/portfolio';

interface PortfolioSettingsViewProps {
  site: PortfolioSite;
  locale: string;
}

export function PortfolioSettingsView({
  site,
  locale,
}: PortfolioSettingsViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [siteName, setSiteName] = useState(site.name);
  const [subdomain, setSubdomain] = useState(site.subdomain);
  const [seoTitle, setSeoTitle] = useState(site.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(
    site.seo_description || ''
  );

  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);

  const updateSiteMutation = useMutation({
    mutationFn: async (data: {
      name?: string;
      subdomain?: string;
      seo_title?: string;
      seo_description?: string;
    }) => {
      return await portfolioService.updateSite(site.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-site'] });
    },
  });

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSiteMutation.mutateAsync({
      name: siteName,
      subdomain: subdomain,
      seo_title: seoTitle || undefined,
      seo_description: seoDescription || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${locale}/portfolio`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="heading-page mb-2">Site Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your portfolio site configuration
            </p>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="domain" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Domain
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>
                Basic information about your portfolio site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={siteName}
                    onChange={e => setSiteName(e.target.value)}
                    placeholder="My Portfolio"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="subdomain"
                      value={subdomain}
                      onChange={e =>
                        setSubdomain(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, '')
                        )
                      }
                      placeholder="myportfolio"
                      required
                      pattern="[a-z0-9-]+"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      .yourdomain.com
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-title">SEO Title</Label>
                  <Input
                    id="seo-title"
                    value={seoTitle}
                    onChange={e => setSeoTitle(e.target.value)}
                    placeholder="My Portfolio - Web Developer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Title shown in search engines and browser tabs
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-description">SEO Description</Label>
                  <Textarea
                    id="seo-description"
                    value={seoDescription}
                    onChange={e => setSeoDescription(e.target.value)}
                    placeholder="A brief description of your portfolio"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Description shown in search engine results
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updateSiteMutation.isPending}>
                    {updateSiteMutation.isPending ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectsManager />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <FormSubmissionsManager />
        </TabsContent>

        <TabsContent value="domain" className="space-y-6">
          <DomainSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
