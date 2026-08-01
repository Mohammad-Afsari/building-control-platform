# Design — fix-404-route

## Approach

A route component at `src/routes/not-found.tsx`, registered in
`src/App.tsx` as `<Route path="*">` — the last child of `<Routes>`.

React Router matches the most specific route first, so a `*` path only
wins when nothing else does. Position in the list does not technically
decide the match, but keeping it last makes the intent obvious to
anyone reading `App.tsx`.

The page is public. It has to be — a signed-out visitor mistyping a URL
is the main case, and putting it behind `ProtectedRoute` would redirect
them to login, which is precisely the dead end this change exists to
remove.

## Alternatives rejected

- **An error boundary.** Catches thrown exceptions during render, not
  unmatched URLs. Nothing throws here; there is simply no match. Wrong
  mechanism, and it would leave the blank page in place.
- **A redirect to `/`.** Loses the information that something was
  wrong. A visitor following a stale link silently lands on the home
  page and never learns the link is dead.
- **Reusing `AuthShell`.** Tempting, since it already centres content
  under the logo lockup, but it carries a "Back to home" footer and
  auth-specific spacing. Borrowing it would couple the error page to
  the auth flow's layout decisions for no real gain.

## Components

- **new:** `src/routes/not-found.tsx` — the `NotFoundPage` route
- **modified:** `src/App.tsx` — add the catch-all route and its import

## Patterns to follow

From `.claude/COMPONENT_PATTERNS.md`:

- Arrow function component, named export
- `<Helmet>` with a title ending `· Building Control`
- Exactly one `h1`; content inside a `<main>` landmark
- Token-backed Tailwind utilities only — no arbitrary values

Reuse:

- `Button` with `asChild` wrapping a React Router `Link`, as
  `signup.tsx` does for its "Go to log in" action
- `Logo` from `src/components/logo.tsx` for the brand mark
- `MapPinOff` from `lucide-react` — the icon the design uses for this
  variant

## Visual reference

`design/Error Pages.html`, **Variant 1** only. The file also holds a
500 variant, which the proposal puts out of scope.

Take from it: the centred single-column layout, the round badge holding
the icon, the `Error 404` eyebrow above the heading, the heading *"We
can't find that page"*, and the body copy about the link possibly being
out of date.

**That HTML is a visual spec, not an implementation.** It uses
`bc-btn`, `btn-primary`, `err-badge` and its own stylesheet, and its
scripts are prototype-only. Recreate the rendered output with this
repo's components and design tokens. Never transplant a class name or a
CSS rule.

### The header, deliberately omitted

The mockup puts a full site header on the error page — logo, "Help",
"Log in". There is no shared header component in the codebase; the one
on the home page is inline in `home.tsx`.

So the options were to duplicate that markup, or extract a shared
header. Duplicating it creates a second thing to keep in sync;
extracting one is a real change of its own and outside this scope.

Render the `Logo` above the error content instead, as `AuthShell` does.
The page is then self-contained and honest about what it is. Extracting
a shared site header is worth its own change once a second page needs
one.

### Actions

Per the proposal's recorded decision: **home link only.** Do not build
the design's "Go to dashboard" or "Contact support" buttons — their
destinations do not usefully exist yet.

## Data and schema

None. No Supabase involvement, no migration.

## Test strategy

**Unit only.** Nothing here crosses a network boundary, touches auth,
or involves a session — the conditions that would justify reaching for
the end-to-end suite. Routing is fully exercisable with
`renderWithProviders` and a `MemoryRouter`.

`src/routes/not-found.test.tsx` renders the real `<Routes>` tree from
`App.tsx`'s shape rather than the component alone, because the two
criteria most likely to break — that an unmatched path reaches it, and
that a matched path does not — are properties of the routing
configuration, not of the component.

The `/login` regression matters more than it looks. A catch-all placed
or written carelessly can shadow real routes, and the failure would be
silent: every page renders as 404 and nothing errors.

## Open questions

None. The one from the proposal was resolved before planning.
