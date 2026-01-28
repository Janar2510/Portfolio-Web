import { createClient } from '@/lib/supabase/client';
import { EmailLink, EmailLinkSchema } from '../schemas';

export class EmailLinkService {
    private supabase = createClient();

    async linkEmail(data: { email_id: string; contact_id?: string; company_id?: string; deal_id?: string }): Promise<EmailLink> {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const newLink = {
            ...data,
            user_id: user.id,
            created_at: new Date().toISOString(),
        };

        const { data: created, error } = await this.supabase
            .from('email_links')
            .insert(newLink)
            .select()
            .single();

        if (error) throw error;
        return EmailLinkSchema.parse(created);
    }

    async getLinksForEmail(emailId: string): Promise<EmailLink[]> {
        const { data, error } = await this.supabase
            .from('email_links')
            .select('*')
            .eq('email_id', emailId);

        if (error) throw error;
        return (data || []).map(link => EmailLinkSchema.parse(link));
    }
}

export const emailLinkService = new EmailLinkService();
