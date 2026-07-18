# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start development server
npm run build    # typecheck + production build
npm run lint     # run ESLint
npm run preview  # preview the production build locally
```

No test suite is configured.

Docker: `docker build --target dev .` for a dev image, `docker compose up` for local dev with hot-reload, `docker build .` (defaults to the `serve` target) for the production nginx image.

## Architecture

Single-page React app built with Vite, deployed as static files (target host: Bunny CDN/Storage). There is no server: no SSR, no server actions, no API routes. All data access goes through the Supabase JS client directly from the browser, scoped by Postgres RLS to the signed-in user.

**Stack: React 19 + Vite + TypeScript + React Router + TanStack Query + Tailwind CSS 4 + shadcn/ui-style components + Supabase.** This is a rebuild of `building-control-storefronts` (the original Next.js implementation) as a pure SPA — see that repo's git history for original feature context where relevant.

### Design system

- **Tokens** live in `src/styles/` (`colors.css`, `spacing.css`, `typography.css`, `breakpoints.css`) — the single source of truth. They are mapped into Tailwind utilities via the `@theme inline` block in `src/index.css`; Tailwind's default palettes are wiped, so only token-backed utilities compile.
- **Naming gotcha:** `text-body` is the 15px font-size utility; the body copy *colour* is `text-default`.
- **UI primitives** are in `src/components/ui/` (shadcn-style: CVA variants + `cn()` + `data-slot`); composite components sit in `src/components/`.
- There is **no dark mode** — the token set is light-only.

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
