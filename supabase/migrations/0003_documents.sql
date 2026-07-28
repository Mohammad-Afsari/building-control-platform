-- ============================================================
-- Building Control — application documents (Storage + table)
-- Apply via Supabase Dashboard → SQL Editor → paste → Run.
-- ============================================================

-- Private bucket for applicants' drawings & documents.
insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do nothing;

-- One row per uploaded file. The bytes live in Storage; this is metadata.
create table public.documents (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  storage_path   text not null,           -- <user_id>/<application_id>/<uuid>-<name>
  file_name      text not null,
  size_bytes     bigint not null,
  content_type   text,
  created_at     timestamptz not null default now()
);

create index documents_application_id_idx
  on public.documents (application_id, created_at desc);

-- Table privileges. Tables created via the SQL Editor do NOT inherit these
-- automatically, so without them every request is denied with 42501 before
-- RLS is evaluated. (No update — documents are immutable once recorded.)
grant select, insert, delete on public.documents to authenticated;

-- Row-level security: users only see/touch their own document rows.
alter table public.documents enable row level security;

create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);
create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

-- Storage RLS: scope objects in this bucket to their uploader. Supabase sets
-- storage.objects.owner to the authenticated user on upload.
create policy "app_docs_select_own" on storage.objects
  for select using (bucket_id = 'application-documents' and owner = auth.uid());
create policy "app_docs_insert_own" on storage.objects
  for insert with check (bucket_id = 'application-documents' and owner = auth.uid());
create policy "app_docs_delete_own" on storage.objects
  for delete using (bucket_id = 'application-documents' and owner = auth.uid());
