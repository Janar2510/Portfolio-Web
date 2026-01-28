-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create a table for public profiles/users that syncs with auth.users
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Turn on RLS for users
alter table public.users enable row level security;

-- Policies for users
create policy "Users can view their own profile" 
  on public.users for select 
  using ( auth.uid() = id );

create policy "Users can update their own profile" 
  on public.users for update 
  using ( auth.uid() = id );

-- Trigger to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create sites table
create table if not exists public.sites (
  id uuid default uuid_generate_v4() primary key,
  owner_user_id uuid references public.users(id) on delete cascade not null,
  slug text unique not null,
  template_id text not null,
  draft_config jsonb default '{}'::jsonb,
  published_config jsonb,
  status text check (status in ('draft', 'published')) default 'draft',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index on slug for fast lookups
create index sites_slug_idx on public.sites (slug);
create index sites_owner_idx on public.sites (owner_user_id);

-- Turn on RLS for sites
alter table public.sites enable row level security;

-- Policies for sites

-- 1. Owner has full access
create policy "Users can do everything on their own sites"
  on public.sites
  for all
  using ( auth.uid() = owner_user_id )
  with check ( auth.uid() = owner_user_id );

-- 2. Public can read published sites by slug
create policy "Public can view published sites"
  on public.sites
  for select
  using ( status = 'published' );

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_sites_updated
  before update on public.sites
  for each row execute procedure public.handle_updated_at();

create trigger on_users_updated
  before update on public.users
  for each row execute procedure public.handle_updated_at();

-- SECURE VIEW for public access
-- This view allows public to see published configs WITHOUT checking the implementation detail of draft_config columns.
-- Using the underlying RLS (status='published') is still necessary for the view to work for anon users.
create or replace view public.published_sites as
select
  id,
  slug,
  template_id,
  published_config,
  created_at,
  updated_at
from public.sites
where status = 'published';

-- Allow access to the view (standard PG permission, unrelated to RLS, but Supabase requires grant)
grant select on public.published_sites to anon, authenticated;
