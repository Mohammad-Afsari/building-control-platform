-- ============================================================
-- Building Control — applications table
-- Apply via Supabase Dashboard → SQL Editor → paste → Run.
-- ============================================================

-- Reference sequence: BC-2026-04001, BC-2026-04002, …
create sequence if not exists public.application_ref_seq start 4001;

create or replace function public.generate_application_reference()
returns text language sql volatile as $$
  select 'BC-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('public.application_ref_seq')::text, 5, '0')
$$;

create table public.applications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 2 and 60),
  postcode    text,
  address     text,
  easting     text,
  northing    text,
  type        text not null check (type in ('full-plans','building-notice','regularisation','demolition-notice')),
  category    text not null check (category in ('domestic','commercial','other')),
  status      text not null default 'draft' check (status in ('draft','submitted','review','approved','rejected')),
  reference   text not null unique default public.generate_application_reference(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index applications_user_id_idx
  on public.applications (user_id, updated_at desc);

-- updated_at maintenance
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Table privileges. Tables created via the SQL Editor (rather than
-- the dashboard UI) do NOT inherit these automatically, so without
-- them every request is denied with 42501 before RLS is evaluated.
grant select, insert, update, delete on public.applications to authenticated;
grant usage on sequence public.application_ref_seq to authenticated;

-- Row-level security: users only see/touch their own rows
alter table public.applications enable row level security;

create policy "applications_select_own" on public.applications
  for select using (auth.uid() = user_id);
create policy "applications_insert_own" on public.applications
  for insert with check (auth.uid() = user_id);
create policy "applications_update_own" on public.applications
  for update using (auth.uid() = user_id);
create policy "applications_delete_own" on public.applications
  for delete using (auth.uid() = user_id);
