'use client';

import { useState } from 'react';
import { Project, ProjectStatus, Task } from '@/domain/projects';
import ProjectBoard from '@/components/projects/ProjectBoard';
import { SprintBoard } from '@/components/projects/SprintBoard';
import { Button } from '@/components/ui/button';
import {
    Settings,
    Share2,
    Filter,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { tasksService } from '@/domain/projects';

import { GoalsDashboard } from '@/components/goals/GoalsDashboard';

interface ProjectDetailViewProps {
    project: Project;
    statuses: ProjectStatus[];
    tasks: Task[]; // Initial data
}

export function ProjectDetailView({ project, statuses, tasks: initialTasks }: ProjectDetailViewProps) {
    const [view, setView] = useState<'board' | 'sprints' | 'goals'>('board');

    // Use query for client-side updates
    const { data: tasks } = useQuery({
        queryKey: ['tasks', project.id],
        queryFn: () => tasksService.getByProject(project.id),
        initialData: initialTasks
    });

    return (
        <div className="h-full flex flex-col bg-black/20">
            {/* Header */}
            <div className="flex-none p-6 border-b border-white/5 flex flex-col gap-6 bg-white/[0.01]">
                {/* Breadcrumb / Top Bar */}
                <div className="flex items-center justify-between">
                    <Link href="/projects" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs uppercase font-bold tracking-widest">
                        <ArrowLeft className="w-3 h-3" />
                        All Projects
                    </Link>
                    <div className="flex items-center gap-2">
                        {/* Avatars */}
                        <div className="flex -space-x-2 mr-2">
                            <Avatar className="w-8 h-8 border-2 border-black">
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 border-white/10 hover:bg-white/5 text-xs">
                            <Share2 className="w-3.5 h-3.5 mr-2" />
                            Share
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Title & Tools */}
                <div className="flex items-end justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight font-display">{project.name}</h1>
                        <p className="text-white/40 max-w-2xl text-sm">{project.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setView('board')}
                            className={cn(
                                "h-9 px-4 rounded-lg gap-2 text-sm font-medium transition-colors",
                                view === 'board' ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Board
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setView('sprints')}
                            className={cn(
                                "h-9 px-4 rounded-lg gap-2 text-sm font-medium transition-colors",
                                view === 'sprints' ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Sprints
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setView('goals')}
                            className={cn(
                                "h-9 px-4 rounded-lg gap-2 text-sm font-medium transition-colors",
                                view === 'goals' ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Goals
                        </Button>
                        <Button variant="ghost" className="h-9 px-4 text-white/40 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium">
                            List
                        </Button>
                        <div className="w-px h-6 bg-white/10 mx-1" />
                        <Button variant="outline" size="icon" className="h-9 w-9 border-white/10 bg-transparent text-white/40 hover:text-white">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-hidden overflow-y-auto">
                {view === 'board' ? (
                    <ProjectBoard
                        project={project}
                        initialStatuses={statuses}
                        initialTasks={tasks}
                    />
                ) : view === 'sprints' ? (
                    <SprintBoard project={project} />
                ) : (
                    <GoalsDashboard projectId={project.id} />
                )}
            </div>
        </div>
    );
}
