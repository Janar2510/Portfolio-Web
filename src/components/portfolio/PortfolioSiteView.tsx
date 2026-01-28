/**
 * Portfolio Site View Component
 * Overview and navigation for portfolio site
 */

'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Eye,
  Plus,
  ExternalLink,
  Settings,
  FileText,
  Globe,
  Trash,
} from 'lucide-react';
import { SiteDocument } from '@/domain/templates/contracts';
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
import { PortfolioService } from '@/domain/builder/portfolio';

interface PortfolioSiteViewProps {
  site: SiteDocument;
  pages: any[];
  locale: string;
}

export function PortfolioSiteView({
  site,
  pages,
  locale,
}: PortfolioSiteViewProps) {
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
    onSuccess: newPage => {
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

  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      return await portfolioService.deletePage(pageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-pages', site.id] });
    },
  });

  const deleteSiteMutation = useMutation({
    mutationFn: async () => {
      return await portfolioService.deleteSite(site.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-site'] });
      // Since current flow is 1 site per user, if we delete it, we should probably
      // trigger a fresh fetch or redirect. However, parent component handles "NoSiteView"
      // so invalidating should be enough to show "Create Site" again if parent re-renders.
      router.refresh();
    },
  });

  const handleDeletePage = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this page?')) {
      deletePageMutation.mutate(pageId);
    }
  };

  const handleDeleteSite = () => {
    if (
      confirm(
        'Are you sure you want to delete your entire site? This cannot be undone.'
      )
    ) {
      deleteSiteMutation.mutate();
    }
  };

  const siteUrl = `https://${site.slug}.yourdomain.com`;

  if (!site) {
    return <div className="p-4 text-red-500">Error: No site provided</div>;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-page mb-2">{site.slug}</h1>
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
            <Badge variant={site.status === 'published' ? 'default' : 'secondary'}>
              {site.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDeleteSite}
            disabled={deleteSiteMutation.isPending}
          >
            {deleteSiteMutation.isPending ? 'Deleting...' : 'Delete Site'}
          </Button>
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
                No pages yet. Create your first page to start building your
                portfolio.
              </p>
              <Button onClick={() => setIsCreatePageOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Page
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map(page => (
                <Card
                  key={page.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors group relative"
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
                        onClick={e => {
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
                        onClick={e => {
                          e.stopPropagation();
                          window.open(`${siteUrl}/${page.slug}`, '_blank');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => handleDeletePage(e, page.id)}
                        disabled={deletePageMutation.isPending}
                      >
                        <Trash className="h-4 w-4" />
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
                  onChange={e => {
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
                  onChange={e => setNewPageSlug(e.target.value)}
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
