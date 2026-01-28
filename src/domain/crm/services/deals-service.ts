import { createClient } from '@/lib/supabase/client';
import { Deal, DealSchema } from '../schemas';
import { crmEvents } from '../events';

export class DealsService {
    private supabase = createClient();

    async getById(id: string): Promise<Deal | null> {
        const { data, error } = await this.supabase
            .from('deals')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return DealSchema.parse(data);
    }

    async create(data: Partial<Deal>): Promise<Deal> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const newDeal = {
            ...data,
            user_id: user.id,
            owner_user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data: created, error } = await this.supabase
            .from('deals')
            .insert(newDeal)
            .select()
            .single();

        if (error) throw error;
        const deal = DealSchema.parse(created);

        crmEvents.emitEvent({
            type: 'DEAL_UPDATED',
            payload: deal,
            timestamp: new Date().toISOString()
        });

        return deal;
    }

    async updateStage(id: string, stageId: string): Promise<void> {
        const { data, error } = await this.supabase
            .from('deals')
            .update({
                stage_id: stageId,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        crmEvents.emitEvent({
            type: 'DEAL_UPDATED',
            payload: DealSchema.parse(data),
            timestamp: new Date().toISOString()
        });
    }

    async updateStatus(id: string, status: 'won' | 'lost' | 'open', reason?: string): Promise<void> {
        const updates: any = {
            status,
            updated_at: new Date().toISOString()
        };

        if (status === 'won') updates.won_time = new Date().toISOString();
        if (status === 'lost') {
            updates.lost_time = new Date().toISOString();
            updates.lost_reason = reason;
        }

        const { data, error } = await this.supabase
            .from('deals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        crmEvents.emitEvent({
            type: 'DEAL_UPDATED',
            payload: DealSchema.parse(data),
            timestamp: new Date().toISOString()
        });
    }

    async softDelete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('deals')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}

export const dealsService = new DealsService();
