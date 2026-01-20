import { createClient } from '@/lib/supabase/server';

export type EmailProvider = 'outlook' | 'apple';

export interface EmailAccount {
  id: string;
  user_id: string;
  provider: EmailProvider;
  email: string;
  access_token?: string;
  refresh_token?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailMessage {
  id: string;
  account_id: string;
  subject: string;
  from: string;
  to: string[];
  body: string;
  received_at: string;
}

export interface OAuthCredentials {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export class EmailService {
  private async getSupabase() {
    return await createClient();
  }

  async getAccounts(): Promise<EmailAccount[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('email_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async connectAccount(
    provider: EmailProvider,
    credentials: OAuthCredentials
  ): Promise<EmailAccount> {
    const supabase = await this.getSupabase();
    // In a real implementation, you would fetch user email from the provider
    const { data, error } = await supabase
      .from('email_accounts')
      .insert({
        provider,
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMessages(accountId: string, filters?: {
    limit?: number;
    offset?: number;
  }): Promise<{ messages: EmailMessage[]; total: number }> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('email_messages')
      .select('*', { count: 'exact' })
      .eq('account_id', accountId)
      .order('received_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { messages: data || [], total: count || 0 };
  }
}
