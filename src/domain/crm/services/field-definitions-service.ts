import { createClient } from '@/lib/supabase/client';
import { CustomFieldDefinition, EntityType } from '../types';
import { crmEvents } from '../events';

export class FieldDefinitionsService {
    private supabase = createClient();

    async getAll(): Promise<CustomFieldDefinition[]> {
        const { data, error } = await this.supabase
            .from('crm_field_definitions')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching field definitions:', error);
            throw error;
        }

        // Parse options if stored as string, though supabase client usually handles jsonb
        return (data || []).map(item => ({
            ...item,
            // Ensure options is array even if null
            options: item.options || []
        })) as CustomFieldDefinition[];
    }

    async getByEntity(entityType: EntityType): Promise<CustomFieldDefinition[]> {
        const { data, error } = await this.supabase
            .from('crm_field_definitions')
            .select('*')
            .eq('entity_type', entityType)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data || []) as CustomFieldDefinition[];
    }

    async create(data: Partial<CustomFieldDefinition>): Promise<CustomFieldDefinition> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const newField = {
            ...data,
            user_id: user.id,
            options: data.options || [], // Ensure JSON-compatible

            // Defaults
            is_required: data.is_required ?? false,
            is_searchable: data.is_searchable ?? true,
            is_visible_in_list: data.is_visible_in_list ?? true,
            is_visible_in_detail: data.is_visible_in_detail ?? true,
            sort_order: data.sort_order ?? 0,
            is_system: false,
            field_group: data.field_group || 'custom',
        };

        const { data: created, error } = await this.supabase
            .from('crm_field_definitions')
            .insert(newField)
            .select()
            .single();

        if (error) throw error;
        const field = created as CustomFieldDefinition;

        crmEvents.emitEvent({
            type: 'FIELD_UPDATED', // Or created
            payload: field,
            timestamp: new Date().toISOString()
        });

        return field;
    }

    async update(id: string, updates: Partial<CustomFieldDefinition>): Promise<CustomFieldDefinition> {
        const { data, error } = await this.supabase
            .from('crm_field_definitions')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        const field = data as CustomFieldDefinition;

        crmEvents.emitEvent({
            type: 'FIELD_UPDATED',
            payload: field,
            timestamp: new Date().toISOString()
        });

        return field;
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('crm_field_definitions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Emitting event might be useful if we cache fields
        crmEvents.emitEvent({
            type: 'FIELD_DELETED' as any, // Need to genericize event type or add FIELD_DELETED
            payload: { id } as any,
            timestamp: new Date().toISOString()
        });
    }
}

export const fieldDefinitionsService = new FieldDefinitionsService();
