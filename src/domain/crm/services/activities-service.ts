import { createClient } from '@/lib/supabase/client';
import { Activity, ActivitySchema } from '../schemas';
import { crmEvents } from '../events';

export class ActivitiesService {
    private supabase = createClient();

    async getById(id: string): Promise<Activity | null> {
        const { data, error } = await this.supabase
            .from('crm_activities')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return ActivitySchema.parse(data);
    }

    async create(data: Partial<Activity>): Promise<Activity> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const newActivity = {
            ...data,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data: created, error } = await this.supabase
            .from('crm_activities')
            .insert(newActivity)
            .select()
            .single();

        if (error) throw error;
        return ActivitySchema.parse(created);
    }

    async markDone(id: string): Promise<void> {
        const { data, error } = await this.supabase
            .from('crm_activities')
            .update({
                is_done: true,
                done_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        crmEvents.emitEvent({
            type: 'ACTIVITY_COMPLETED',
            payload: ActivitySchema.parse(data),
            timestamp: new Date().toISOString()
        });
    }

    async softDelete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('crm_activities')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}

export const activitiesService = new ActivitiesService();
