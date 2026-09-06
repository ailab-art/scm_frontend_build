-- SCM-LIA schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) before 0002_seed_tree.sql

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users; Supabase creates auth.users automatically)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Content tree
create table if not exists main_objects (
  id integer primary key,
  level text not null check (level in ('Basic', 'Advance', 'Super Advance')),
  name text not null,
  domain_specific boolean not null default false,
  sort_order integer not null
);

create table if not exists sub_objects (
  id text primary key, -- e.g. '8.3'
  main_object_id integer not null references main_objects(id) on delete cascade,
  name text not null,
  sort_order integer not null
);

create type document_status as enum ('draft', 'level1_review', 'level2_review', 'accepted');
create type domain_variant as enum ('Standard', 'Manufacturing', 'Pharma');

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  sub_object_id text not null references sub_objects(id) on delete cascade,
  domain domain_variant not null default 'Standard',
  file_url text,
  status document_status not null default 'draft',
  level1_reviewer text,
  level1_status text,
  level1_submitted_at timestamptz,
  level1_deadline timestamptz,
  level2_reviewer text,
  level2_status text,
  level2_submitted_at timestamptz,
  level2_deadline timestamptz,
  revision_count integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (sub_object_id, domain)
);

create type asset_type as enum ('video_script', 'mcq', 'scenario', 'image_prompt', 'social_post', 'swim_lane');

create table if not exists generated_assets (
  id uuid primary key default gen_random_uuid(),
  sub_object_id text not null references sub_objects(id) on delete cascade,
  domain domain_variant not null default 'Standard',
  type asset_type not null,
  content jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  unique (sub_object_id, domain, type)
);

-- Row Level Security
alter table profiles enable row level security;
alter table main_objects enable row level security;
alter table sub_objects enable row level security;
alter table documents enable row level security;
alter table generated_assets enable row level security;

create policy "Users can read own profile" on profiles for select using (auth.uid() = id);

create policy "Authenticated users can read main objects" on main_objects for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read sub objects" on sub_objects for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read documents" on documents for select using (auth.role() = 'authenticated');

create policy "Authenticated users can read generated assets" on generated_assets for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert generated assets" on generated_assets for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update generated assets" on generated_assets for update using (auth.role() = 'authenticated');

-- NOTE: everyone authenticated can currently write to generated_assets and
-- read everything else. Once roles exist (admin / reviewer / student), tighten
-- these policies — e.g. only admins should write documents.status directly,
-- since that's what drives Section 5.5 milestone-billing eligibility.
