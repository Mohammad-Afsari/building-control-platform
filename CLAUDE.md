# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start development server
npm run build    # typecheck + production build
npm run lint     # run ESLint
npm run test     # Vitest in watch mode
npm run test:run # Vitest once (what CI runs)
npm run preview  # preview the production build locally
```

`npm run build` typechecks test files too, so a type error in a `.test.tsx` fails the build.

Docker: `docker build --target dev .` for a dev image, `docker compose up` for local dev with hot-reload, `docker build .` (defaults to the `serve` target) for the production nginx image.

## Architecture

Single-page React app built with Vite, deployed as static files (target host: Bunny CDN/Storage). There is no server: no SSR, no server actions, no API routes. All data access goes through the Supabase JS client directly from the browser, scoped by Postgres RLS to the signed-in user.

**Stack: React 19 + Vite + TypeScript + React Router + TanStack Query + Tailwind CSS 4 + shadcn/ui-style components + Supabase.** This is a rebuild of `building-control-storefronts` (the original Next.js implementation) as a pure SPA — see that repo's git history for original feature context where relevant.

**Database schema lives in `supabase/migrations/`.** Ported from storefronts, which shares the same Supabase project. Applied by hand via the SQL Editor rather than the CLI, so the hosted database has no migration tracking rows — see [`supabase/README.md`](./supabase/README.md) before diffing or automating against it.

### Design system

- **Mockups live in [`design/`](./design/)** — a snapshot of the Claude Design project, committed so anything implementing a change can see the intended appearance. **They are a visual spec, not an implementation:** they use their own class names (`bc-btn`, `bc-input`) and stylesheet, and their scripts fake behaviour. Recreate the rendered output with this repo's components and tokens; never transplant a class name or a rule from `design/styles.css`. `design/tokens/` is reference only — `src/styles/` is what actually compiles. See [`design/README.md`](./design/README.md), which also records the export date, since the mirror goes stale silently.
- **Tokens** live in `src/styles/` (`colors.css`, `spacing.css`, `typography.css`, `breakpoints.css`) — the single source of truth. They are mapped into Tailwind utilities via the `@theme inline` block in `src/index.css`; Tailwind's default palettes are wiped, so only token-backed utilities compile.
- **Naming gotcha:** `text-body` is the 15px font-size utility; the body copy *colour* is `text-default`.
- **UI primitives** are in `src/components/ui/` (shadcn-style: CVA variants + `cn()` + `data-slot`); composite components sit in `src/components/`.
- There is **no dark mode** — the token set is light-only.

### Testing

**Vitest + React Testing Library, jsdom environment.** Tests sit next to the code they cover (`src/routes/login.test.tsx`); shared helpers are in `src/test/`.

- **Supabase is always mocked in unit tests** — `src/test/supabase-mock.ts` provides `createSupabaseMock()`, and every test file mocks `@/src/lib/supabase/client` with it. Nothing here talks to a real backend; anything that needs live Postgres or GoTrue belongs in an end-to-end suite instead.
- **Render through `renderWithProviders`** (`src/test/render.tsx`) — it supplies `HelmetProvider`, `QueryClientProvider` and a `MemoryRouter`, and takes a `route` so a component can read its own search params and hash.
- **`StrictMode` only double-invokes effects when it is the outermost element passed to `render`.** Nesting it under any provider — even a bare `<div>` — silently disables the double invoke, which makes a test that exists to catch double-firing incapable of failing. Use `renderWithProviders(ui, { strict: true })`, which wraps at the correct level.
- **New behaviour needs a test, and a regression fix needs one that fails without the fix.** Verify that by reverting the fix and watching the test go red — several tests in `auth-confirm.test.tsx` exist precisely because the bugs they cover shipped once already.

#### End-to-end

**Playwright against a local Supabase stack**, in `e2e/`. Needs Docker running.

```bash
npx supabase start   # Postgres + GoTrue + Mailpit, applies supabase/migrations/
npm run test:e2e     # builds the app, serves it on :4173, runs the specs
npx supabase stop
```

- **Real backend, no shared state.** The stack is local and disposable, so tests can create users freely — unlike the hosted project, where they'd collide with real data and hit email rate limits.
- **Email is assertable.** Outbound mail is captured by Mailpit on `:54324` instead of being delivered; `e2e/mailbox.ts` reads it over the API so a test can follow a real confirmation link. This is why the signup → confirm flow is covered end to end rather than mocked.
- **`playwright.config.ts` reads the API URL and anon key from `supabase status`** rather than hardcoding them, and passes them to the build. If the stack isn't running, it fails with a message telling you to start it.
- **`supabase/config.toml` deliberately diverges from the CLI defaults**: `enable_confirmations` is on (the hosted project requires it, and the suite exercises it), and `site_url`/`additional_redirect_urls` point at `:4173` so the emailed link redirects back to the app under test.
- **`tsconfig.node.json` covers `e2e/` and `playwright.config.ts`**, since they run in Node rather than the browser. Its `nodenext` resolution wants explicit extensions, hence `./mailbox.ts` in imports.

### Non-obvious conventions

**`@/` path alias maps to the repo root, not `src/`.** Imports from the `src/` subtree must be written as `@/src/lib/...`, not `@/lib/...`.

**There is no middleware/proxy layer.** Bot-blocking and path-blocking (WordPress scanner probes, etc.) are the hosting layer's job — configure them at the CDN/edge (Bunny), not in application code.

**Auth state lives in `src/lib/auth-context.tsx`.** `AuthProvider` wraps the app and exposes `useAuth()` (`user`, `session`, `loading`) via `supabase.auth.getSession()` + `onAuthStateChange`. Route protection is client-side only (`src/components/protected-route.tsx`) — there's an unavoidable flash-before-redirect on cold load for signed-out users hitting a protected route directly; this is an accepted SPA tradeoff, not a bug to fix.

**Data fetching goes through TanStack Query**, calling `@/src/lib/supabase/client` directly in `queryFn`/`mutationFn` — there are no server actions to call instead. See the pattern in `.claude/COMPONENT_PATTERNS.md`.

**Prettier enforces no semicolons.** The `.prettierrc.js` config uses `semi: false`, single quotes, 2-space indent, 80-char line width, and trailing commas.

**Node version is pinned to 24 LTS** via `.nvmrc` and `package.json` `engines`, matching the Docker base image (`node:24-alpine`).

## Code Style

Full rules are in [`.claude/STYLE_GUIDE.md`](./.claude/STYLE_GUIDE.md) and concrete examples in [`.claude/COMPONENT_PATTERNS.md`](./.claude/COMPONENT_PATTERNS.md). Key rules to enforce on every change:

- **`type` over `interface`** — never use `interface`.
- **Arrow functions everywhere** — `const fn = () => {}`, including route components (no framework exception here, unlike the Next.js sibling project).
- **Tailwind utilities, one system** — style in JSX with token-backed utilities; shadcn/ui patterns for reusable components. Do not create new CSS Modules.
- **No inline types on functions** — extract all parameter and return types to named `type` aliases, defined at the top of the file or in `src/types/`.
- **Design tokens only** — never hardcode colour, spacing, font, radius, or shadow values; no arbitrary utilities like `p-[18px]` (the 4px-base scale covers off-grid values: `p-4.5` = 18px). See the cheat sheet in [`.claude/STYLE_GUIDE.md`](./.claude/STYLE_GUIDE.md).
- **Accessibility on every component** — semantic elements, keyboard operability, visible focus, labelled icon-only controls, `aria-hidden` decorative icons. Checklist in [`.claude/STYLE_GUIDE.md`](./.claude/STYLE_GUIDE.md).
- **Document title on every route** — set via `react-helmet-async`, exactly one `h1`, semantic landmarks. Pattern in [`.claude/COMPONENT_PATTERNS.md`](./.claude/COMPONENT_PATTERNS.md).

## Workflow

All changes go through a feature branch and pull request — never commit directly to `main`.

### Spec-driven development

Work is described in [`specs/`](./specs/) before it is built. A **change** is one PR-sized piece of work; merged changes amend a **capability**, which records what the system does today.

Four steps, each a separate pull request you review:

1. **`/new-spec <description>`** → `specs/changes/<name>/proposal.md` — what and why, acceptance criteria in EARS notation, tests required
2. **`/plan <name>`** → `design.md` + `tasks.md` — how, and why that way
3. **`/implement-spec <name>`** → works `tasks.md` one task at a time, commits per task, opens a PR
4. **`/archive-spec <name>`** → folds the criteria into `specs/capabilities/` and moves the change to `specs/changes/archive/`

**Every step is invoked by a person — nothing fires on merge.** That matches how OpenSpec and Kiro actually work; both are editor-invoked with someone watching. Automating the trigger is easy later, but doing it before the loop is proven means finding out the prompt is wrong through pull requests nobody saw being made.

Naming is verb-led kebab-case matching the branch (`add-about-page`), with no numeric prefix — parallel proposals would race for the same number and a folder collision is not something git flags.

**Acceptance criteria are immutable during implementation.** Only `status` may change. `scripts/check-spec-immutability.mjs` enforces this in CI: a PR that rewrites a proposal while also touching `src/` or `e2e/` is rejected. Amending a proposal deliberately is fine, in a PR that changes nothing else.

Rules for whoever implements a change — including the hard limits — are in [`specs/IMPLEMENTATION_RULES.md`](./specs/IMPLEMENTATION_RULES.md).
