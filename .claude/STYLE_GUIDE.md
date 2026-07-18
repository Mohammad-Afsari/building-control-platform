# Style Guide

## TypeScript

**Use `type`, never `interface`.**
```ts
// ✓
type User = { id: string; name: string }

// ✗
interface User { id: string; name: string }
```

**Define types in dedicated files or at the top of the module — never inline with functions.**
```ts
// ✓
type GetUserParams = { id: string }
const getUser = (params: GetUserParams) => { ... }

// ✗
const getUser = (params: { id: string }) => { ... }
```

**Co-locate types with the code they describe.** If a type is used in only one file, define it at the top of that file. If shared across multiple files, place it in `src/types/`.

## Functions

**Use ES6 arrow functions — not `function` declarations — everywhere, including route/page components.** Unlike the Next.js sibling project, there is no framework convention favouring `function` declarations here.
```ts
// ✓
const greet = (name: string) => `Hello, ${name}`

// ✗
function greet(name: string) { return `Hello, ${name}` }
```

## Styling

**One system: Tailwind utility classes in JSX, shadcn/ui patterns for reusable components.** CSS Modules are retired — do not create new `.module.css` files. (Escape hatch: if something genuinely cannot be expressed in utilities — complex keyframes, elaborate pseudo-element art — a co-located plain CSS file is acceptable, but it must use `var(--token)` values and needs a comment explaining why.)

**Every colour, spacing, font, radius, and shadow utility is token-backed.** The design tokens in `src/styles/` are mapped into Tailwind via the `@theme inline` block in `src/index.css`, and Tailwind's default palettes/scales are wiped — so `bg-zinc-500` simply does not compile. If a utility works, it is on-system.

```tsx
// ✓
<div className="rounded-lg border border-border bg-card p-5 shadow-sm">
  <h3 className="text-h3 font-bold tracking-snug text-heading">…</h3>
  <p className="text-body-sm text-muted">…</p>
</div>

// ✗ hardcoded / off-system values
<div className="rounded-[16px] border-[#E7E4DC] bg-white p-[22px]">
```

**Never use arbitrary values (`p-[18px]`, `text-[#1C2622]`) for colour, spacing, or type.** The spacing scale derives from the 4px token base, so fractional steps cover off-grid design values: `p-4.5` = 18px, `gap-1.75` = 7px.

### Utility cheat sheet (token → class)

| Want | Use |
|---|---|
| Surfaces | `bg-page`, `bg-card`, `bg-raised`, `bg-sunken` |
| Text colour | `text-heading`, `text-default`, `text-muted`, `text-faint`, `text-link`, `text-on-brand` |
| Borders | `border-border`, `border-border-strong`, `border-border-focus` |
| Brand | `bg-primary`, `hover:bg-primary-hover`, `active:bg-primary-press`, `bg-primary-subtle`, `text-on-primary`, scale `*-primary-50…900` |
| Status | `*-success`, `*-action-needed`, `*-destructive`, `*-info`, `*-neutral` (+ `-bg`, `-dot` suffixes) |
| Font size | `text-display-lg`, `text-display`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-body-sm`, `text-caption`, `text-micro` |
| Weight | `font-regular`, `font-medium`, `font-semibold`, `font-bold`, `font-black` |
| Tracking / leading | `tracking-tight/snug/normal/wide`, `leading-tight/snug/normal` |
| Radius | `rounded-xs/sm/md/lg/xl/pill` |
| Shadow | `shadow-sm/md/lg`, `shadow-primary`, `shadow-destructive`, focus rings via `ring-3 ring-primary-100` |

⚠️ **`text-body` is the 15px font size. The body copy *colour* is `text-default`.** (The raw token `--text-default` lives in `colors.css`; the size token `--text-body` in `typography.css`.)

**When porting from the design prototypes:** design CSS like `font-size: var(--text-body)` → `text-body`; `color: var(--text-body)` (the prototype's colour usage) → `text-default`. Prefer semantic utilities over raw scales (`text-heading` over `text-ink-900`, `bg-card` over `bg-neutral-0`).

Token source files in `src/styles/` (single source of truth — edit these, never the `@theme` mapping values):

| File | Tokens |
|---|---|
| `colors.css` | `--color-*`, `--surface-*`, `--text-*`, `--border-*`, `--primary-*`, `--ink-*`, `--neutral-*` |
| `spacing.css` | `--space-*`, `--radius-*`, `--shadow-*`, `--container-max` |
| `typography.css` | `--font-*`, `--text-*`, `--weight-*`, `--leading-*`, `--tracking-*` |

## Breakpoints

Mobile-first using Tailwind responsive variants. The variants are mapped to the project's breakpoint tokens in the `@theme` block (`xs` 320 / `sm` 480 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536 — values mirror `src/styles/breakpoints.css`; keep the two in sync if they ever change).

```tsx
// ✓
<div className="h-15 px-5 md:h-16 md:px-7">

// ✗ raw media queries or off-token breakpoints
```

The design prototypes use a 760px breakpoint in places — snap to `md` (768px).

## Accessibility

**Every new or changed component must pass this checklist before it ships.** This is a public-sector-style service (building regulations for homeowners) — assume keyboard and screen-reader users on every page.

- **Semantic elements first**: `button` for actions, React Router's `Link`/`NavLink` for navigation, `nav`/`main`/`header`/`footer` landmarks, `label` wired to inputs — never a `div` with an `onClick`.
- **Keyboard operable**: everything interactive is reachable by Tab and activates with Enter/Space. No positive `tabIndex`. Off-screen/closed UI (drawers, menus) must not be tabbable while hidden.
- **Visible focus**: every interactive element keeps a `focus-visible:` ring (`ring-3 ring-primary-100`, or `ring-destructive-bg` on destructive). Never remove `outline` without a replacement.
- **Icon-only controls get `aria-label`** (`TopNavIconButton aria-label="Notifications"`). Decorative icons and dots get `aria-hidden="true"`. Images: meaningful `alt`, or `alt=""` when the adjacent text already says it (see `logo.tsx`).
- **State is exposed to the a11y tree, not just styled**: `aria-current="page"` for active nav (React Router's `NavLink` sets this automatically), `aria-expanded` + `aria-controls` for disclosure, `aria-invalid` for error inputs, `disabled` (not a class) for disabled controls.
- **Forms**: every input has a `label` (`htmlFor`/`id`); hint and error text is connected with `aria-describedby`; errors are announced (`role="alert"` or `aria-live="polite"`) when they appear dynamically.
- **Colour is never the only signal** — pair it with text or an icon (status pills carry a label, errors have a message + icon).
- **Contrast comes from approved token pairs** in the cheat sheet above (e.g. `text-muted` on `bg-card` is fine; `text-faint` is for de-emphasised metadata only, never body copy or labels).
- Respect `prefers-reduced-motion` (`motion-safe:`/`motion-reduce:`) on anything animated beyond simple colour transitions.

## Imports

Use the `@/` path alias for all non-relative imports. `@/` maps to the **repo root**, so `src/` paths are `@/src/...`.

```ts
// ✓
import { cn } from '@/src/lib/utils'

// ✗
import { cn } from '../../../lib/utils'
```

## Data fetching

This is a client-only SPA — there are no server components, server actions, or route handlers. All Supabase calls run in the browser via `@/src/lib/supabase/client`, scoped by RLS to the signed-in user. Wrap reads/writes in TanStack Query (`useQuery`/`useMutation`) rather than fetching in a raw `useEffect`, so loading/error/caching/refetch behaviour stays consistent across the app.

## Routing

Routes are declared in `src/App.tsx` using React Router. Gate authenticated routes with `<ProtectedRoute>` (`@/src/components/protected-route`). Because this is a pure SPA, there's no server-side redirect before first paint — `ProtectedRoute` renders nothing while the session is loading, then redirects client-side. Don't try to work around this with server-only patterns; it's an accepted tradeoff of the SPA architecture.
