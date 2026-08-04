# Design — build-applications-dashboard

## Approach

Keep `/applications` behind the existing `ProtectedRoute`, then let
`ApplicationsListPage` compose the signed-in navigation and one of four route
states: loading, load failure, first run, or populated dashboard.

The route reads the current `User` from `useAuth()` and uses TanStack Query to
call a dedicated applications query function. The query selects only the
summary columns needed by the dashboard and orders by `updated_at` descending.
Its query key includes `user.id` so signing out and then signing in as a
different applicant cannot reuse the first applicant's browser cache. The SQL
request does not trust display metadata or a client-supplied owner filter for
authorization; the authenticated Supabase client and existing RLS policy are
the security boundary.

Split the visual states into focused app-specific components rather than
turning the route into one large file:

- `AppNav` owns the responsive signed-in chrome, active Dashboard link,
  account identity, mobile disclosure, and sign out.
- `ApplicationsLoading` renders the accessible skeleton.
- `ApplicationsFirstRun` renders the zero-row welcome and explanation.
- `ApplicationsDashboard` owns status counts, filter/search state, persisted
  list/card preference, six-row pagination, and application links.

The populated dashboard loads the applicant's summary rows once and performs
filtering, searching, counts, and pagination in memory. An individual
applicant is expected to have a modest number of applications, this matches the
approved interaction model, and it keeps all counts and searches responsive
without several coordinated API requests. Revisit server-side pagination if
real accounts begin reaching hundreds of rows.

## Alternatives rejected

- **Port the Next.js page verbatim** — the sibling implementation depends on
  server components, server-side redirects, `next/link`, `next/image`, and
  server actions. Its behaviour is a useful reference, but this application is
  a client-only React Router SPA.
- **Copy the exported HTML, CSS, and JavaScript** — the export uses prototype
  classes, sample data, direct DOM mutation, inline values, and fake links. It
  would bypass the repository's components, tokens, accessibility rules, and
  real Supabase state.
- **Keep every state and helper in `list.tsx`** — the populated list/cards,
  first-run illustration, loading skeleton, and signed-in navigation are
  independently understandable composites. Splitting them keeps the route
  focused and makes later application pages able to reuse the navigation.
- **Filter by a user ID supplied from `user_metadata`** — user metadata is for
  the greeting only and is user-editable. Row ownership remains enforced by
  `applications_select_own` through the authenticated JWT and RLS.
- **Use a service-role client** — this is a public browser application; a
  service key would bypass RLS and must never be exposed. The normal client is
  sufficient because the migration grants `SELECT` to `authenticated`.
- **Render all controls from the prototype** — Notifications, profile,
  settings, help, guidance, payment, certificate download, and feedback do not
  all have real destinations. Rendering them would violate the proposal's
  no-dead-links criterion. Keep identity, Dashboard, Home, and Sign out; every
  application-status result links to its existing detail route.
- **Server-side filtering and pagination now** — it would require coordinated
  count queries and remote search for a data volume the product does not yet
  have. The selected summary payload is small, RLS-scoped, and cached per user.

## Components

- **new:** `src/lib/applications.ts` — fetch and map the RLS-scoped application
  summary query, throwing Supabase errors for TanStack Query to expose.
- **new:** `src/components/app-nav.tsx` — responsive signed-in navigation using
  React Router, `Logo`, a passed authenticated `User`, and
  `supabase.auth.signOut()`.
- **new:** `src/components/applications-loading.tsx` — dashboard skeleton with
  `aria-busy` and a screen-reader loading status.
- **new:** `src/components/applications-first-run.tsx` — designed empty account
  hero, trust points, steps, and `/applications/new` call to action.
- **new:** `src/components/applications-dashboard.tsx` — populated heading,
  status configuration, filters, search, list/card presentations, no-match
  state, relative timestamps, and pagination.
- **modified:** `src/routes/applications/list.tsx` — document title, user-scoped
  query orchestration, signed-in navigation, retryable error alert, and state
  composition.
- **modified:** `src/test/supabase-mock.ts` — reusable typed support for the
  chained `from().select().order()` read and authenticated sessions.
- **new:** `src/routes/applications/list.test.tsx` — route and dashboard unit
  coverage required by the proposal.
- **modified:** `playwright.config.ts` — expose the local Supabase API URL and
  public test key to Playwright workers as well as the app build.
- **new:** `e2e/supabase.ts` — local-only helpers that create confirmed users
  and RLS-scoped application fixtures with public authenticated clients.
- **new:** `e2e/applications.spec.ts` — real-browser ownership, ordering,
  navigation, and mobile-control coverage against local Supabase.

`src/App.tsx`, `src/types/application.ts`, and the database migrations do not
need changes: the route, domain types, table, grants, and RLS policy already
exist.

## Patterns to follow

- Use the `useQuery` and Supabase mapping pattern in
  `.claude/COMPONENT_PATTERNS.md`; query key
  `['applications', user.id]`, and throw when Supabase returns an error.
- Reuse `Button`, `Input`, `Card`, `StatusBadge`, and `Alert` from
  `src/components/ui/`; use `Logo` for the brand rather than recreating it.
- Use React Router `Link`/`NavLink`, not anchors or programmatic `window`
  navigation. Each application result has one clear link to
  `/applications/:id`.
- Keep shared domain labels in `src/types/application.ts`. The five visual
  status configurations may remain local to `ApplicationsDashboard` because
  their progress copy and icons are dashboard presentation, not domain data.
- Read the display name from `user.user_metadata.full_name` only for copy;
  trim it, take its first word, then fall back to `user.email` and finally
  `there`. Never use metadata for authorization.
- Use a lazy `useState` initializer for the `bc_dash_view` local-storage value
  so restoring the preference does not require an effect-driven state update.
- Reset page one whenever the filter or query changes. Clamp the current page
  after filtering so an empty later page cannot be displayed.
- Use semantic buttons with `aria-pressed` for status/view choices,
  `aria-current="page"` for pagination and active navigation, and
  `aria-expanded`/`aria-controls` for the mobile menu.
- Use token-backed Tailwind utilities and the `md` breakpoint. No prototype
  class names, copied CSS, raw 760px breakpoint, arbitrary colour, or inline
  style values.
- Set exactly one `h1` and `<title>Your applications · Building Control</title>`
  for every state of the route.

## Visual reference

- `design/Applicant Dashboard.html` is the primary populated layout: sticky
  signed-in header, greeting and title, start action, status controls, search,
  list/cards, no-match feedback, and pager.
- `design/Applicant Dashboard - First Run.html` supplies the empty hero,
  illustration, trust points, and three-step explanation. Omit its final
  guidance/support links because those routes do not exist.
- `design/Session & Loading States.html` variant 2 supplies the dashboard
  skeleton and accessible loading announcement.

The populated prototype only demonstrates draft and submitted sample rows.
Use the existing five values in `ApplicationStatus` and `StatusBadge` for real
data. Draft results say “Continue”; every other status says “View” and leads to
the existing detail route. Do not label an action Download or See feedback
until those distinct experiences exist.

The error state has no dedicated mockup. Compose the existing danger `Alert`
and secondary `Button` inside the same dashboard container, preserving the
signed-in navigation and page title. It must clearly differ from first run and
offer `refetch()`.

These files are visual specifications only. Recreate them using repository
components and `src/styles/` tokens; never copy their classes, CSS, scripts, or
sample records.

## Data and schema

No schema change.

Read through the browser Supabase client:

```text
public.applications
  select: id, name, address, reference, status, type, category, updated_at
  order: updated_at descending
```

The existing `applications_select_own` policy limits rows to
`auth.uid() = user_id`, and the migration already grants table `SELECT` to the
`authenticated` role. This explicit grant also satisfies Supabase's current
Data API exposure requirements. The UI must propagate query errors instead of
converting them to an empty array, because an unavailable table or denied grant
is not a first-run account.

No service role, secret key, schema migration, policy change, or direct use of
`user_metadata` for authorization is permitted.

## Test strategy

- **Unit** — render the route with `renderWithProviders`, a signed-in session,
  and a chainable Supabase mock. Assert loading semantics; failure versus empty
  state and retry; first-run content; full-name and fallback greetings; all
  five status counts; status filtering; case-insensitive name/address/reference
  search; no-match feedback; page reset and six-item pagination; persisted
  list/card preference; application/new links; document title; active nav,
  mobile disclosure, labelled controls, focusable buttons, and omission of
  dead destinations. Use fake time for greeting and relative-date assertions.
- **End-to-end** — against the disposable local Supabase stack, create two
  confirmed users through public Auth clients, insert newer and older
  applications as each authenticated user, and log the owner in through the
  UI. Assert the owner sees only their rows in newest-first order, can open the
  correct `/applications/:id`, and can operate the mobile navigation with the
  keyboard. Use unique addresses per run; no hosted project or service-role
  credential.

The implementation must run `npm run lint`, `npm run build`,
`npm run test:run`, and `npm run test:e2e` locally before pushing.
