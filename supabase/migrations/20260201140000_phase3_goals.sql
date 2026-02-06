-- Phase 3: Hierarchy & Goals

-- 1. Add Hierarchy to Projects
alter table public.projects 
add column if not exists parent_id uuid references public.projects(id) on delete set null;

create index if not exists projects_parent_idx on public.projects(parent_id);

-- 2. Goals (Objectives)
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null, -- Creator
  project_id uuid references public.projects(id) on delete set null, -- Optional link to project
  title text not null,
  description text,
  status text default 'active', -- 'active', 'completed', 'archived'
  start_date timestamptz,
  due_date timestamptz,
  progress integer default 0, -- 0-100 (Manual or Calculated)
  owner_id uuid references auth.users(id) on delete set null,
  sort_order integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

-- 3. Key Results (Measurable outcomes for Goals)
create table if not exists public.key_results (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null,
  title text not null,
  target_value numeric not null,
  current_value numeric default 0,
  unit text default 'number', -- 'number', 'currency', 'percentage'
  sort_order integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index if not exists goals_project_idx on public.goals(project_id);
create index if not exists goals_user_idx on public.goals(user_id);
create index if not exists key_results_goal_idx on public.key_results(goal_id);

-- RLS Policies
alter table public.goals enable row level security;
alter table public.key_results enable row level security;

-- Goals Policies
-- Reuse is_project_member if linked to project, otherwise creator only?
-- For MVP, let's say Goals are private unless project-linked, where members can see.
create policy "Users can view goals" on public.goals
  for select using (
    (project_id is null and auth.uid() = user_id) or
    (project_id is not null and (
      exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()) or
      public.is_project_member(project_id)
    ))
  );

create policy "Users can insert goals" on public.goals
  for insert with check (auth.uid() = user_id);

create policy "Users can update goals" on public.goals
  for update using (
    auth.uid() = user_id or 
    (project_id is not null and public.is_project_member(project_id)) 
  );

create policy "Users can delete goals" on public.goals
  for delete using (auth.uid() = user_id);

-- Key Results Policies
-- Inherit from Goal
create policy "Users can view key results" on public.key_results
  for select using (
    exists (select 1 from public.goals g where g.id = key_results.goal_id and (
      (g.project_id is null and g.user_id = auth.uid()) or
      (g.project_id is not null and (
         exists (select 1 from public.projects p where p.id = g.project_id and p.user_id = auth.uid()) or
         public.is_project_member(g.project_id)
      ))
    ))
  );

create policy "Users can manage key results" on public.key_results
  for all using (
    exists (select 1 from public.goals g where g.id = key_results.goal_id and (
      g.user_id = auth.uid() or
      (g.project_id is not null and public.is_project_member(g.project_id))
    ))
  );

-- Triggers
create trigger on_goals_updated before update on public.goals for each row execute procedure public.handle_updated_at();
create trigger on_key_results_updated before update on public.key_results for each row execute procedure public.handle_updated_at();
