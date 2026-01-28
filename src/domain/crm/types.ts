// Pipedrive-style CRM Types

export type EntityType =
  | 'person'
  | 'organization'
  | 'deal'
  | 'activity'
  | 'product'
  | 'lead';
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'monetary'
  | 'date'
  | 'datetime'
  | 'single_select'
  | 'multi_select'
  | 'phone'
  | 'email'
  | 'url'
  | 'person'
  | 'organization'
  | 'user'
  | 'address'
  | 'boolean';

export type ActivityType =
  | 'call'
  | 'meeting'
  | 'task'
  | 'deadline'
  | 'email'
  | 'lunch';
export type DealStatus = 'open' | 'won' | 'lost' | 'deleted';
export type StageType = 'normal' | 'won' | 'lost';
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'archived';
export type VisibleTo = 'owner' | 'team' | 'everyone';
export type FilterType = 'system' | 'user' | 'shared';
export type GoalType =
  | 'deals_won'
  | 'deals_started'
  | 'revenue'
  | 'activities_completed'
  | 'activities_added';
export type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type WorkflowTriggerEntity =
  | 'deal'
  | 'person'
  | 'organization'
  | 'activity'
  | 'lead';
export type WorkflowTriggerEvent =
  | 'created'
  | 'updated'
  | 'stage_changed'
  | 'status_changed'
  | 'owner_changed'
  | 'field_changed'
  | 'activity_completed';

// Custom Field Definition
export interface CustomFieldDefinition {
  id: string;
  user_id: string;
  entity_type: EntityType;
  field_key: string;
  field_name: string;
  field_name_et?: string;
  field_type: FieldType;
  options: Array<{ value: string; label: string; label_et?: string }>;
  is_required: boolean;
  is_searchable: boolean;
  is_visible_in_list: boolean;
  is_visible_in_detail: boolean;
  sort_order: number;
  field_group: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

// Organization
export interface Organization {
  id: string;
  user_id: string;
  name: string;
  address: {
    street?: string;
    city?: string;
    country?: string;
    postal?: string;
  };
  label_ids: string[];
  owner_id?: string;
  custom_fields: Record<string, unknown>;
  visible_to: VisibleTo;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string;
}

// Person
export interface Person {
  id: string;
  user_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  organization_id?: string;
  job_title?: string;
  emails: Array<{ value: string; label: string; primary: boolean }>;
  phones: Array<{ value: string; label: string; primary: boolean }>;
  marketing_status: string;
  label_ids: string[];
  owner_id?: string;
  custom_fields: Record<string, unknown>;
  visible_to: VisibleTo;
  avatar_url?: string;
  last_activity_at?: string;
  next_activity_date?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string;
}

// Pipeline
export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  name_et?: string;
  is_active: boolean;
  is_default: boolean;
  deal_probability_enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Pipeline Stage
export interface PipelineStage {
  id: string;
  pipeline_id: string;
  user_id: string;
  name: string;
  name_et?: string;
  sort_order: number;
  probability: number;
  rotten_days?: number;
  rotten_flag: boolean;
  stage_type: StageType;
  created_at: string;
}

// Deal
export interface Deal {
  id: string;
  user_id: string;
  title: string;
  value?: number;
  currency: string;
  pipeline_id: string;
  stage_id: string;
  person_id?: string;
  organization_id?: string;
  status: DealStatus;
  won_time?: string;
  lost_time?: string;
  close_time?: string;
  lost_reason?: string;
  expected_close_date?: string;
  probability?: number;
  owner_id?: string;
  stage_entered_at: string;
  label_ids: string[];
  custom_fields: Record<string, unknown>;
  visible_to: VisibleTo;
  stage_order: number;
  last_activity_at?: string;
  next_activity_date?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string;
}

// Product
export interface Product {
  id: string;
  user_id: string;
  name: string;
  code?: string;
  description?: string;
  unit_price?: number;
  currency: string;
  unit: string;
  tax_percentage: number;
  is_active: boolean;
  custom_fields: Record<string, unknown>;
  category?: string;
  created_at: string;
  updated_at: string;
}

// Deal Product
export interface DealProduct {
  id: string;
  deal_id: string;
  product_id?: string;
  name: string;
  unit_price: number;
  quantity: number;
  discount_percentage: number;
  tax_percentage: number;
  sum?: number;
  comments?: string;
  sort_order: number;
  created_at: string;
}

// Activity
export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  subject: string;
  note?: string;
  due_date?: string;
  due_time?: string;
  duration_minutes?: number;
  location?: string;
  deal_id?: string;
  person_id?: string;
  organization_id?: string;
  lead_id?: string;
  participant_ids: string[];
  is_done: boolean;
  done_at?: string;
  owner_id?: string;
  assigned_to_id?: string;
  busy_flag: boolean;
  reminder_minutes_before?: number;
  reminder_sent: boolean;
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Lead
export interface Lead {
  id: string;
  user_id: string;
  title: string;
  source_name?: string;
  person_name?: string;
  organization_name?: string;
  email?: string;
  phone?: string;
  expected_value?: number;
  currency: string;
  owner_id?: string;
  label_ids: string[];
  status: LeadStatus;
  converted_deal_id?: string;
  converted_at?: string;
  converted_person_id?: string;
  converted_organization_id?: string;
  custom_fields: Record<string, unknown>;
  last_activity_at?: string;
  next_activity_date?: string;
  created_at: string;
  updated_at: string;
}

// Label
export interface Label {
  id: string;
  user_id: string;
  entity_type: 'person' | 'organization' | 'deal' | 'lead';
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
}

// Note
export interface Note {
  id: string;
  user_id: string;
  content: string;
  deal_id?: string;
  person_id?: string;
  organization_id?: string;
  lead_id?: string;
  is_pinned: boolean;
  mentioned_user_ids: string[];
  visible_to: VisibleTo;
  created_at: string;
  updated_at: string;
}

// File
export interface CrmFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  deal_id?: string;
  person_id?: string;
  organization_id?: string;
  note_id?: string;
  activity_id?: string;
  description?: string;
  uploaded_by: string;
  created_at: string;
}

// Filter
export interface Filter {
  id: string;
  user_id: string;
  entity_type: EntityType;
  name: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: unknown;
  }>;
  visible_columns: string[];
  sort_field?: string;
  sort_direction: 'asc' | 'desc';
  filter_type: FilterType;
  is_default: boolean;
  shared_with: string[];
  created_at: string;
  updated_at: string;
}

// Goal
export interface Goal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  assignee_id?: string;
  pipeline_id?: string;
  activity_type?: ActivityType;
  target_value: number;
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  current_value: number;
  last_calculated_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Workflow
export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_entity: WorkflowTriggerEntity;
  trigger_event: WorkflowTriggerEvent;
  trigger_conditions: Array<{
    field: string;
    operator: string;
    value: unknown;
  }>;
  actions: Array<{
    type: string;
    params: Record<string, unknown>;
  }>;
  is_active: boolean;
  last_executed_at?: string;
  execution_count: number;
  created_at: string;
  updated_at: string;
}

// Workflow Log
export interface WorkflowLog {
  id: string;
  workflow_id: string;
  trigger_entity_id: string;
  trigger_entity_type: string;
  status: 'success' | 'partial' | 'failed';
  actions_executed: Array<{
    action: string;
    status: string;
    error?: string;
  }>;
  error_message?: string;
  executed_at: string;
}

// Changelog Entry
export interface ChangelogEntry {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: 'created' | 'updated' | 'deleted' | 'restored' | 'merged';
  changes: Record<string, { old: unknown; new: unknown }>;
  changed_by?: string;
  ip_address?: string;
  created_at: string;
}
