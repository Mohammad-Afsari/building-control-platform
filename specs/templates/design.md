# Design — <change name>

Written at the planning stage, read later by whoever implements this —
often an agent with no memory of the conversation that produced the
proposal. Record the reasoning, not just the conclusion, so nobody has
to re-derive it or quietly pick differently.

## Approach

How this gets built, in a few sentences.

## Alternatives rejected

- **<other approach>** — <why not>

The most valuable section here. Without it the next reader reopens a
decision that was already settled.

## Components

- **new:** `<path>` — <purpose>
- **modified:** `<path>` — <what changes>

## Patterns to follow

Point at what already exists rather than inventing:

- Which primitives from `src/components/ui/` to reuse
- Which conventions from `.claude/COMPONENT_PATTERNS.md` apply
- Anything in the codebase that already does something similar

## Visual reference

If the proposal names a file under `design/`, say what to take from it.

**That HTML is a visual spec, not an implementation.** It uses its own
classes (`bc-btn`, `bc-input`) and stylesheet. Recreate the rendered
output with this repo's Tailwind primitives and design tokens — never
transplant its class names or CSS. `design/tokens/*.css` is reference
only; `src/styles/*.css` is the source of truth.

## Data and schema

Tables, columns, RLS policies, migrations. Write "none" if none.

A change touching the database needs a migration in
`supabase/migrations/`, and the end-to-end suite will build a fresh
database from those files.

## Test strategy

- **Unit** — what is covered with Vitest and a mocked Supabase client
- **End-to-end** — what needs a real browser and local Supabase, if any

Most changes are unit-only. Reach for end-to-end when the risk is in a
seam: redirects, sessions, email, anything crossing a network boundary.

## Open questions

- [NEEDS CLARIFICATION: <question>]

Resolve these before implementation starts. An unanswered question here
becomes a guess in the code.
