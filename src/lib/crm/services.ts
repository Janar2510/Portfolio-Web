import { createClient } from '@/lib/supabase/client';
import {
    Person,
    PersonSchema,
    Organization,
    OrganizationSchema
} from '@portfolio/shared';
import { z } from 'zod';

export class OrgsService {
    private supabase = createClient();

    async create(data: Partial<Organization>): Promise<Organization> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { data: created, error } = await this.supabase
            .from('companies')
            .insert({
                ...data,
                user_id: user.id,
                owner_user_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        return OrganizationSchema.parse(created);
    }

    async update(id: string, updates: Partial<Organization>): Promise<Organization> {
        const { data: updated, error } = await this.supabase
            .from('companies')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return OrganizationSchema.parse(updated);
    }

    async getById(id: string): Promise<Organization | null> {
        const { data, error } = await this.supabase
            .from('companies')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();

        if (error) throw error;
        return data ? OrganizationSchema.parse(data) : null;
    }

    async search(query: string, limit = 10): Promise<Organization[]> {
        const { data, error } = await this.supabase
            .from('companies')
            .select('*')
            .ilike('name', `%${query}%`)
            .is('deleted_at', null)
            .limit(limit);

        if (error) throw error;
        return z.array(OrganizationSchema).parse(data || []);
    }
}

export class PeopleService {
    private supabase = createClient();

    async create(data: Partial<Person>): Promise<Person> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const { data: created, error } = await this.supabase
            .from('contacts')
            .insert({
                ...data,
                user_id: user.id,
                owner_user_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        return PersonSchema.parse(created);
    }

    async update(id: string, updates: Partial<Person>): Promise<Person> {
        const { data: updated, error } = await this.supabase
            .from('contacts')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return PersonSchema.parse(updated);
    }

    async getById(id: string): Promise<Person | null> {
        const { data, error } = await this.supabase
            .from('contacts')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();

        if (error) throw error;
        return data ? PersonSchema.parse(data) : null;
    }

    async search(query: string, limit = 10): Promise<Person[]> {
        const { data, error } = await this.supabase
            .from('contacts')
            .select('*')
            .ilike('name', `%${query}%`)
            .is('deleted_at', null)
            .limit(limit);

        if (error) throw error;
        return z.array(PersonSchema).parse(data || []);
    }
}

export const orgsService = new OrgsService();
export const peopleService = new PeopleService();
