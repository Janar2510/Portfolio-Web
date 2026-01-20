import { createClient } from '@/lib/supabase/server';

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  contact_id?: string;
  name: string;
  value?: number;
  stage: string;
  created_at: string;
  updated_at: string;
}

export class CRMService {
  private async getSupabase() {
    return await createClient();
  }

  async getContacts(): Promise<Contact[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createContact(contact: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
  }): Promise<Contact> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDeals(): Promise<Deal[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createDeal(deal: {
    name: string;
    contact_id?: string;
    value?: number;
    stage: string;
  }): Promise<Deal> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('deals')
      .insert(deal)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
