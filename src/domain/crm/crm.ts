import { createClient } from '@/lib/supabase/server';

export type CompanySize = 'small' | 'medium' | 'large' | 'enterprise';
export type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'task';

export type Visibility = 'owner' | 'team' | 'company';

export interface Company {
  id: string;
  user_id: string;
  owner_user_id: string;
  name: string;
  website: string | null;
  domain: string | null;
  industry: string | null;
  size: CompanySize | null;
  address: {
    street?: string;
    city?: string;
    country?: string;
    postal?: string;
  } | null;
  notes: string | null;
  custom_fields: Record<string, unknown>;
  visibility: Visibility;
  last_activity_at: string | null;
  next_activity_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  owner_user_id: string;
  company_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  primary_email: string | null;
  additional_emails: string[];
  phone: string | null;
  primary_phone: string | null;
  additional_phones: string[];
  job_title: string | null;
  avatar_url: string | null;
  social_links: {
    linkedin?: string;
    twitter?: string;
    [key: string]: string | undefined;
  };
  address: {
    street?: string;
    city?: string;
    country?: string;
    postal?: string;
  } | null;
  lead_source: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  visibility: Visibility;
  last_contacted_at: string | null;
  last_activity_at: string | null;
  next_activity_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  color: string | null;
  probability: number;
  is_won: boolean;
  is_lost: boolean;
  created_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  owner_user_id: string;
  contact_id: string | null;
  company_id: string | null;
  stage_id: string;
  title: string;
  value: number | null;
  currency: string;
  expected_close_date: string | null;
  actual_close_date: string | null;
  probability: number | null;
  notes: string | null;
  lost_reason: string | null;
  status: 'open' | 'won' | 'lost' | 'deleted';
  sort_order: number;
  visibility: Visibility;
  stage_entered_at: string | null;
  last_stage_id: string | null;
  is_locked: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMActivity {
  id: string;
  user_id: string;
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  activity_type: ActivityType;
  title: string | null;
  description: string | null;
  location: string | null;
  participants: Array<{ id: string; name: string }>;
  calendar_event_id: string | null;
  metadata: Record<string, unknown>;
  is_completed: boolean;
  due_date: string | null;
  completed_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface FollowUp {
  id: string;
  user_id: string;
  contact_id: string | null;
  deal_id: string | null;
  title: string;
  due_date: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface EmailLink {
  id: string;
  user_id: string;
  email_id: string;
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  entity_type: 'contact' | 'company' | 'deal' | 'activity' | 'email_link';
  entity_id: string;
  action: 'created' | 'updated' | 'deleted' | 'restored' | 'linked' | 'unlinked' | 'merged';
  changes: Record<string, any>;
  created_at: string;
}


export class CRMService {
  private async getSupabase() {
    return await createClient();
  }

  // Company methods
  async getCompanies(): Promise<Company[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getCompanyById(id: string): Promise<Company | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createCompany(company: {
    name: string;
    website?: string;
    industry?: string;
    size?: CompanySize;
    address?: Company['address'];
    notes?: string;
    custom_fields?: Record<string, unknown>;
  }): Promise<Company> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCompany(
    id: string,
    updates: {
      name?: string;
      website?: string;
      industry?: string;
      size?: CompanySize;
      address?: Company['address'];
      notes?: string;
      custom_fields?: Record<string, unknown>;
    }
  ): Promise<Company> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCompany(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from('companies').delete().eq('id', id);

    if (error) throw error;
  }

  // Contact methods
  async getContacts(filters?: {
    company_id?: string;
    tags?: string[];
    search?: string;
  }): Promise<Contact[]> {
    const supabase = await this.getSupabase();
    let query = supabase.from('contacts').select('*');

    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters?.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async getContactById(id: string): Promise<Contact | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createContact(contact: {
    company_id?: string;
    first_name: string;
    last_name?: string;
    email?: string;
    phone?: string;
    job_title?: string;
    avatar_url?: string;
    social_links?: Contact['social_links'];
    address?: Contact['address'];
    lead_source?: string;
    tags?: string[];
    custom_fields?: Record<string, unknown>;
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

  async updateContact(
    id: string,
    updates: {
      company_id?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      job_title?: string;
      avatar_url?: string;
      social_links?: Contact['social_links'];
      address?: Contact['address'];
      lead_source?: string;
      tags?: string[];
      custom_fields?: Record<string, unknown>;
    }
  ): Promise<Contact> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteContact(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from('contacts').delete().eq('id', id);

    if (error) throw error;
  }

  // Pipeline Stage methods
  async getPipelineStages(): Promise<PipelineStage[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createPipelineStage(stage: {
    name: string;
    sort_order?: number;
    color?: string;
    probability?: number;
    is_won?: boolean;
    is_lost?: boolean;
  }): Promise<PipelineStage> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('pipeline_stages')
      .insert(stage)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePipelineStage(
    id: string,
    updates: {
      name?: string;
      sort_order?: number;
      color?: string;
      probability?: number;
      is_won?: boolean;
      is_lost?: boolean;
    }
  ): Promise<PipelineStage> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('pipeline_stages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePipelineStage(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('pipeline_stages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async reorderPipelineStages(stageIds: string[]): Promise<void> {
    const supabase = await this.getSupabase();
    const updates = stageIds.map((id, index) =>
      supabase
        .from('pipeline_stages')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);
  }

  // Deal methods
  async getDeals(filters?: {
    stage_id?: string;
    contact_id?: string;
    company_id?: string;
  }): Promise<Deal[]> {
    const supabase = await this.getSupabase();
    let query = supabase.from('deals').select('*');

    if (filters?.stage_id) {
      query = query.eq('stage_id', filters.stage_id);
    }

    if (filters?.contact_id) {
      query = query.eq('contact_id', filters.contact_id);
    }

    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }

    const { data, error } = await query.order('sort_order', {
      ascending: true,
    });

    if (error) throw error;
    return data || [];
  }

  async getDealById(id: string): Promise<Deal | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createDeal(deal: {
    contact_id?: string;
    company_id?: string;
    stage_id: string;
    title: string;
    value?: number;
    currency?: string;
    expected_close_date?: string;
    probability?: number;
    notes?: string;
    sort_order?: number;
  }): Promise<Deal> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('deals')
      .insert({
        ...deal,
        currency: deal.currency || 'EUR',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDeal(
    id: string,
    updates: {
      contact_id?: string;
      company_id?: string;
      stage_id?: string;
      title?: string;
      value?: number;
      currency?: string;
      expected_close_date?: string;
      actual_close_date?: string;
      probability?: number;
      notes?: string;
      lost_reason?: string;
      sort_order?: number;
    }
  ): Promise<Deal> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDeal(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from('deals').delete().eq('id', id);

    if (error) throw error;
  }

  async moveDeal(
    dealId: string,
    stageId: string,
    sortOrder: number
  ): Promise<Deal> {
    return this.updateDeal(dealId, {
      stage_id: stageId,
      sort_order: sortOrder,
    });
  }

  // Activity methods
  async getActivities(filters?: {
    contact_id?: string;
    deal_id?: string;
    activity_type?: ActivityType;
  }): Promise<CRMActivity[]> {
    const supabase = await this.getSupabase();
    let query = supabase.from('crm_activities').select('*');

    if (filters?.contact_id) {
      query = query.eq('contact_id', filters.contact_id);
    }

    if (filters?.deal_id) {
      query = query.eq('deal_id', filters.deal_id);
    }

    if (filters?.activity_type) {
      query = query.eq('activity_type', filters.activity_type);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async createActivity(activity: {
    contact_id?: string;
    deal_id?: string;
    activity_type: ActivityType;
    title?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    is_completed?: boolean;
    due_date?: string;
  }): Promise<CRMActivity> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('crm_activities')
      .insert({
        ...activity,
        is_completed: activity.is_completed ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateActivity(
    id: string,
    updates: {
      activity_type?: ActivityType;
      title?: string;
      description?: string;
      metadata?: Record<string, unknown>;
      is_completed?: boolean;
      due_date?: string;
    }
  ): Promise<CRMActivity> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('crm_activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteActivity(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('crm_activities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Follow-up methods
  async getFollowUps(filters?: {
    contact_id?: string;
    deal_id?: string;
    is_completed?: boolean;
  }): Promise<FollowUp[]> {
    const supabase = await this.getSupabase();
    let query = supabase.from('follow_ups').select('*');

    if (filters?.contact_id) {
      query = query.eq('contact_id', filters.contact_id);
    }

    if (filters?.deal_id) {
      query = query.eq('deal_id', filters.deal_id);
    }

    if (filters?.is_completed !== undefined) {
      query = query.eq('is_completed', filters.is_completed);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createFollowUp(followUp: {
    contact_id?: string;
    deal_id?: string;
    title: string;
    due_date: string;
  }): Promise<FollowUp> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('follow_ups')
      .insert(followUp)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateFollowUp(
    id: string,
    updates: {
      title?: string;
      due_date?: string;
      is_completed?: boolean;
    }
  ): Promise<FollowUp> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('follow_ups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFollowUp(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from('follow_ups').delete().eq('id', id);

    if (error) throw error;
  }
}
