
import { createClient } from '@/lib/supabase/client';

export interface TaskRelation {
    id: string;
    task_id: string;
    related_type: 'contact' | 'organization' | 'lead';
    related_id: string;
    created_at: string;
    // Expanded data (optional)
    contact?: { first_name: string; last_name: string; email: string };
    organization?: { name: string };
    lead?: { title: string; company_name: string };
    email?: { subject: string; from_address: string };
}

export class TaskRelationsService {
    private supabase = createClient();

    async getRelations(taskId: string) {
        const { data, error } = await this.supabase
            .from('task_relations')
            .select('*')
            .eq('task_id', taskId);

        if (error) throw error;
        return data as TaskRelation[];
    }

    async addRelation(taskId: string, type: 'contact' | 'organization' | 'lead' | 'email', relatedId: string) {
        const { data, error } = await this.supabase
            .from('task_relations')
            .insert({
                task_id: taskId,
                related_type: type,
                related_id: relatedId
            })
            .select()
            .single();

        if (error) throw error;
        return data as TaskRelation;
    }

    async removeRelation(relationId: string) {
        const { error } = await this.supabase
            .from('task_relations')
            .delete()
            .eq('id', relationId);

        if (error) throw error;
    }

    // Get tasks for a specific entity (e.g., all tasks for Contact X)
    async getTasksForEntity(type: 'contact' | 'organization' | 'lead' | 'email', id: string) {
        const { data, error } = await this.supabase
            .from('task_relations')
            .select(`
                *,
                task:tasks(*)
            `)
            .eq('related_type', type)
            .eq('related_id', id);

        if (error) throw error;
        return data.map((r: any) => r.task);
    }
}

export const taskRelationsService = new TaskRelationsService();
