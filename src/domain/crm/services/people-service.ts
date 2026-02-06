import { createClient } from '@/lib/supabase/client';
import { Person, PersonSchema } from '../schemas';
import { ICrmPicker, PersonPickerCreateSchema } from '../contracts';
import { crmEvents } from '../events';
import { z } from 'zod';

export class PeopleService implements ICrmPicker<Person, typeof PersonPickerCreateSchema> {
    private supabase = createClient();

    async getById(id: string): Promise<Person | null> {
        const { data, error } = await this.supabase
            .from('crm_persons')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return PersonSchema.parse(data);
    }

    async getAll(): Promise<Person[]> {
        const { data, error } = await this.supabase
            .from('crm_persons')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching persons:', error);
            throw error;
        }
        console.log('Fetched persons raw data:', data);
        try {
            return z.array(PersonSchema).parse(data || []);
        } catch (e) {
            console.error('Schema parsing error for persons:', e);
            throw e;
        }
    }

    async search(query: string): Promise<Person[]> {
        const { data, error } = await this.supabase
            .from('crm_persons')
            .select('*')
            .ilike('name', `%${query}%`)
            .is('deleted_at', null)
            .limit(10);

        if (error) throw error;
        return z.array(PersonSchema).parse(data || []);
    }

    async selectExisting(id: string): Promise<Person | null> {
        return this.getById(id);
    }

    async createNew(data: z.infer<typeof PersonPickerCreateSchema>): Promise<Person> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const newPerson = {
            ...data,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Untitled',
            user_id: user.id,
            owner_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data: created, error } = await this.supabase
            .from('crm_persons')
            .insert(newPerson)
            .select()
            .single();

        if (error) throw error;
        return PersonSchema.parse(created);
    }

    async update(id: string, updates: Partial<Person>): Promise<Person> {
        const { data, error } = await this.supabase
            .from('crm_persons')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return PersonSchema.parse(data);
    }

    async findDuplicate(email: string): Promise<Person | null> {
        // Query jsonb 'emails' column array for object with value == email
        const { data, error } = await this.supabase
            .from('crm_persons')
            .select('*')
            .is('deleted_at', null)
            // This assumes emails is a JSONB array of objects like [{value: '...'}, ...]
            // "emails" @> '[{"value": "email"}]'
            .contains('emails', [{ value: email }])
            .maybeSingle();

        if (error) throw error;
        return data ? PersonSchema.parse(data) : null;
    }

    async softDelete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('crm_persons')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}

export const peopleService = new PeopleService();
