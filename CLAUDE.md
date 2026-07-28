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
