# Component Patterns

Reference for the correct shape of every component in this codebase. See `STYLE_GUIDE.md` for the rules behind these patterns. The canonical living examples are the files in `src/components/ui/`.

---

## Where things live

```
src/components/ui/      shadcn-style primitives (button, input, alert, …)
src/components/         composite, app-specific components (protected-route, …)
src/routes/<route>/     route components — compose components, no reusable UI defined here
src/lib/                utils.ts (cn() helper), supabase client, auth context
src/types/              shared type aliases
```

New shadcn registry components can be added with `npx shadcn add <name>` — but they arrive styled with shadcn's default theme keys, so restyle them with our token utilities before use.

---

## UI primitive (variants via CVA)

One file per component in `src/components/ui/`. Arrow-function components, `type` aliases, variants via `class-variance-authority`, classes merged with `cn`, a `data-slot` attribute on every rendered element, and `className` always forwarded last.

```tsx
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/src/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.75 rounded-pill text-caption font-bold',
  {
    variants: {
      status: {
        draft: 'bg-neutral-bg text-neutral',
        approved: 'bg-success-bg text-success',
      },
    },
    defaultVariants: { status: 'draft' },
  },
)

type StatusBadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof statusBadgeVariants>

const StatusBadge = ({ className, status, ...props }: StatusBadgeProps) => {
  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ status, className }))}
      {...props}
    />
  )
}

export { StatusBadge, statusBadgeVariants }
```

Conventions that matter:

- **Props extend the native element**: `React.ComponentProps<'button'>` etc., so consumers can pass any DOM prop.
- **`asChild`** (via `@radix-ui/react-slot`) on anything that may need to render as React Router's `Link` or another element.
- **Multi-part components export named parts** (`Card`, `CardHeader`, `CardTitle`, …) rather than taking a dozen props. Parts that need parent state share it through React context.
- **Variant styling of children** from a parent variant uses `data-slot` descendant selectors, e.g. `'[&_[data-slot=alert-icon]]:bg-info-bg'`.
- **States are real pseudo-classes** (`hover:`, `focus-visible:`, `active:`, `disabled:`, `aria-invalid:`) — never `.is-hover`-style state classes.
- **Accessibility is part of the component, not the call site.** Bake in the semantic element, focus ring, and aria wiring (`aria-expanded`, `aria-current`, `aria-invalid`, `aria-hidden` on decorative parts) so consumers get it for free — see the checklist in `STYLE_GUIDE.md`.

---

## Route Component

Route components live in `src/routes/` (e.g. `src/routes/applications/detail.tsx`) and are wired into the tree in `src/App.tsx`. Always arrow functions — there is no framework exception here (unlike the Next.js sibling project). Compose existing components and style layout with token utilities directly — if a piece of UI is reusable, extract it to `src/components/` instead of growing the route file.

**Every route owns its document title.** Non-negotiables on each new route:

- Set the tab title with `react-helmet-async`'s `<Helmet><title>… · Building Control</title></Helmet>` — there's no root layout title template like Next.js's, so include the suffix directly.
- Exactly one `h1`, and a heading hierarchy that doesn't skip levels — pick heading levels by structure, style with utilities (`text-h3 …` on an `h2` is fine).
- Content in semantic landmarks (`main`, `nav`, `header`, `footer`).
- This is a SPA with no public/indexable pages, so there's no `robots`/SEO metadata concern — every route is effectively private by nature of being client-rendered behind auth (or, for `/login`/`/signup`, not worth indexing anyway).

```tsx
import { Helmet } from 'react-helmet-async'
import { Button } from '@/src/components/ui/button'

export const ApplicationsListPage = () => {
  return (
    <>
      <Helmet>
        <title>Your applications · Building Control</title>
      </Helmet>
      <main className="mx-auto max-w-205 px-7 pt-7.5 pb-20 max-sm:px-4.5 max-sm:pb-16">
        <h1 className="text-display font-black tracking-tight text-heading">
          Your applications
        </h1>
        <Button size="lg">New application</Button>
      </main>
    </>
  )
}
```

Small route-local helpers (a section wrapper used five times on one route) may be defined as arrow components in the route file — do not export them.

---

## Porting a design prototype

The HTML prototypes (Claude Design handoff bundle) are the visual spec, not the implementation. Recreate the rendered output with our components and token utilities; don't transplant their class names or copy their CSS. Checklist:

1. Reuse an existing `src/components/ui/` primitive if one matches — extend it with a variant rather than forking.
2. Translate raw px to the token scale (4px base: `13px → px-3.25`, `18px → px-4.5`).
3. Design values with no token (one-off rgba shadows, derived hovers) get composed from tokens with `color-mix()` in the `@theme` block in `src/index.css` — never inlined as hex.
4. Icons are `lucide-react`, sized with `[&_svg]:size-*` on the parent.

## Shared Types

Types used across more than one file go in `src/types/`. One file per domain.

```ts
export type BuildingStatus = 'active' | 'inactive' | 'maintenance'

export type Building = {
  id: string
  name: string
  address: string
  status: BuildingStatus
  createdAt: string
}
```

## Data fetching pattern

Reads and writes go through TanStack Query, calling the shared Supabase client directly — there are no server actions in this app.

```ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/lib/supabase/client'
import type { ApplicationSummary } from '@/src/types/application'

export const useApplications = () =>
  useQuery({
    queryKey: ['applications'],
    queryFn: async (): Promise<ApplicationSummary[]> => {
      const { data, error } = await supabase
        .from('applications')
        .select('id, name, address, reference, status, type, category, updated_at')
        .order('updated_at', { ascending: false })

      if (error) throw error

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        address: row.address,
        reference: row.reference,
        status: row.status,
        type: row.type,
        category: row.category,
        updatedAt: row.updated_at,
      }))
    },
  })
```
