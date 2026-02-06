-- Create Automations Schema Migration

-- Drop existing tables if any (development phase)
drop table if exists public.automation_logs cascade;
drop table if exists public.automations cascade;

-- 1. Automations Table (Rules)
create table public.automations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade, -- Optional: Null = Workspace/Global rule
  
  name text not null,
  description text,
  is_active boolean default true,
  
  -- Trigger Configuration
  trigger_type text not null, -- e.g., 'task.created', 'task.status_changed', 'task.due_date_approaching'
  trigger_config jsonb default '{}'::jsonb, -- Filter criteria (e.g., { "status_id": "..." })
  
  -- Action Configuration
  action_type text not null, -- e.g., 'task.create_subtasks', 'task.assign', 'notification.send'
  action_config jsonb default '{}'::jsonb, -- Action payload (e.g., { "subtasks": ["Review", "Deploy"] })
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Automation Logs (History)
create table public.automation_logs (
  id uuid default uuid_generate_v4() primary key,
  automation_id uuid references public.automations(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null, -- Triggered by
  
  status text not null, -- 'success', 'failed'
  details jsonb, -- Error message or execution summary
  
  executed_at timestamptz default now() not null
);

-- RLS Policies

-- Automations
alter table public.automations enable row level security;

create policy "Users can manage their own automations" on public.automations
  for all using (auth.uid() = user_id);

-- Logs
alter table public.automation_logs enable row level security;

create policy "Users can view their own automation logs" on public.automation_logs
  for select using (auth.uid() = user_id);

-- Indexes
create index automations_user_idx on public.automations(user_id);
create index automations_project_idx on public.automations(project_id);
create index automation_logs_automation_idx on public.automation_logs(automation_id);

-- Updated At Trigger
create trigger on_automations_updated before update on public.automations for each row execute procedure public.handle_updated_at();
