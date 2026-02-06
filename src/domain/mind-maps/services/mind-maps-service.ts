
import { createClient } from '@/lib/supabase/client';
import { MindMap, CreateMindMapDTO, UpdateMindMapDTO } from '../types';

export class MindMapsService {
    private supabase = createClient();

    async list(userId: string) {
        const { data, error } = await this.supabase
            .from('mind_maps')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as MindMap[];
    }

    async get(id: string) {
        const { data, error } = await this.supabase
            .from('mind_maps')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as MindMap;
    }

    async create(data: CreateMindMapDTO) {
        const { data: user } = await this.supabase.auth.getUser();
        if (!user.user) throw new Error('Unauthorized');

        const { data: map, error } = await this.supabase
            .from('mind_maps')
            .insert({
                ...data,
                user_id: user.user.id,
                nodes: data.nodes || [],
                edges: data.edges || []
            })
            .select()
            .single();

        if (error) throw error;
        return map as MindMap;
    }

    async update(id: string, updates: UpdateMindMapDTO) {
        const { data, error } = await this.supabase
            .from('mind_maps')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as MindMap;
    }

    async delete(id: string) {
        const { error } = await this.supabase
            .from('mind_maps')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}

export const mindMapsService = new MindMapsService();
