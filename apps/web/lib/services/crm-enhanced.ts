import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Organization,
  Person,
  Pipeline,
  PipelineStage,
  Deal,
  Product,
  DealProduct,
  Activity,
  Lead,
  Label as LabelType,
  Note,
  CrmFile,
  Filter,
  Goal,
  Workflow,
  CustomFieldDefinition,
} from '@/lib/crm/types';

export class CRMEnhancedService {
  constructor(private supabase: SupabaseClient) {}

  // ===========================================
  // ORGANIZATIONS
  // ===========================================

  async getOrganizations(): Promise<Organization[]> {
    const { data, error } = await this.supabase
      .from('crm_organizations')
      .select('*')
      .eq('is_deleted', false)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    const { data, error } = await this.supabase
      .from('crm_organizations')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createOrganization(org: {
    name: string;
    address?: Organization['address'];
    label_ids?: string[];
    owner_id?: string;
    custom_fields?: Record<string, unknown>;
    visible_to?: 'owner' | 'team' | 'everyone';
  }): Promise<Organization> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('crm_organizations')
      .insert({
        user_id: user.id,
        ...org,
        address: org.address || {},
        label_ids: org.label_ids || [],
        custom_fields: org.custom_fields || {},
        visible_to: org.visible_to || 'owner',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOrganization(
    id: string,
    updates: Partial<Organization>
  ): Promise<Organization> {
    const { data, error } = await this.supabase
      .from('crm_organizations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteOrganization(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_organizations')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }

  // ===========================================
  // PERSONS
  // ===========================================

  async getPersons(filters?: {
    organization_id?: string;
    label_ids?: string[];
    search?: string;
  }): Promise<Person[]> {
    let query = this.supabase
      .from('crm_persons')
      .select('*')
      .eq('is_deleted', false);

    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    if (filters?.label_ids && filters.label_ids.length > 0) {
      query = query.overlaps('label_ids', filters.label_ids);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async getPersonById(id: string): Promise<Person | null> {
    const { data, error } = await this.supabase
      .from('crm_persons')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createPerson(person: {
    name: string;
    first_name?: string;
    last_name?: string;
    organization_id?: string;
    job_title?: string;
    emails?: Array<{ value: string; label: string; primary: boolean }>;
    phones?: Array<{ value: string; label: string; primary: boolean }>;
    label_ids?: string[];
    owner_id?: string;
    custom_fields?: Record<string, unknown>;
    avatar_url?: string;
  }): Promise<Person> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('crm_persons')
      .insert({
        user_id: user.id,
        ...person,
        emails: person.emails || [],
        phones: person.phones || [],
        label_ids: person.label_ids || [],
        custom_fields: person.custom_fields || {},
        visible_to: 'owner',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    const { data, error } = await this.supabase
      .from('crm_persons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePerson(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_persons')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }

  // ===========================================
  // PIPELINES
  // ===========================================

  async getPipelines(): Promise<Pipeline[]> {
    const { data, error } = await this.supabase
      .from('crm_pipelines')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPipelineById(id: string): Promise<Pipeline | null> {
    const { data, error } = await this.supabase
      .from('crm_pipelines')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createPipeline(pipeline: {
    name: string;
    name_et?: string;
    is_active?: boolean;
    is_default?: boolean;
    deal_probability_enabled?: boolean;
    sort_order?: number;
  }): Promise<Pipeline> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('crm_pipelines')
      .insert({
        user_id: user.id,
        ...pipeline,
        is_active: pipeline.is_active ?? true,
        is_default: pipeline.is_default ?? false,
        deal_probability_enabled: pipeline.deal_probability_enabled ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePipeline(
    id: string,
    updates: Partial<Pipeline>
  ): Promise<Pipeline> {
    const { data, error } = await this.supabase
      .from('crm_pipelines')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePipeline(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_pipelines')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===========================================
  // PIPELINE STAGES
  // ===========================================

  async getPipelineStages(pipelineId?: string): Promise<PipelineStage[]> {
    let query = this.supabase.from('crm_pipeline_stages').select('*');

    if (pipelineId) {
      query = query.eq('pipeline_id', pipelineId);
    }

    const { data, error } = await query.order('sort_order', {
      ascending: true,
    });

    if (error) throw error;
    return data || [];
  }

  async createPipelineStage(stage: {
    pipeline_id: string;
    name: string;
    name_et?: string;
    sort_order?: number;
    probability?: number;
    rotten_days?: number;
    rotten_flag?: boolean;
    stage_type?: 'normal' | 'won' | 'lost';
  }): Promise<PipelineStage> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('crm_pipeline_stages')
      .insert({
        user_id: user.id,
        ...stage,
        sort_order: stage.sort_order ?? 0,
        probability: stage.probability ?? 0,
        rotten_flag: stage.rotten_flag ?? true,
        stage_type: stage.stage_type || 'normal',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePipelineStage(
    id: string,
    updates: Partial<PipelineStage>
  ): Promise<PipelineStage> {
    const { data, error } = await this.supabase
      .from('crm_pipeline_stages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePipelineStage(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_pipeline_stages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async reorderPipelineStages(stageIds: string[]): Promise<void> {
    const updates = stageIds.map((id, index) =>
      this.supabase
        .from('crm_pipeline_stages')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);
  }

  // ===========================================
  // DEALS
  // ===========================================

  async getDeals(filters?: {
    pipeline_id?: string;
    stage_id?: string;
    person_id?: string;
    organization_id?: string;
    status?: 'open' | 'won' | 'lost';
    label_ids?: string[];
  }): Promise<Deal[]> {
    let query = this.supabase
      .from('crm_deals')
      .select('*')
      .eq('is_deleted', false);

    if (filters?.pipeline_id) {
      query = query.eq('pipeline_id', filters.pipeline_id);
    }

    if (filters?.stage_id) {
      query = query.eq('stage_id', filters.stage_id);
    }

    if (filters?.person_id) {
      query = query.eq('person_id', filters.person_id);
    }

    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.label_ids && filters.label_ids.length > 0) {
      query = query.overlaps('label_ids', filters.label_ids);
    }

    const { data, error } = await query.order('stage_order', {
      ascending: true,
    });

    if (error) throw error;
    return data || [];
  }

  async getDealById(id: string): Promise<Deal | null> {
    const { data, error } = await this.supabase
      .from('crm_deals')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async createDeal(deal: {
    pipeline_id: string;
    stage_id: string;
    title: string;
    value?: number;
    currency?: string;
    person_id?: string;
    organization_id?: string;
    expected_close_date?: string;
    probability?: number;
    owner_id?: string;
    label_ids?: string[];
    custom_fields?: Record<string, unknown>;
    stage_order?: number;
  }): Promise<Deal> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('crm_deals')
      .insert({
        user_id: user.id,
        ...deal,
        currency: deal.currency || 'EUR',
        status: 'open',
        label_ids: deal.label_ids || [],
        custom_fields: deal.custom_fields || {},
        visible_to: 'owner',
        stage_order: deal.stage_order ?? 0,
        stage_entered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    const { data, error } = await this.supabase
      .from('crm_deals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDeal(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_deals')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        status: 'deleted',
      })
      .eq('id', id);

    if (error) throw error;
  }

  async moveDeal(
    dealId: string,
    stageId: string,
    stageOrder: number
  ): Promise<Deal> {
    return this.updateDeal(dealId, {
      stage_id: stageId,
      stage_order: stageOrder,
      stage_entered_at: new Date().toISOString(),
    });
  }

  async markDealWon(dealId: string, wonTime?: string): Promise<Deal> {
    return this.updateDeal(dealId, {
      status: 'won',
      won_time: wonTime || new Date().toISOString(),
      close_time: new Date().toISOString(),
      probability: 100,
    });
  }

  async markDealLost(dealId: string, lostReason?: string): Promise<Deal> {
    return this.updateDeal(dealId, {
      status: 'lost',
      lost_time: new Date().toISOString(),
      lost_reason: lostReason,
    });
  }

  // ===========================================
  // PRODUCTS
  // ===========================================

  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('crm_products')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createProduct(product: {
    name: string;
    code?: string;
    description?: string;
    unit_price?: number;
    currency?: string;
    unit?: string;
    tax_percentage?: number;
    category?: string;
    custom_fields?: Record<string, unknown>;
  }): Promise<Product> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('crm_products')
      .insert({
        user_id: user.id,
        ...product,
        currency: product.currency || 'EUR',
        unit: product.unit || 'unit',
        tax_percentage: product.tax_percentage ?? 0,
        is_active: true,
        custom_fields: product.custom_fields || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===========================================
  // DEAL PRODUCTS
  // ===========================================

  async getDealProducts(dealId: string): Promise<DealProduct[]> {
    const { data, error } = await this.supabase
      .from('crm_deal_products')
      .select('*')
      .eq('deal_id', dealId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async addProductToDeal(product: {
    deal_id: string;
    product_id?: string;
    name: string;
    unit_price: number;
    quantity?: number;
    discount_percentage?: number;
    tax_percentage?: number;
    comments?: string;
  }): Promise<DealProduct> {
    const quantity = product.quantity ?? 1;
    const discount = product.discount_percentage ?? 0;
    const tax = product.tax_percentage ?? 0;
    const subtotal = product.unit_price * quantity;
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (tax / 100);
    const sum = afterDiscount + taxAmount;

    const { data, error } = await this.supabase
      .from('crm_deal_products')
      .insert({
        ...product,
        quantity,
        discount_percentage: discount,
        tax_percentage: tax,
        sum,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===========================================
  // ACTIVITIES
  // ===========================================

  async getActivities(filters?: {
    deal_id?: string;
    person_id?: string;
    organization_id?: string;
    activity_type?: Activity['activity_type'];
    is_done?: boolean;
  }): Promise<Activity[]> {
    let query = this.supabase.from('crm_activities_enhanced').select('*');

    if (filters?.deal_id) {
      query = query.eq('deal_id', filters.deal_id);
    }

    if (filters?.person_id) {
      query = query.eq('person_id', filters.person_id);
    }

    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    if (filters?.activity_type) {
      query = query.eq('activity_type', filters.activity_type);
    }

    if (filters?.is_done !== undefined) {
      query = query.eq('is_done', filters.is_done);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async createActivity(activity: {
    activity_type: Activity['activity_type'];
    subject: string;
    note?: string;
    due_date?: string;
    due_time?: string;
    duration_minutes?: number;
    location?: string;
    deal_id?: string;
    person_id?: string;
    organization_id?: string;
    participant_ids?: string[];
    owner_id?: string;
    assigned_to_id?: string;
    reminder_minutes_before?: number;
    custom_fields?: Record<string, unknown>;
  }): Promise<Activity> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('crm_activities_enhanced')
      .insert({
        user_id: user.id,
        ...activity,
        participant_ids: activity.participant_ids || [],
        is_done: false,
        busy_flag: true,
        reminder_sent: false,
        custom_fields: activity.custom_fields || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===========================================
  // LABELS
  // ===========================================

  async getLabels(
    entityType: 'person' | 'organization' | 'deal' | 'lead'
  ): Promise<LabelType[]> {
    const { data, error } = await this.supabase
      .from('crm_labels')
      .select('*')
      .eq('entity_type', entityType)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createLabel(label: {
    entity_type: 'person' | 'organization' | 'deal' | 'lead';
    name: string;
    color?: string;
    sort_order?: number;
  }): Promise<LabelType> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('crm_labels')
      .insert({
        user_id: user.id,
        ...label,
        color: label.color || '#6B7B8A',
        sort_order: label.sort_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===========================================
  // LEADS
  // ===========================================

  async getLeads(filters?: {
    status?: Lead['status'];
    owner_id?: string;
    label_ids?: string[];
  }): Promise<Lead[]> {
    let query = this.supabase.from('crm_leads').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.owner_id) {
      query = query.eq('owner_id', filters.owner_id);
    }

    if (filters?.label_ids && filters.label_ids.length > 0) {
      query = query.overlaps('label_ids', filters.label_ids);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async convertLeadToDeal(
    leadId: string,
    dealData: {
      pipeline_id: string;
      stage_id: string;
      title: string;
      value?: number;
    }
  ): Promise<{ deal: Deal; person?: Person; organization?: Organization }> {
    const lead = await this.getLeadById(leadId);
    if (!lead) throw new Error('Lead not found');

    // Create person if needed
    let person: Person | undefined;
    if (lead.person_name || lead.email) {
      person = await this.createPerson({
        name: lead.person_name || lead.email || 'Unknown',
        emails: lead.email
          ? [{ value: lead.email, label: 'work', primary: true }]
          : [],
        phones: lead.phone
          ? [{ value: lead.phone, label: 'work', primary: true }]
          : [],
      });
    }

    // Create organization if needed
    let organization: Organization | undefined;
    if (lead.organization_name) {
      organization = await this.createOrganization({
        name: lead.organization_name,
      });
    }

    // Create deal
    const deal = await this.createDeal({
      ...dealData,
      person_id: person?.id,
      organization_id: organization?.id,
    });

    // Update lead
    await this.updateLead(leadId, {
      status: 'converted',
      converted_deal_id: deal.id,
      converted_at: new Date().toISOString(),
      converted_person_id: person?.id,
      converted_organization_id: organization?.id,
    });

    return { deal, person, organization };
  }

  async getLeadById(id: string): Promise<Lead | null> {
    const { data, error } = await this.supabase
      .from('crm_leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  async deleteLead(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async updateActivity(
    id: string,
    updates: Partial<Activity>
  ): Promise<Activity> {
    const { data, error } = await this.supabase
      .from('crm_activities_enhanced')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteActivity(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_activities_enhanced')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const { data, error } = await this.supabase
      .from('crm_notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteNote(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await this.supabase
      .from('crm_products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  async deleteDealProduct(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_deal_products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async updateLabel(
    id: string,
    updates: Partial<LabelType>
  ): Promise<LabelType> {
    const { data, error } = await this.supabase
      .from('crm_labels')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteLabel(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_labels')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async updateCustomField(
    id: string,
    updates: Partial<CustomFieldDefinition>
  ): Promise<CustomFieldDefinition> {
    const { data, error } = await this.supabase
      .from('crm_field_definitions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCustomField(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('crm_field_definitions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async createLead(lead: {
    title: string;
    source_name?: string;
    person_name?: string;
    organization_name?: string;
    email?: string;
    phone?: string;
    expected_value?: number;
    currency?: string;
    owner_id?: string;
    label_ids?: string[];
    custom_fields?: Record<string, unknown>;
  }): Promise<Lead> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('crm_leads')
      .insert({
        user_id: user.id,
        ...lead,
        status: 'new',
        currency: lead.currency || 'EUR',
        label_ids: lead.label_ids || [],
        custom_fields: lead.custom_fields || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await this.supabase
      .from('crm_leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===========================================
  // NOTES
  // ===========================================

  async getNotes(filters?: {
    deal_id?: string;
    person_id?: string;
    organization_id?: string;
    lead_id?: string;
  }): Promise<Note[]> {
    let query = this.supabase.from('crm_notes').select('*');

    if (filters?.deal_id) {
      query = query.eq('deal_id', filters.deal_id);
    }

    if (filters?.person_id) {
      query = query.eq('person_id', filters.person_id);
    }

    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    if (filters?.lead_id) {
      query = query.eq('lead_id', filters.lead_id);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async createNote(note: {
    content: string;
    deal_id?: string;
    person_id?: string;
    organization_id?: string;
    lead_id?: string;
    is_pinned?: boolean;
    mentioned_user_ids?: string[];
    visible_to?: 'owner' | 'team' | 'everyone';
  }): Promise<Note> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('crm_notes')
      .insert({
        user_id: user.id,
        ...note,
        is_pinned: note.is_pinned ?? false,
        mentioned_user_ids: note.mentioned_user_ids || [],
        visible_to: note.visible_to || 'owner',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===========================================
  // CUSTOM FIELDS
  // ===========================================

  async getCustomFields(
    entityType: CustomFieldDefinition['entity_type']
  ): Promise<CustomFieldDefinition[]> {
    const { data, error } = await this.supabase
      .from('crm_field_definitions')
      .select('*')
      .eq('entity_type', entityType)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createCustomField(field: {
    entity_type: CustomFieldDefinition['entity_type'];
    field_key: string;
    field_name: string;
    field_name_et?: string;
    field_type: CustomFieldDefinition['field_type'];
    options?: Array<{ value: string; label: string; label_et?: string }>;
    is_required?: boolean;
    is_searchable?: boolean;
    is_visible_in_list?: boolean;
    is_visible_in_detail?: boolean;
    sort_order?: number;
    field_group?: string;
  }): Promise<CustomFieldDefinition> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('crm_field_definitions')
      .insert({
        user_id: user.id,
        ...field,
        options: field.options || [],
        is_required: field.is_required ?? false,
        is_searchable: field.is_searchable ?? true,
        is_visible_in_list: field.is_visible_in_list ?? true,
        is_visible_in_detail: field.is_visible_in_detail ?? true,
        sort_order: field.sort_order ?? 0,
        field_group: field.field_group || 'custom',
        is_system: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
