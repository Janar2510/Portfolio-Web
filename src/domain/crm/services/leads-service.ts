import { createClient } from '@/lib/supabase/client';
import { crmEvents } from '../events';
import { LeadSchema, Lead } from '../schemas';

export class LeadsService {
    private supabase = createClient();

    async getById(id: string): Promise<Lead | null> {
        const { data, error } = await this.supabase
            .from('crm_leads')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return LeadSchema.parse(data);
    }

    async create(data: Partial<Lead>): Promise<Lead> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const newLead = {
            ...data,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data: created, error } = await this.supabase
            .from('crm_leads')
            .insert(newLead)
            .select()
            .single();

        if (error) throw error;
        return LeadSchema.parse(created);
    }

    async convert(leadId: string, data: { deal_id?: string; person_id?: string; organization_id?: string }): Promise<void> {
        const { error } = await this.supabase
            .from('crm_leads')
            .update({
                status: 'converted',
                converted_at: new Date().toISOString(),
                converted_deal_id: data.deal_id,
                converted_person_id: data.person_id,
                converted_organization_id: data.organization_id,
                updated_at: new Date().toISOString()
            })
            .eq('id', leadId);

        if (error) throw error;

        crmEvents.emitEvent({
            type: 'LEAD_CONVERTED',
            payload: { leadId, ...data },
            timestamp: new Date().toISOString()
        });
    }

    async updateStatus(id: string, status: string): Promise<void> {
        const { error } = await this.supabase
            .from('crm_leads')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
    }
}

export const leadsService = new LeadsService();
