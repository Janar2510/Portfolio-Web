import { createClient } from '@/lib/supabase/client';
import { Person, PersonSchema } from '../schemas';
import { ICrmPicker, PersonPickerCreateSchema } from '../contracts';
import { crmEvents } from '../events';
import { z } from 'zod';

export class PeopleService implements ICrmPicker<Person, typeof PersonPickerCreateSchema> {
    private supabase = createClient();

    async getById(id: string): Promise<Person | null> {
        const { data, error } = await this.supabase
            .from('contacts')
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

    async search(query: string): Promise<Person[]> {
        const { data, error } = await this.supabase
            .from('contacts')
            .select('*')
            .ilike('name', `%${query}%`)
            .is('deleted_at', null)
            .limit(10);

        if (error) throw error;
        return z.array(PersonSchema).parse(data);
    }

    async selectExisting(id: string): Promise<Person | null> {
        return this.getById(id);
    }

    async createNew(data: z.infer<typeof PersonPickerCreateSchema>): Promise<Person> {
        const { data: user } = await this.supabase.auth.getUser();
        if (!user.user) throw new Error('Unauthorized');

        const newPerson = {
            ...data,
            user_id: user.user.id,
            owner_user_id: user.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data: created, error } = await this.supabase
            .from('contacts')
            .insert(newPerson)
            .select()
            .single();

        if (error) throw error;
        return PersonSchema.parse(created);
    }

    async update(id: string, updates: Partial<Person>): Promise<Person> {
        const { data, error } = await this.supabase
            .from('contacts')
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
        const { data, error } = await this.supabase
            .from('contacts')
            .select('*')
            .or(`primary_email.eq."${email}",additional_emails.cs.{"${email}"}`)
            .is('deleted_at', null)
            .maybeSingle();

        if (error) throw error;
        return data ? PersonSchema.parse(data) : null;
    }

    async softDelete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('contacts')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}

export const peopleService = new PeopleService();
