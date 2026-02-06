-- Create CRM Tables Migration
-- Based on crm-enhanced.ts and schemas.ts

-- 1. crm_organizations
create table if not exists public.crm_organizations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  address jsonb default '{}'::jsonb,
  label_ids uuid[] default '{}'::uuid[],
  owner_id uuid,
  custom_fields jsonb default '{}'::jsonb,
  visible_to text default 'owner',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  is_deleted boolean default false,
  deleted_at timestamptz
);

-- 2. crm_persons
create table if not exists public.crm_persons (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid references public.crm_organizations(id) on delete set null,
  name text not null,
  first_name text,
  last_name text,
  job_title text,
  emails jsonb default '[]'::jsonb,
  phones jsonb default '[]'::jsonb,
  label_ids uuid[] default '{}'::uuid[],
  owner_id uuid,
  custom_fields jsonb default '{}'::jsonb,
  visible_to text default 'owner',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  is_deleted boolean default false,
  deleted_at timestamptz,
  last_activity_at timestamptz
);

-- 3. crm_pipelines
create table if not exists public.crm_pipelines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  name_et text,
  is_active boolean default true,
  is_default boolean default false,
  deal_probability_enabled boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. crm_pipeline_stages
create table if not exists public.crm_pipeline_stages (
  id uuid default uuid_generate_v4() primary key,
  pipeline_id uuid references public.crm_pipelines(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  name_et text,
  sort_order integer default 0,
  probability integer default 100,
  rotten_flag boolean default false,
  rotten_days integer,
  stage_type text default 'normal',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 5. crm_deals
create table if not exists public.crm_deals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  value numeric default 0,
  currency text default 'EUR',
  pipeline_id uuid references public.crm_pipelines(id) on delete cascade not null,
  stage_id uuid references public.crm_pipeline_stages(id) on delete set null,
  person_id uuid references public.crm_persons(id) on delete set null,
  organization_id uuid references public.crm_organizations(id) on delete set null,
  status text default 'open',
  won_time timestamptz,
  lost_time timestamptz,
  lost_reason text,
  expected_close_date timestamptz,
  close_time timestamptz,
  owner_id uuid,
  label_ids uuid[] default '{}'::uuid[],
  custom_fields jsonb default '{}'::jsonb,
  visible_to text default 'owner',
  stage_order integer default 0,
  stage_entered_at timestamptz default now(),
  probability integer,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  is_deleted boolean default false,
  deleted_at timestamptz,
  last_activity_at timestamptz,
  next_activity_date timestamptz
);

-- 6. crm_leads
create table if not exists public.crm_leads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  source_name text,
  person_name text,
  organization_name text,
  email text,
  phone text,
  expected_value numeric,
  currency text default 'EUR',
  owner_id uuid,
  label_ids uuid[] default '{}'::uuid[],
  status text default 'new',
  converted_deal_id uuid references public.crm_deals(id) on delete set null,
  converted_at timestamptz,
  converted_person_id uuid references public.crm_persons(id) on delete set null,
  converted_organization_id uuid references public.crm_organizations(id) on delete set null,
  custom_fields jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  last_activity_at timestamptz,
  next_activity_date timestamptz
);

-- 7. crm_activities_enhanced
create table if not exists public.crm_activities_enhanced (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  activity_type text default 'task',
  subject text not null,
  note text,
  due_date text, -- Storing YYYY-MM-DD
  due_time text,
  duration_minutes integer,
  location text,
  deal_id uuid references public.crm_deals(id) on delete set null,
  person_id uuid references public.crm_persons(id) on delete set null,
  organization_id uuid references public.crm_organizations(id) on delete set null,
  lead_id uuid references public.crm_leads(id) on delete set null,
  participant_ids uuid[] default '{}'::uuid[],
  owner_id uuid,
  assigned_to_id uuid,
  is_done boolean default false,
  done_at timestamptz,
  busy_flag boolean default true,
  reminder_minutes_before integer,
  reminder_sent boolean default false,
  custom_fields jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 8. crm_notes
create table if not exists public.crm_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  deal_id uuid references public.crm_deals(id) on delete cascade,
  person_id uuid references public.crm_persons(id) on delete cascade,
  organization_id uuid references public.crm_organizations(id) on delete cascade,
  lead_id uuid references public.crm_leads(id) on delete cascade,
  is_pinned boolean default false,
  mentioned_user_ids uuid[] default '{}'::uuid[],
  visible_to text default 'owner',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 9. crm_products
create table if not exists public.crm_products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  code text,
  description text,
  unit_price numeric default 0,
  currency text default 'EUR',
  unit text,
  tax_percentage numeric default 0,
  category text,
  is_active boolean default true,
  custom_fields jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 10. crm_deal_products
create table if not exists public.crm_deal_products (
  id uuid default uuid_generate_v4() primary key,
  deal_id uuid references public.crm_deals(id) on delete cascade not null,
  product_id uuid references public.crm_products(id) on delete set null,
  name text not null,
  unit_price numeric default 0,
  quantity numeric default 1,
  discount_percentage numeric default 0,
  tax_percentage numeric default 0,
  sum numeric generated always as ((unit_price * quantity) * (1 - discount_percentage / 100)) stored,
  comments text,
  sort_order integer default 0,
  created_at timestamptz default now() not null
);

-- 11. crm_labels
create table if not exists public.crm_labels (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  entity_type text not null, -- 'person', 'organization', 'deal', 'lead'
  name text not null,
  color text default '#888888',
  sort_order integer default 0,
  created_at timestamptz default now() not null
);

-- 12. crm_field_definitions
create table if not exists public.crm_field_definitions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  entity_type text not null,
  field_key text not null,
  field_name text not null,
  field_name_et text,
  field_type text not null,
  options jsonb default '[]'::jsonb,
  is_required boolean default false,
  is_searchable boolean default true,
  is_visible_in_list boolean default true,
  is_visible_in_detail boolean default true,
  sort_order integer default 0,
  field_group text default 'custom',
  is_system boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);


-- Indexes
create index if not exists crm_orgs_user_idx on public.crm_organizations(user_id);
create index if not exists crm_persons_user_idx on public.crm_persons(user_id);
create index if not exists crm_deals_user_idx on public.crm_deals(user_id);
create index if not exists crm_leads_user_idx on public.crm_leads(user_id);
create index if not exists crm_activities_user_idx on public.crm_activities_enhanced(user_id);
create index if not exists crm_pipelines_user_idx on public.crm_pipelines(user_id);

-- RLS Policies
alter table public.crm_organizations enable row level security;
alter table public.crm_persons enable row level security;
alter table public.crm_pipelines enable row level security;
alter table public.crm_pipeline_stages enable row level security;
alter table public.crm_deals enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_activities_enhanced enable row level security;
alter table public.crm_notes enable row level security;
alter table public.crm_products enable row level security;
alter table public.crm_deal_products enable row level security;
alter table public.crm_labels enable row level security;
alter table public.crm_field_definitions enable row level security;

-- Simple RLS: Users can see/edit only their own data (where user_id matches)
create policy "Users manage their own organizations" on public.crm_organizations for all using (auth.uid() = user_id);
create policy "Users manage their own persons" on public.crm_persons for all using (auth.uid() = user_id);
create policy "Users manage their own pipelines" on public.crm_pipelines for all using (auth.uid() = user_id);
create policy "Users manage their own stages" on public.crm_pipeline_stages for all using (auth.uid() = user_id);
create policy "Users manage their own deals" on public.crm_deals for all using (auth.uid() = user_id);
create policy "Users manage their own leads" on public.crm_leads for all using (auth.uid() = user_id);
create policy "Users manage their own activities" on public.crm_activities_enhanced for all using (auth.uid() = user_id);
create policy "Users manage their own notes" on public.crm_notes for all using (auth.uid() = user_id);
create policy "Users manage their own products" on public.crm_products for all using (auth.uid() = user_id);
create policy "Users manage their own deal products" on public.crm_deal_products for all using (
  deal_id in (select id from public.crm_deals where user_id = auth.uid())
);
create policy "Users manage their own labels" on public.crm_labels for all using (auth.uid() = user_id);
create policy "Users manage their own fields" on public.crm_field_definitions for all using (auth.uid() = user_id);

-- Triggers for updated_at
create trigger on_crm_orgs_updated before update on public.crm_organizations for each row execute procedure public.handle_updated_at();
create trigger on_crm_persons_updated before update on public.crm_persons for each row execute procedure public.handle_updated_at();
create trigger on_crm_sales_pipelines_updated before update on public.crm_pipelines for each row execute procedure public.handle_updated_at();
create trigger on_crm_stages_updated before update on public.crm_pipeline_stages for each row execute procedure public.handle_updated_at();
create trigger on_crm_deals_updated before update on public.crm_deals for each row execute procedure public.handle_updated_at();
create trigger on_crm_leads_updated before update on public.crm_leads for each row execute procedure public.handle_updated_at();
create trigger on_crm_activities_updated before update on public.crm_activities_enhanced for each row execute procedure public.handle_updated_at();
create trigger on_crm_notes_updated before update on public.crm_notes for each row execute procedure public.handle_updated_at();
create trigger on_crm_products_updated before update on public.crm_products for each row execute procedure public.handle_updated_at();
create trigger on_crm_fields_updated before update on public.crm_field_definitions for each row execute procedure public.handle_updated_at();

