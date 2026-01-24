/**
 * Pages Panel Component
 * Page management in sidebar
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { useEditorStore } from '@/stores/portfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Home, FileText, Trash2, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export function PagesPanel() {
  const router = useRouter();
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);
  const queryClient = useQueryClient();
  const { currentPage, setCurrentPage } = useEditorStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  // Get site ID - try from current page, or fetch from site
  const [siteId, setSiteId] = useState<string | null>(currentPage?.site_id || null);

  useEffect(() => {
    if (currentPage?.site_id) {
      setSiteId(currentPage.site_id);
    }
  }, [currentPage]);

  // Fetch site if we don't have it
  const { data: site } = useQuery({
    queryKey: ['portfolio-site'],
    queryFn: async () => {
      return await portfolioService.getSite();
    },
    enabled: !siteId && !currentPage,
  });

  useEffect(() => {
    if (site) {
      setSiteId(site.id);
    }
  }, [site]);

  const effectiveSiteId = siteId || site?.id;

  // Fetch pages
  const { data: pages = [] } = useQuery({
    queryKey: ['portfolio-pages', effectiveSiteId],
    queryFn: async () => {
      if (!effectiveSiteId) return [];
      return await portfolioService.getPages(effectiveSiteId);
    },
    enabled: !!effectiveSiteId,
  });

  // Create page mutation
  const createPageMutation = useMutation({
    mutationFn: async (data: { title: string; slug: string }) => {
      if (!siteId) throw new Error('No site ID');
      return await portfolioService.createPageWithLayout(siteId, {
        title: data.title,
        slug: data.slug,
      });
    },
    onSuccess: (newPage) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-pages', siteId] });
      setCurrentPage(newPage);
      setIsCreateDialogOpen(false);
      setNewPageTitle('');
      setNewPageSlug('');
      router.push(`/portfolio/editor/${newPage.id}`);
    },
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      return await portfolioService.deletePage(pageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-pages', siteId] });
      if (currentPage && pages.find((p) => p.id === currentPage.id)) {
        const remainingPages = pages.filter((p) => p.id !== currentPage.id);
        if (remainingPages.length > 0) {
          setCurrentPage(remainingPages[0]);
          router.push(`/portfolio/editor/${remainingPages[0].id}`);
        } else {
          setCurrentPage(null);
        }
      }
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

  const handlePageSelect = (page: any) => {
    setCurrentPage(page);
    router.push(`/portfolio/editor/${page.id}`);
  };

  if (!effectiveSiteId) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No site selected
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Create Page Button */}
      <Button
        onClick={() => setIsCreateDialogOpen(true)}
        className="w-full"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Page
      </Button>

      {/* Pages List */}
      <div className="space-y-2">
        {pages.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No pages yet. Create your first page!
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page.id}
              className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${currentPage?.id === page.id
                ? 'bg-primary/10 border-primary'
                : 'hover:bg-muted/50'
                }`}
              onClick={() => handlePageSelect(page)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {page.is_homepage ? (
                  <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{page.title}</div>
                  <div className="text-xs text-muted-foreground">/{page.slug}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePageSelect(page);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                {!page.is_homepage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this page?')) {
                        deletePageMutation.mutate(page.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Page Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                    // Auto-generate slug
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
                  URL: /{newPageSlug || 'page-slug'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
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
