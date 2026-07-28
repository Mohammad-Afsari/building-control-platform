-- ============================================================
-- Fix: grant table privileges to the authenticated role.
-- Tables created via the SQL Editor don't inherit these, so every
-- request was failing with "42501 permission denied" before RLS
-- was even evaluated. Run this in the Supabase SQL Editor if you
-- already applied 0001 before it included these grants.
-- ============================================================

grant select, insert, update, delete on public.applications to authenticated;
grant usage on sequence public.application_ref_seq to authenticated;
