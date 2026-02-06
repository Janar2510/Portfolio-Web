import { createClient } from '@/lib/supabase/client';
import {
    SprintSchema
} from '../schemas';
import {
    Sprint,
    CreateSprintDTO,
    UpdateSprintDTO
} from '../types';
import { z } from 'zod';

export class SprintsService {
    private supabase = createClient();

    async getByProject(projectId: string): Promise<Sprint[]> {
        const { data, error } = await this.supabase
            .from('sprints')
            .select('*')
            .eq('project_id', projectId)
            .order('start_date', { ascending: false });

        if (error) throw error;
        return z.array(SprintSchema).parse(data || []);
    }

    async getActive(projectId: string): Promise<Sprint | null> {
        const { data, error } = await this.supabase
            .from('sprints')
            .select('*')
            .eq('project_id', projectId)
            .eq('status', 'active')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;

        return SprintSchema.parse(data);
    }

    async create(data: CreateSprintDTO): Promise<Sprint> {
        const { data: sprint, error } = await this.supabase
            .from('sprints')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return SprintSchema.parse(sprint);
    }

    async update(id: string, updates: UpdateSprintDTO): Promise<Sprint> {
        const { data, error } = await this.supabase
            .from('sprints')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return SprintSchema.parse(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('sprints')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}

export const sprintsService = new SprintsService();
