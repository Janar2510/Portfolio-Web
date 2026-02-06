'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsService } from '@/domain/projects';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Loader2,
  Folder,
  MoreVertical,
  Calendar,
  Users
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.getAll(),
  });

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-black/20">
      {/* Header */}
      <div className="flex-none p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white font-display uppercase">Projects</h1>
          <p className="text-white/40 max-w-lg">Manage your team's work, track progress, and hit deadlines.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 transition-all"
            />
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-glow-primary transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-white/20">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <Folder className="w-12 h-12 text-white/10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No projects found</h3>
              <p className="text-white/40">Get started by creating your first project.</p>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="outline"
              className="mt-4 border-white/10 hover:bg-white/5 text-white rounded-xl"
            >
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group relative flex flex-col p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:border-primary/20 group-hover:bg-primary/10 transition-colors">
                    <Folder className="w-6 h-6" style={{ color: project.color }} />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-white rounded-full">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-6 flex-1 relative z-10">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                  <p className="text-sm text-white/40 line-clamp-2">{project.description || 'No description provided.'}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-white/30 pt-4 border-t border-white/5 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDistanceToNow(new Date(project.updated_at))} ago</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Board</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
