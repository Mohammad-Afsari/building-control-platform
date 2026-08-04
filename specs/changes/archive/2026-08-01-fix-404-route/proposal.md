---
title: Show a not-found page instead of a blank screen
status: done
capability: chrome-errors
design: design/Error Pages.html
---

## Why

There is no catch-all route, so any URL that matches nothing renders a
blank white page — no message, no way back, no indication anything went
wrong.

This is reachable today, not hypothetical. The login page's "Forgot
password?" link points at `/forgot-password`, which has no route, so
anyone clicking it lands on nothing. Mistyped URLs and stale links do
the same.

## Scope

### In scope

- A not-found page matching the 404 variant of `design/Error Pages.html`
- A catch-all route so unmatched paths render it

### Out of scope

- **Building the forgot-password feature.** This change stops the link
  landing on a blank page; it does not implement password reset. That
  is its own change, and `design/Forgot Password.html` already exists
  for it.
- The 500 variant in the same design file. Nothing renders it today —
  a client-side SPA has no server error to catch — and adding an error
  boundary is a separate concern.
- Removing or repointing the "Forgot password?" link. It stays as-is;
  once this lands it degrades to a helpful page rather than a blank one.

## Acceptance criteria

- WHEN a visitor opens a URL matching no route, THE SYSTEM SHALL render
  the not-found page.
- WHEN the not-found page renders, THE SYSTEM SHALL display the heading
  "We can't find that page".
- WHEN the not-found page renders, THE SYSTEM SHALL set the document
  title.
- WHEN a visitor activates the home link on the not-found page, THE
  SYSTEM SHALL navigate to the home page.
- WHILE the not-found page is rendered, THE SYSTEM SHALL keep exactly
  one `h1` on the page.
- WHEN a visitor opens a path that does match a route, THE SYSTEM SHALL
  render that route and SHALL NOT render the not-found page.

## Tests required

- `src/routes/not-found.test.tsx` — one assertion per criterion above:
  renders at an unmatched path, heading text, document title, home link
  navigates, single `h1`
- `src/routes/not-found.test.tsx` — regression: `/login` still renders
  the login page, proving the catch-all has not shadowed real routes

## Decisions

- **Home link only.** The design's 404 variant also offers "Go to
  dashboard" and "Contact support", but neither destination usefully
  exists: `/applications` is behind auth and would bounce a signed-out
  visitor straight to login — a worse dead end than the 404 itself —
  and there is no support route at all. A button that strands you is
  worse than no button. Revisit when both destinations are real.
