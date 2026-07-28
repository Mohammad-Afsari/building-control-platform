# Database schema

SQL migrations for the Supabase project backing this app.

## Provenance

These files were ported verbatim from `building-control-storefronts`, the
Next.js implementation this SPA replaces. Both repos point at the same
Supabase project, so this schema is already live — the port makes it
tracked in the repo that now owns it, rather than adding anything new.

## How these were applied

By hand, pasted into the Supabase Dashboard's SQL Editor. They were never
run through the Supabase CLI, so the hosted database has **no**
`supabase_migrations.schema_migrations` tracking rows. Anything that
diffs local migrations against the hosted schema needs to account for
that.

`0002_applications_grants.sql` re-applies grants that `0001` already
contains. It exists because `0001` was originally applied without them
and needed a follow-up. Grants are idempotent, so it is a no-op on a
fresh database; it is kept to preserve the real history.

## Applying to a fresh database

```sql
-- in order
0001_applications.sql
0002_applications_grants.sql
0003_documents.sql
```

Every table has row-level security enabled and is scoped to
`auth.uid()`, so a client using the anon key only ever sees its own
rows. The explicit `grant` statements matter: tables created through
the SQL Editor do not inherit privileges for the `authenticated` role,
and without them requests fail with `42501` before RLS is evaluated.

## Local Supabase

Not yet set up. Running these under `supabase start` for end-to-end
tests needs `supabase init` (to produce `config.toml`) and a check that
the CLI accepts the `NNNN_name.sql` version prefix used here — the CLI
normally generates timestamped filenames.
