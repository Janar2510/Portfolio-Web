import { createClient } from '@/lib/supabase/client';
import {
    ProjectSchema,
    ProjectStatusSchema
} from '../schemas';
import {
    Project,
    CreateProjectDTO,
    UpdateProjectDTO,
    CreateStatusDTO,
    ProjectStatus
} from '../types';
import { z } from 'zod';

export class ProjectsService {
    private supabase = createClient();

    async getAll(): Promise<Project[]> {
        const { data, error } = await this.supabase
            .from('projects')
            .select('*')
            .is('deleted_at', null)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return z.array(ProjectSchema).parse(data || []);
    }

    async getById(id: string): Promise<Project | null> {
        const { data, error } = await this.supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return ProjectSchema.parse(data);
    }

    async create(data: CreateProjectDTO): Promise<Project> {
        const { data: userData } = await this.supabase.auth.getUser();
        if (!userData.user) throw new Error('Unauthorized');

        const { data: project, error } = await this.supabase
            .from('projects')
            .insert({
                ...data,
                user_id: userData.user.id
            })
            .select()
            .single();

        if (error) throw error;
        const newProject = ProjectSchema.parse(project);

        // Create default statuses
        await this.createDefaultStatuses(newProject.id);

        return newProject;
    }

    async update(id: string, updates: UpdateProjectDTO): Promise<Project> {
        const { data, error } = await this.supabase
            .from('projects')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return ProjectSchema.parse(data);
    }

    async softDelete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('projects')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // Status Management
    async getStatuses(projectId: string): Promise<ProjectStatus[]> {
        const { data, error } = await this.supabase
            .from('project_statuses')
            .select('*')
            .eq('project_id', projectId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return z.array(ProjectStatusSchema).parse(data || []);
    }

    async createStatus(data: CreateStatusDTO): Promise<ProjectStatus> {
        const { data: status, error } = await this.supabase
            .from('project_statuses')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return ProjectStatusSchema.parse(status);
    }

    async updateStatusOrder(projectId: string, orderedIds: string[]) {
        // This is a naive implementation. In production consider RPC or batch update.
        // For drag and drop, we might update one by one or better yet, make a postgres function.
        // For MVP, concurrent helper is fine.
        const promises = orderedIds.map((id, index) =>
            this.supabase.from('project_statuses').update({ sort_order: index }).eq('id', id)
        );
        await Promise.all(promises);
    }

    private async createDefaultStatuses(projectId: string) {
        const defaults = [
            { name: 'To Do', category: 'todo', color: '#e2e8f0', sort_order: 0 },
            { name: 'In Progress', category: 'active', color: '#3b82f6', sort_order: 1 },
            { name: 'Done', category: 'done', color: '#22c55e', sort_order: 2 },
        ];

        const { error } = await this.supabase
            .from('project_statuses')
            .insert(defaults.map(d => ({ ...d, project_id: projectId })));

        if (error) console.error('Failed to create default statuses', error);
    }
}

export const projectsService = new ProjectsService();
