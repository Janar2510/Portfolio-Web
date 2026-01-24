/**
 * Projects Manager Component
 * Manage portfolio projects (CRUD operations)
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { useEditorStore } from '@/stores/portfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export function ProjectsManager() {
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);
  const queryClient = useQueryClient();
  const { currentPage } = useEditorStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    description: '',
    category: '',
    tags: [] as string[],
    thumbnail_url: '',
  });
  const [tagInput, setTagInput] = useState('');

  const siteId = currentPage?.site_id;

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['portfolio-projects', siteId],
    queryFn: async () => {
      if (!siteId) return [];
      return await portfolioService.getProjects(siteId);
    },
    enabled: !!siteId,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!siteId) throw new Error('No site ID');
      return await portfolioService.createProject(siteId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects', siteId] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await portfolioService.updateProject(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects', siteId] });
      setEditingProject(null);
      resetForm();
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return await portfolioService.deleteProject(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects', siteId] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      description: '',
      category: '',
      tags: [],
      thumbnail_url: '',
    });
    setTagInput('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProjectMutation.mutate({
        id: editingProject.id,
        data: formData,
      });
    } else {
      createProjectMutation.mutate(formData);
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      slug: project.slug || '',
      excerpt: project.excerpt || '',
      description: project.description || '',
      category: project.category || '',
      tags: project.tags || [],
      thumbnail_url: project.thumbnail_url || '',
    });
    setIsCreateDialogOpen(true);
  };

  if (!siteId) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No site selected
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-sm text-muted-foreground">
            Manage your portfolio projects
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setEditingProject(null);
          setIsCreateDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any) => (
            <Card key={project.id} className="overflow-hidden">
              {project.thumbnail_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={project.thumbnail_url}
                    alt={project.title || 'Project'}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this project?')) {
                          deleteProjectMutation.mutate(project.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {project.category && (
                  <Badge variant="secondary" className="mt-2">
                    {project.category}
                  </Badge>
                )}
              </CardHeader>
              {project.excerpt && (
                <CardContent>
                  <CardDescription>{project.excerpt}</CardDescription>
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </DialogTitle>
              <DialogDescription>
                {editingProject
                  ? 'Update project information'
                  : 'Add a new project to your portfolio'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (!editingProject && !formData.slug) {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      });
                    }
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL: /projects/{formData.slug || 'project-slug'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={2}
                  placeholder="Short description for project cards"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  placeholder="Full project description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Web Design, Mobile App"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail_url: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add a tag and press Enter"
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                  setEditingProject(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createProjectMutation.isPending || updateProjectMutation.isPending
                }
              >
                {editingProject ? 'Update' : 'Create'} Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
