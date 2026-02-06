
import { createClient } from '@/lib/supabase/client';
import { Document, CreateDocumentDTO, UpdateDocumentDTO } from '../types';

export class DocumentsService {
    private supabase = createClient();

    async list(userId: string) {
        const { data, error } = await this.supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as Document[];
    }

    async get(id: string) {
        const { data, error } = await this.supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Document;
    }

    async create(data: CreateDocumentDTO) {
        const { data: user } = await this.supabase.auth.getUser();
        if (!user.user) throw new Error('Unauthorized');

        const { data: doc, error } = await this.supabase
            .from('documents')
            .insert({
                ...data,
                user_id: user.user.id
            })
            .select()
            .single();

        if (error) throw error;
        return doc as Document;
    }

    async update(id: string, updates: UpdateDocumentDTO) {
        const { data, error } = await this.supabase
            .from('documents')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Document;
    }

    async delete(id: string) {
        const { error } = await this.supabase
            .from('documents')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}

export const documentsService = new DocumentsService();
