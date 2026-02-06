import { createClient } from '@/lib/supabase/client';
import { crmEvents } from '../events';
import { LeadSchema, Lead } from '../schemas';
import { z } from 'zod';

export class LeadsService {
    private supabase = createClient();

    async getAll(): Promise<Lead[]> {
        const { data: { user } } = await this.supabase.auth.getUser();
        console.log('Fetching leads for user:', user?.id);

        const { data, error } = await this.supabase
            .from('crm_leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching leads from crm_leads:', error);
            throw error;
        }

        console.log('Raw leads data from DB:', data);

        try {
            return z.array(LeadSchema).parse(data || []) as any;
        } catch (e) {
            console.error('Schema validation error for leads:', e, data);
            return (data || []) as any;
        }
    }

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
        };

        const { data: created, error } = await this.supabase
            .from('crm_leads')
            .insert(newLead)
            .select()
            .single();

        if (error) {
            console.error('Error creating lead in crm_leads:', error);
            throw error;
        }

        return LeadSchema.parse(created);
    }

    async qualifyLead(leadId: string, data: {
        person_name?: string;
        organization_name?: string;
        email?: string;
        phone?: string;
    }): Promise<{ person_id?: string; organization_id?: string }> {
        const lead = await this.getById(leadId);
        if (!lead) throw new Error('Lead not found');

        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        let person_id = lead.converted_person_id || undefined;
        let organization_id = lead.converted_organization_id || undefined;

        // Verify that the linked IDs actually exist in the database
        if (person_id) {
            const { error } = await this.supabase.from('crm_persons').select('id').eq('id', person_id).single();
            if (error) {
                console.warn('Linked person not found, resetting ID to allow re-creation:', person_id);
                person_id = undefined;
            }
        }
        if (organization_id) {
            const { error } = await this.supabase.from('crm_organizations').select('id').eq('id', organization_id).single();
            if (error) {
                console.warn('Linked organization not found, resetting ID to allow re-creation:', organization_id);
                organization_id = undefined;
            }
        }

        // 1. Handle Organization
        if (!organization_id && data.organization_name) {
            const { data: org, error: orgError } = await this.supabase
                .from('crm_organizations')
                .insert({
                    name: data.organization_name,
                    user_id: user.id
                })
                .select()
                .single();
            if (!orgError) organization_id = org.id;
        }

        // 2. Handle Person
        if (!person_id && (data.person_name || lead.email || data.email)) {
            const fullName = data.person_name || lead.email || 'Untitled Person';
            const nameParts = fullName.trim().split(/\s+/);
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

            const emails = data.email ? [{ value: data.email, label: 'work', primary: true }] :
                lead.email ? [{ value: lead.email, label: 'work', primary: true }] : [];
            const phones = data.phone ? [{ value: data.phone, label: 'work', primary: true }] :
                lead.phone ? [{ value: lead.phone, label: 'work', primary: true }] : [];

            const { data: person, error: personError } = await this.supabase
                .from('crm_persons')
                .insert({
                    name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                    organization_id: organization_id,
                    user_id: user.id,
                    emails: emails,
                    phones: phones
                })
                .select()
                .single();
            if (personError) {
                console.error('Error creating person during conversion:', personError);
                throw new Error(`Failed to create contact: ${personError.message}`);
            }
            person_id = person.id;
        }

        // 3. Update Lead Status
        await this.supabase
            .from('crm_leads')
            .update({
                status: 'qualified',
                converted_person_id: person_id,
                converted_organization_id: organization_id,
                updated_at: new Date().toISOString()
            })
            .eq('id', leadId);

        return { person_id, organization_id };
    }

    async convertToDeal(leadId: string, data: {
        pipeline_id: string;
        stage_id: string;
        title: string;
        value?: number;
        person_name?: string;
        organization_name?: string;
        person_id?: string;
        organization_id?: string;
        custom_fields?: Record<string, any>;
    }): Promise<void> {
        const lead = await this.getById(leadId);
        if (!lead) throw new Error('Lead not found');

        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        let person_id = data.person_id || lead.converted_person_id || undefined;
        let organization_id = data.organization_id || lead.converted_organization_id || undefined;

        // 1. Handle Organization if ID missing but name provided
        if (!organization_id && data.organization_name) {
            const { data: org, error: orgError } = await this.supabase
                .from('crm_organizations')
                .insert({
                    name: data.organization_name,
                    user_id: user.id
                })
                .select()
                .single();
            if (!orgError) organization_id = org.id;
        }

        // 2. Handle Person if ID missing but name provided
        if (!person_id && (data.person_name || lead.email)) {
            const fullName = data.person_name || lead.email || 'Untitled Person';
            const nameParts = fullName.trim().split(/\s+/);
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

            const { data: person, error: personError } = await this.supabase
                .from('crm_persons')
                .insert({
                    name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                    organization_id: organization_id,
                    user_id: user.id,
                })
                .select()
                .single();
            if (!personError) person_id = person.id;
        }

        // 3. Create Deal
        const { data: deal, error: dealError } = await this.supabase
            .from('crm_deals')
            .insert({
                title: data.title,
                value: data.value || 0,
                currency: lead.currency || 'EUR',
                pipeline_id: data.pipeline_id,
                stage_id: data.stage_id,
                person_id: person_id,
                organization_id: organization_id,
                user_id: user.id,
                status: 'open',
                stage_entered_at: new Date().toISOString(),
                custom_fields: data.custom_fields || {},
            })
            .select()
            .single();

        if (dealError) throw dealError;

        // 2. Update Lead Status to 'converted'
        await this.supabase
            .from('crm_leads')
            .update({
                status: 'converted',
                converted_at: new Date().toISOString(),
                converted_deal_id: deal.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', leadId);

        crmEvents.emitEvent({
            type: 'LEAD_CONVERTED',
            payload: { leadId, dealId: deal.id },
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

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('crm_leads')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
}

export const leadsService = new LeadsService();
