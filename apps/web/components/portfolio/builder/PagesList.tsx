'use client';

import { useState } from 'react';
import { Plus, FileText, Home, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PortfolioPage } from '@/lib/services/portfolio';

interface PagesListProps {
  pages: PortfolioPage[];
  currentPageId?: string;
  onPageSelect: (pageId: string) => void;
  onPageCreate: (data: { slug: string; title: string; is_homepage?: boolean }) => Promise<void>;
  onPageUpdate: (pageId: string, data: Partial<PortfolioPage>) => Promise<void>;
  onPageDelete: (pageId: string) => Promise<void>;
}

export function PagesList({
  pages,
  currentPageId,
  onPageSelect,
  onPageCreate,
  onPageUpdate,
  onPageDelete,
}: PagesListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PortfolioPage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedPages = [...pages].sort((a, b) => {
    if (a.is_homepage) return -1;
    if (b.is_homepage) return 1;
    return a.sort_order - b.sort_order;
  });

  const handleCreatePage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const slug = formData.get('slug') as string;
    const title = formData.get('title') as string;
    const is_homepage = formData.get('is_homepage') === 'on';

    await onPageCreate({ slug, title, is_homepage });
    setIsCreateDialogOpen(false);
    e.currentTarget.reset();
  };

  const handleEditPage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPage) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const is_homepage = formData.get('is_homepage') === 'on';

    await onPageUpdate(editingPage.id, { title, slug, is_homepage });
    setIsEditDialogOpen(false);
    setEditingPage(null);
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    setIsDeleting(true);
    try {
      await onPageDelete(pageId);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col border-r bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Pages</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreatePage}>
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
                <DialogDescription>
                  Add a new page to your portfolio site.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" required pattern="[a-z0-9-]+" />
                  <p className="text-xs text-muted-foreground">
                    URL-friendly identifier (e.g., about-me)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_homepage"
                    name="is_homepage"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="is_homepage" className="cursor-pointer">
                    Set as homepage
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto">
        {sortedPages.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No pages yet. Create your first page!
          </div>
        ) : (
          <div className="p-2">
            {sortedPages.map((page) => (
              <div
                key={page.id}
                className={cn(
                  'group relative mb-1 flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-accent',
                  currentPageId === page.id && 'bg-accent'
                )}
              >
                <button
                  onClick={() => onPageSelect(page.id)}
                  className="flex flex-1 items-center gap-2 text-left"
                >
                  {page.is_homepage ? (
                    <Home className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{page.title}</div>
                    <div className="text-xs text-muted-foreground">
                      /{page.slug}
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPage(page);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(page.id);
                    }}
                    disabled={isDeleting || page.is_homepage}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          {editingPage && (
            <form onSubmit={handleEditPage}>
              <DialogHeader>
                <DialogTitle>Edit Page</DialogTitle>
                <DialogDescription>
                  Update page details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={editingPage.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input
                    id="edit-slug"
                    name="slug"
                    defaultValue={editingPage.slug}
                    required
                    pattern="[a-z0-9-]+"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-is_homepage"
                    name="is_homepage"
                    defaultChecked={editingPage.is_homepage}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="edit-is_homepage" className="cursor-pointer">
                    Set as homepage
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingPage(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
