
import { createClient } from '@/lib/supabase/client';
import { Notification, CreateNotificationDTO } from '../types';

export class NotificationsService {
    private supabase = createClient();

    async list(userId: string, limit = 20) {
        const { data, error } = await this.supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as Notification[];
    }

    async getUnreadCount(userId: string) {
        const { count, error } = await this.supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    }

    async markAsRead(id: string) {
        const { error } = await this.supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    }

    async markAllAsRead(userId: string) {
        const { error } = await this.supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
    }

    async create(notification: CreateNotificationDTO) {
        const { error } = await this.supabase
            .from('notifications')
            .insert(notification);

        if (error) {
            console.error('Failed to create notification', error);
            // Don't throw to avoid blocking the main action
        }
    }
}

export const notificationsService = new NotificationsService();
