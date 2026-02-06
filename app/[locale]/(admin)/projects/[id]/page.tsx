import { notFound } from 'next/navigation';
import { ProjectDetailView } from '@/components/projects/ProjectDetailView';
import { createClient } from '@/lib/supabase/server';
import { ProjectSchema, ProjectStatusSchema, TaskSchema } from '@/domain/projects';
import { z } from 'zod';

interface ProjectLayoutProps {
    params: {
        id: string;
        locale: string;
    };
}

export default async function ProjectDetailPage({ params }: ProjectLayoutProps) {
    const { id, locale } = await params;

    // 1. Create standard client (Auth fix is now in createClient)
    const supabase = await createClient();

    // 2. Fetch Project
    const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

    if (projectError || !projectData) {
        notFound();
    }

    let project;
    try {
        project = ProjectSchema.parse(projectData);
    } catch (e: any) {
        console.error('[ProjectDetailPage] Project schema validation failed:', e);
        // Treat schema failures as 404 to avoid crashing UI
        notFound();
    }

    // 2. Fetch Statuses
    const { data: statusesData } = await supabase
        .from('project_statuses')
        .select('*')
        .eq('project_id', id)
        .order('sort_order', { ascending: true });

    const statuses = statusesData
        ? z.array(ProjectStatusSchema).parse(statusesData)
        : [];

    // 3. Fetch Tasks
    const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });

    const tasks = tasksData
        ? z.array(TaskSchema).parse(tasksData)
        : [];

    return (
        <ProjectDetailView
            project={project}
            statuses={statuses}
            tasks={tasks}
        />
    );
}
