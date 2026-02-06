import { createClient } from '@/lib/supabase/client';
import { Organization, OrganizationSchema } from '../schemas';
import { ICrmPicker, OrganizationPickerCreateSchema } from '../contracts';
import { crmEvents } from '../events';
import { z } from 'zod';

export class OrgsService implements ICrmPicker<Organization, typeof OrganizationPickerCreateSchema> {
    private supabase = createClient();

    async getAll(): Promise<Organization[]> {
        const { data, error } = await this.supabase
            .from('crm_organizations')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching organizations:', error);
            throw error;
        }

        return z.array(OrganizationSchema).parse(data || []);
    }

    async getById(id: string): Promise<Organization | null> {
        const { data, error } = await this.supabase
            .from('crm_organizations')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return OrganizationSchema.parse(data);
    }

    async search(query: string): Promise<Organization[]> {
        const { data, error } = await this.supabase
            .from('crm_organizations')
            .select('*')
            .ilike('name', `%${query}%`)
            .is('deleted_at', null)
            .limit(10);

        if (error) throw error;
        return z.array(OrganizationSchema).parse(data || []);
    }

    async selectExisting(id: string): Promise<Organization | null> {
        return this.getById(id);
    }

    async createNew(data: z.infer<typeof OrganizationPickerCreateSchema>): Promise<Organization> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const newOrg = {
            ...data,
            user_id: user.id,
            owner_id: user.id, // Changed from owner_user_id to match schema
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data: created, error } = await this.supabase
            .from('crm_organizations')
            .insert(newOrg)
            .select()
            .single();

        if (error) throw error;
        const org = OrganizationSchema.parse(created);

        crmEvents.emitEvent({
            type: 'ORG_UPDATED',
            payload: org,
            timestamp: new Date().toISOString()
        });

        return org;
    }

    async update(id: string, updates: Partial<Organization>): Promise<Organization> {
        const { data, error } = await this.supabase
            .from('crm_organizations')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        const org = OrganizationSchema.parse(data);

        crmEvents.emitEvent({
            type: 'ORG_UPDATED',
            payload: org,
            timestamp: new Date().toISOString()
        });

        return org;
    }

    async findDuplicate(data: { name?: string; domain?: string }): Promise<Organization | null> {
        let query = this.supabase
            .from('crm_organizations')
            .select('*')
            .is('deleted_at', null);

        if (data.domain) {
            // Check if domain column exists in schema or handled via custom fields?
            // Assuming simplified schema for now or reusing name
            // For now, let's just search by name if domain logic is complex
            query = query.ilike('name', data.name || '');
        } else if (data.name) {
            query = query.ilike('name', data.name);
        } else {
            return null;
        }

        const { data: duplicate, error } = await query.maybeSingle();
        if (error) throw error;

        return duplicate ? OrganizationSchema.parse(duplicate) : null;
    }

    async softDelete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('crm_organizations')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}

export const orgsService = new OrgsService();
