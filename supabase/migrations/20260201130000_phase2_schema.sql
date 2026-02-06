-- Phase 2: Advanced Task Features Migration

-- 1. sprints
create table if not exists public.sprints (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  goal text,
  start_date timestamptz,
  end_date timestamptz,
  status text default 'planned', -- 'planned', 'active', 'completed', 'archived'
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. task_checklist_items
create table if not exists public.task_checklist_items (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  content text not null,
  is_completed boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Update tasks table
alter table public.tasks 
add column if not exists sprint_id uuid references public.sprints(id) on delete set null;

-- Indexes
create index if not exists sprints_project_idx on public.sprints(project_id);
create index if not exists sprints_status_idx on public.sprints(status);
create index if not exists checklist_task_idx on public.task_checklist_items(task_id);
create index if not exists tasks_sprint_idx on public.tasks(sprint_id);

-- RLS Policies for Sprints
alter table public.sprints enable row level security;

create policy "Members can view sprints" on public.sprints
  for select using (
    exists (select 1 from public.projects p where p.id = sprints.project_id and (p.user_id = auth.uid() or exists (select 1 from public.project_members where project_id = p.id and user_id = auth.uid())))
  );

create policy "Members can manage sprints" on public.sprints
  for all using (
    exists (select 1 from public.projects p where p.id = sprints.project_id and (p.user_id = auth.uid() or exists (select 1 from public.project_members where project_id = p.id and user_id = auth.uid())))
  );

-- RLS Policies for Checklist Items
alter table public.task_checklist_items enable row level security;

create policy "Members can view checklist items" on public.task_checklist_items
  for select using (
    exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id where t.id = task_checklist_items.task_id and (p.user_id = auth.uid() or exists (select 1 from public.project_members where project_id = p.id and user_id = auth.uid())))
  );

create policy "Members can manage checklist items" on public.task_checklist_items
  for all using (
    exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id where t.id = task_checklist_items.task_id and (p.user_id = auth.uid() or exists (select 1 from public.project_members where project_id = p.id and user_id = auth.uid())))
  );

-- Triggers
create trigger on_sprints_updated before update on public.sprints for each row execute procedure public.handle_updated_at();
create trigger on_checklist_items_updated before update on public.task_checklist_items for each row execute procedure public.handle_updated_at();
