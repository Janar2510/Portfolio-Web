import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import {
    Automation,
    CreateAutomationDTO,
    UpdateAutomationDTO
} from '../types';
import { AutomationSchema } from '../schemas';

export class AutomationsService {
    private supabase = createClient();

    async getAll(projectId?: string): Promise<Automation[]> {
        let query = this.supabase
            .from('automations')
            .select('*')
            .order('created_at', { ascending: false });

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return z.array(AutomationSchema).parse(data || []);
    }

    async getById(id: string): Promise<Automation | null> {
        const { data, error } = await this.supabase
            .from('automations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return AutomationSchema.parse(data);
    }

    async create(data: CreateAutomationDTO): Promise<Automation> {
        const { data: userData } = await this.supabase.auth.getUser();
        if (!userData.user) throw new Error('Unauthorized');

        const { data: automation, error } = await this.supabase
            .from('automations')
            .insert({
                ...data,
                user_id: userData.user.id
            })
            .select()
            .single();

        if (error) throw error;
        return AutomationSchema.parse(automation);
    }

    async update(id: string, updates: UpdateAutomationDTO): Promise<Automation> {
        const { data, error } = await this.supabase
            .from('automations')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return AutomationSchema.parse(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('automations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async toggleActive(id: string, isActive: boolean): Promise<void> {
        await this.update(id, { is_active: isActive });
    }
}

export const automationsService = new AutomationsService();
