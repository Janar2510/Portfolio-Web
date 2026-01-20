import { createClient } from '@/lib/supabase/server';

export type EmailProvider = 'outlook' | 'apple';
export type EmailDirection = 'inbound' | 'outbound';

export interface EmailAccount {
  id: string;
  user_id: string;
  provider: EmailProvider;
  email_address: string;
  display_name: string | null;
  credentials_encrypted: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  sync_state: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  account_id: string;
  external_id: string;
  thread_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  direction: EmailDirection;
  subject: string | null;
  body_preview: string | null;
  body_html: string | null;
  from_address: string;
  to_addresses: string[];
  cc_addresses: string[] | null;
  has_attachments: boolean;
  sent_at: string;
  received_at: string | null;
  is_read: boolean;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body_html: string;
  variables: string[];
  category: string | null;
  created_at: string;
  updated_at: string;
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

  // Account methods
  async getAccounts(): Promise<EmailAccount[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('email_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAccountById(id: string): Promise<EmailAccount | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async connectAccount(
    provider: EmailProvider,
    emailAddress: string,
    displayName: string | null,
    credentialsEncrypted: string
  ): Promise<EmailAccount> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('email_accounts')
      .insert({
        provider,
        email_address: emailAddress,
        display_name: displayName,
        credentials_encrypted: credentialsEncrypted,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAccount(
    id: string,
    updates: {
      display_name?: string;
      credentials_encrypted?: string;
      is_active?: boolean;
      last_sync_at?: string;
      sync_state?: Record<string, unknown>;
    }
  ): Promise<EmailAccount> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('email_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAccount(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('email_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Email methods
  async getEmails(accountId: string, filters?: {
    direction?: EmailDirection;
    contact_id?: string;
    deal_id?: string;
    thread_id?: string;
    is_read?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ emails: Email[]; total: number }> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('emails')
      .select('*', { count: 'exact' })
      .eq('account_id', accountId);

    if (filters?.direction) {
      query = query.eq('direction', filters.direction);
    }

    if (filters?.contact_id) {
      query = query.eq('contact_id', filters.contact_id);
    }

    if (filters?.deal_id) {
      query = query.eq('deal_id', filters.deal_id);
    }

    if (filters?.thread_id) {
      query = query.eq('thread_id', filters.thread_id);
    }

    if (filters?.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }

    query = query.order('sent_at', { ascending: false });

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
    return { emails: data || [], total: count || 0 };
  }

  async getEmailById(id: string): Promise<Email | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async getEmailThread(threadId: string): Promise<Email[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('thread_id', threadId)
      .order('sent_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createEmail(email: {
    account_id: string;
    external_id: string;
    thread_id?: string;
    contact_id?: string;
    deal_id?: string;
    direction: EmailDirection;
    subject?: string;
    body_preview?: string;
    body_html?: string;
    from_address: string;
    to_addresses: string[];
    cc_addresses?: string[];
    has_attachments?: boolean;
    sent_at: string;
    received_at?: string;
    is_read?: boolean;
  }): Promise<Email> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('emails')
      .insert(email)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEmail(
    id: string,
    updates: {
      contact_id?: string;
      deal_id?: string;
      is_read?: boolean;
    }
  ): Promise<Email> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('emails')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async markAsRead(id: string): Promise<Email> {
    return this.updateEmail(id, { is_read: true });
  }

  async markAsUnread(id: string): Promise<Email> {
    return this.updateEmail(id, { is_read: false });
  }

  async linkToContact(emailId: string, contactId: string): Promise<Email> {
    return this.updateEmail(emailId, { contact_id: contactId });
  }

  async linkToDeal(emailId: string, dealId: string): Promise<Email> {
    return this.updateEmail(emailId, { deal_id: dealId });
  }

  async deleteEmail(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from('emails').delete().eq('id', id);

    if (error) throw error;
  }

  // Template methods
  async getTemplates(filters?: {
    category?: string;
    search?: string;
  }): Promise<EmailTemplate[]> {
    const supabase = await this.getSupabase();
    let query = supabase.from('email_templates').select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createTemplate(template: {
    name: string;
    subject: string;
    body_html: string;
    variables?: string[];
    category?: string;
  }): Promise<EmailTemplate> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('email_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTemplate(
    id: string,
    updates: {
      name?: string;
      subject?: string;
      body_html?: string;
      variables?: string[];
      category?: string;
    }
  ): Promise<EmailTemplate> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTemplate(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async renderTemplate(
    templateId: string,
    variables: Record<string, string>
  ): Promise<{ subject: string; body_html: string }> {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    let subject = template.subject;
    let body_html = template.body_html;

    // Replace variables in subject and body
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      body_html = body_html.replace(new RegExp(placeholder, 'g'), value);
    }

    return { subject, body_html };
  }
}
