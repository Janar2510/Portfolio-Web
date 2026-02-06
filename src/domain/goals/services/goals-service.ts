import { createClient } from '@/lib/supabase/client';
import {
    GoalSchema,
    KeyResultSchema
} from '../schemas';
import {
    Goal,
    CreateGoalDTO,
    UpdateGoalDTO,
    KeyResult,
    CreateKeyResultDTO,
    UpdateKeyResultDTO
} from '../types';
import { z } from 'zod';

export class GoalsService {
    private supabase = createClient();

    // Goals

    async getAll(projectId?: string): Promise<Goal[]> {
        let query = this.supabase
            .from('goals')
            .select('*')
            .is('deleted_at', null)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return z.array(GoalSchema).parse(data || []);
    }

    async getById(id: string): Promise<Goal> {
        const { data, error } = await this.supabase
            .from('goals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return GoalSchema.parse(data);
    }

    async create(data: CreateGoalDTO): Promise<Goal> {
        const { data: userData } = await this.supabase.auth.getUser();
        if (!userData.user) throw new Error('Unauthorized');

        const { data: goal, error } = await this.supabase
            .from('goals')
            .insert({
                ...data,
                user_id: userData.user.id
            })
            .select()
            .single();

        if (error) throw error;
        return GoalSchema.parse(goal);
    }

    async update(id: string, updates: UpdateGoalDTO): Promise<Goal> {
        const { data, error } = await this.supabase
            .from('goals')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return GoalSchema.parse(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('goals')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // Key Results

    async getKeyResults(goalId: string): Promise<KeyResult[]> {
        const { data, error } = await this.supabase
            .from('key_results')
            .select('*')
            .eq('goal_id', goalId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return z.array(KeyResultSchema).parse(data || []);
    }

    async createKeyResult(data: CreateKeyResultDTO): Promise<KeyResult> {
        const { data: kr, error } = await this.supabase
            .from('key_results')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return KeyResultSchema.parse(kr);
    }

    async updateKeyResult(id: string, updates: UpdateKeyResultDTO): Promise<KeyResult> {
        const { data, error } = await this.supabase
            .from('key_results')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return KeyResultSchema.parse(data);
    }

    async deleteKeyResult(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('key_results')
            .delete() // Hard delete for key results typically fine, or added soft delete
            .eq('id', id);

        if (error) throw error;
    }
}

export const goalsService = new GoalsService();
