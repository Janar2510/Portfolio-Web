-- Create Projects & Tasks Schema Migration

-- Drop existing tables to ensure clean state (Development Phase)
drop table if exists public.task_assignees cascade;
drop table if exists public.tasks cascade;
drop table if exists public.project_statuses cascade;
drop table if exists public.project_members cascade;
drop table if exists public.projects cascade;

-- 1. projects
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null, -- Creator/Owner
  name text not null,
  description text,
  color text default '#888888',
  icon text,
  is_archived boolean default false,
  is_template boolean default false,
  owner_id uuid, -- For transferring ownership or enhanced permissions
  custom_fields jsonb default '{}'::jsonb,
  settings jsonb default '{}'::jsonb, -- For project-specific settings (features enabled etc.)
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

-- 2. project_members (For team access)
create table public.project_members (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member', -- 'admin', 'member', 'viewer'
  created_at timestamptz default now() not null,
  unique(project_id, user_id)
);

-- 3. project_statuses (Columns)
create table public.project_statuses (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  color text default '#888888',
  sort_order integer default 0,
  category text default 'active', -- 'todo', 'active', 'done' to simplify logic
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. tasks
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null, -- Creator
  parent_id uuid references public.tasks(id) on delete set null, -- Subtasks
  status_id uuid references public.project_statuses(id) on delete set null,
  
  title text not null,
  description text,
  priority text default 'none', -- 'low', 'medium', 'high', 'urgent', 'none'
  
  start_date timestamptz,
  due_date timestamptz,
  completed_at timestamptz,
  is_completed boolean default false,
  
  -- CRM Integrations
  related_deal_id uuid, -- Simplified relation, can add FK constraint later if needed
  related_person_id uuid,
  related_organization_id uuid,
  
  custom_fields jsonb default '{}'::jsonb,
  
  sort_order integer default 0, -- Order within column
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

-- 5. task_assignees
create table public.task_assignees (
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  assigned_at timestamptz default now() not null,
  primary key (task_id, user_id)
);

-- Indexes
create index if not exists projects_user_idx on public.projects(user_id);
create index if not exists projects_owner_idx on public.projects(owner_id);
create index if not exists project_members_project_idx on public.project_members(project_id);
create index if not exists project_members_user_idx on public.project_members(user_id);
create index if not exists project_statuses_project_idx on public.project_statuses(project_id);
create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_status_idx on public.tasks(status_id);
create index if not exists tasks_assignees_idx on public.task_assignees(user_id);

-- RLS Policies
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_statuses enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;

-- Helper function to check membership avoiding recursion
-- SECURITY DEFINER ensures it runs with owner privileges, bypassing RLS
create or replace function public.is_project_member(_project_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.project_members 
    where project_id = _project_id 
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Policies

-- 1. Projects
-- Visibility: Owner OR Member
create policy "Users can view projects they are members of" on public.projects
  for select using (
    auth.uid() = user_id or 
    public.is_project_member(id)
  );

create policy "Users can insert projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Owners and Admins can update projects" on public.projects
  for update using (
    auth.uid() = user_id or 
    exists (select 1 from public.project_members where project_id = projects.id and user_id = auth.uid() and role = 'admin')
  );

create policy "Owners can delete projects" on public.projects
  for delete using (auth.uid() = user_id);

-- 2. Project Members
-- Visibility: I can see members of projects I am a member of (or owner of)
create policy "Project members visible to other members" on public.project_members
  for select using (
    public.is_project_member(project_id) or
    exists (select 1 from public.projects p where p.id = project_members.project_id and p.user_id = auth.uid())
  );

-- Insert/Update/Delete managed by logic (Owners/Admins presumably, or safe defaults)
-- For now, owners can manage members
create policy "Owners can manage members" on public.project_members
  for all using (
    exists (select 1 from public.projects p where p.id = project_members.project_id and p.user_id = auth.uid())
  );

-- 3. Statuses
create policy "Members can view statuses" on public.project_statuses
  for select using (
    exists (select 1 from public.projects p where p.id = project_statuses.project_id and p.user_id = auth.uid()) or
    public.is_project_member(project_id)
  );

create policy "Members can manage statuses" on public.project_statuses
  for all using (
    exists (select 1 from public.projects p where p.id = project_statuses.project_id and p.user_id = auth.uid()) or
    public.is_project_member(project_id)
  );

-- 4. Tasks
create policy "Members can view tasks" on public.tasks
  for select using (
    exists (select 1 from public.projects p where p.id = tasks.project_id and p.user_id = auth.uid()) or
    public.is_project_member(project_id)
  );

create policy "Members can manage tasks" on public.tasks
  for all using (
    exists (select 1 from public.projects p where p.id = tasks.project_id and p.user_id = auth.uid()) or
    public.is_project_member(project_id)
  );

-- 5. Assignees
create policy "Members can view assignees" on public.task_assignees
  for select using (
     exists (
       select 1 from public.tasks t 
       join public.projects p on p.id = t.project_id 
       where t.id = task_assignees.task_id 
       and (p.user_id = auth.uid() or public.is_project_member(p.id))
     )
  );

create policy "Members can manage assignees" on public.task_assignees
  for all using (
     exists (
       select 1 from public.tasks t 
       join public.projects p on p.id = t.project_id 
       where t.id = task_assignees.task_id 
       and (p.user_id = auth.uid() or public.is_project_member(p.id))
     )
  );

-- Triggers (Only create if function exists, usually it does in our base schema)
create trigger on_projects_updated before update on public.projects for each row execute procedure public.handle_updated_at();
create trigger on_project_statuses_updated before update on public.project_statuses for each row execute procedure public.handle_updated_at();
create trigger on_tasks_updated before update on public.tasks for each row execute procedure public.handle_updated_at();
