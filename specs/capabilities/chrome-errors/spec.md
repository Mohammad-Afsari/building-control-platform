---
capability: chrome-errors
updated_by: fix-404-route
---

# Error and not-found pages

What a visitor sees when they land somewhere that does not exist.

## Behaviour

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

## Covered by

- `src/routes/not-found.test.tsx` — one test per behaviour above,
  including that a matched route is not shadowed by the catch-all

## Notes

**The not-found page is public.** Putting it behind `ProtectedRoute`
would redirect a signed-out visitor to login, which is the dead end the
page exists to remove.

**No site header.** `design/Error Pages.html` shows one, but there is
no shared header component — the home page's is inline. Rather than
duplicate that markup or extract a shared component mid-change, the
page renders the `Logo` above its content, as `AuthShell` does.
Extracting a real site header is worth doing when a second page needs
one.

**Home link only.** The design also offers "Go to dashboard" and
"Contact support". Neither destination usefully exists: `/applications`
is behind auth and would bounce a signed-out visitor to login, and
there is no support route. Worth revisiting when both are real.

**No 500 page.** `design/Error Pages.html` includes one, but nothing
renders it — a static SPA has no server error to catch. Covering
runtime exceptions would mean an error boundary, which is a separate
concern.
