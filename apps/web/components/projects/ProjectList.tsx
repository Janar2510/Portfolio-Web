'use client';

import { useState } from 'react';
import {
  Plus,
  FolderKanban,
  Archive,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'archived' | 'completed';
  color: string | null;
  linked_contact_id: string | null;
  linked_deal_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectListProps {
  projects: Project[];
  currentProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  onProjectCreate: (data: {
    name: string;
    description?: string;
    color?: string;
  }) => Promise<void>;
  onProjectUpdate: (projectId: string, data: Partial<Project>) => Promise<void>;
  onProjectDelete: (projectId: string) => Promise<void>;
}

export function ProjectList({
  projects,
  currentProjectId,
  onProjectSelect,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
}: ProjectListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const sortedProjects = [...projects].sort((a, b) => {
    const statusOrder = { active: 0, archived: 1, completed: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const color = formData.get('color') as string;

    await onProjectCreate({
      name,
      description: description || undefined,
      color: color || undefined,
    });
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const handleEditProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProject) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as Project['status'];
    const color = formData.get('color') as string;

    await onProjectUpdate(editingProject.id, {
      name,
      description: description || null,
      status,
      color: color || null,
    });
    setIsEditDialogOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this project? All tasks and data will be deleted.'
      )
    ) {
      return;
    }
    await onProjectDelete(projectId);
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <FolderKanban className="h-4 w-4" />;
      case 'archived':
        return <Archive className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'text-blue-600';
      case 'archived':
        return 'text-gray-500';
      case 'completed':
        return 'text-green-600';
    }
  };

  return (
    <div className="flex h-full flex-col border-r bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Projects</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateProject}>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new project to organize your tasks.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      name="color"
                      type="color"
                      className="h-10 w-20"
                      defaultValue="#3b82f6"
                    />
                    <Input
                      type="text"
                      name="color"
                      placeholder="#3b82f6"
                      defaultValue="#3b82f6"
                    />
                  </div>
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

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {sortedProjects.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No projects yet. Create your first project!
          </div>
        ) : (
          <div className="p-2">
            {sortedProjects.map(project => (
              <div
                key={project.id}
                className={cn(
                  'group relative mb-1 flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-accent',
                  currentProjectId === project.id && 'bg-accent'
                )}
              >
                <button
                  onClick={() => onProjectSelect(project.id)}
                  className="flex flex-1 items-center gap-2 text-left"
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: project.color || '#3b82f6' }}
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          getStatusColor(project.status)
                        )}
                      >
                        {project.name}
                      </span>
                      {getStatusIcon(project.status)}
                    </div>
                    {project.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {project.description}
                      </div>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={e => {
                      e.stopPropagation();
                      setEditingProject(project);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
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
          {editingProject && (
            <form onSubmit={handleEditProject}>
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>Update project details.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Project Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingProject.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    rows={3}
                    defaultValue={editingProject.description || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={editingProject.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-color"
                      name="color"
                      type="color"
                      className="h-10 w-20"
                      defaultValue={editingProject.color || '#3b82f6'}
                    />
                    <Input
                      type="text"
                      name="color"
                      placeholder="#3b82f6"
                      defaultValue={editingProject.color || '#3b82f6'}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingProject(null);
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
