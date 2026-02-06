
import { createClient } from '@/lib/supabase/client';
import { Spreadsheet, CreateSpreadsheetDTO, UpdateSpreadsheetDTO } from '../types';

export class SpreadsheetsService {
    private supabase = createClient();

    async list(userId: string) {
        const { data, error } = await this.supabase
            .from('spreadsheets')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as Spreadsheet[];
    }

    async get(id: string) {
        const { data, error } = await this.supabase
            .from('spreadsheets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Spreadsheet;
    }

    async create(data: CreateSpreadsheetDTO) {
        const { data: user } = await this.supabase.auth.getUser();
        if (!user.user) throw new Error('Unauthorized');

        const { data: sheet, error } = await this.supabase
            .from('spreadsheets')
            .insert({
                ...data,
                user_id: user.user.id,
                columns: data.columns || [
                    { key: 'id', name: 'ID', width: 80 },
                    { key: 'title', name: 'Title', width: 200 }
                ],
                rows: data.rows || [
                    { id: 1, title: 'Example Row' }
                ]
            })
            .select()
            .single();

        if (error) throw error;
        return sheet as Spreadsheet;
    }

    async update(id: string, updates: UpdateSpreadsheetDTO) {
        const { data, error } = await this.supabase
            .from('spreadsheets')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Spreadsheet;
    }

    async delete(id: string) {
        const { error } = await this.supabase
            .from('spreadsheets')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}

export const spreadsheetsService = new SpreadsheetsService();
