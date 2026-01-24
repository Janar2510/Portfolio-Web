/**
 * Portfolio Site View Component
 * Overview and navigation for portfolio site
 */

'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Eye,
  Plus,
  ExternalLink,
  Settings,
  FileText,
  Globe
} from 'lucide-react';
import type { PortfolioSite, PortfolioPage } from '@/lib/services/portfolio';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';

interface PortfolioSiteViewProps {
  site: PortfolioSite;
  pages: PortfolioPage[];
  locale: string;
}

export function PortfolioSiteView({ site, pages, locale }: PortfolioSiteViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);

  // Debug: Log to console to verify component is rendering
  console.log('PortfolioSiteView rendering:', { site, pages: pages?.length });

  const createPageMutation = useMutation({
    mutationFn: async (data: { title: string; slug: string }) => {
      return await portfolioService.createPage(site.id, data);
    },
    onSuccess: (newPage) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-pages', site.id] });
      setIsCreatePageOpen(false);
      setNewPageTitle('');
      setNewPageSlug('');
      router.push(`/portfolio/editor/${newPage.id}`);
    },
  });

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !newPageSlug.trim()) return;

    createPageMutation.mutate({
      title: newPageTitle,
      slug: newPageSlug.toLowerCase().replace(/\s+/g, '-'),
    });
  };

  const siteUrl = site.custom_domain
    ? `https://${site.custom_domain}`
    : `https://${site.subdomain}.yourdomain.com`;

  if (!site) {
    return <div className="p-4 text-red-500">Error: No site provided</div>;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-page mb-2">{site.name || 'Untitled Site'}</h1>
          <div className="flex items-center gap-4">
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              {siteUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
            <Badge variant={site.is_published ? 'default' : 'secondary'}>
              {site.is_published ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/portfolio/settings`)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(siteUrl, '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Site
          </Button>
        </div>
      </div>

      {/* Pages Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pages</CardTitle>
              <CardDescription>
                Manage your portfolio pages and content
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreatePageOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No pages yet. Create your first page to start building your portfolio.
              </p>
              <Button onClick={() => setIsCreatePageOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Page
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map((page) => (
                <Card
                  key={page.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/portfolio/editor/${page.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                      {page.is_homepage && (
                        <Badge variant="secondary" className="text-xs">
                          Homepage
                        </Badge>
                      )}
                    </div>
                    <CardDescription>/{page.slug}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/portfolio/editor/${page.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`${siteUrl}/${page.slug}`, '_blank');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Page Dialog */}
      <Dialog open={isCreatePageOpen} onOpenChange={setIsCreatePageOpen}>
        <DialogContent>
          <form onSubmit={handleCreatePage}>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>
                Add a new page to your portfolio site
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="page-title">Page Title</Label>
                <Input
                  id="page-title"
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    if (!newPageSlug || newPageSlug === '') {
                      setNewPageSlug(
                        e.target.value.toLowerCase().replace(/\s+/g, '-')
                      );
                    }
                  }}
                  placeholder="About Me"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-slug">URL Slug</Label>
                <Input
                  id="page-slug"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  placeholder="about-me"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL: {siteUrl}/{newPageSlug || 'page-slug'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreatePageOpen(false);
                  setNewPageTitle('');
                  setNewPageSlug('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPageMutation.isPending}>
                {createPageMutation.isPending ? 'Creating...' : 'Create Page'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
