---
title: Build the applications dashboard
status: proposed
capability: applications-dashboard
design: design/Applicant Dashboard.html
---

## Why

Signed-in applicants currently land on a placeholder at `/applications`, so
they cannot see, find, or resume the applications stored in Supabase. Replace
that placeholder with the designed dashboard and its first-run variant so the
route becomes the useful centre of the applicant experience.

## Scope

### In scope

- The responsive signed-in application navigation and dashboard page shown in
  `design/Applicant Dashboard.html`.
- The zero-application experience shown in
  `design/Applicant Dashboard - First Run.html`.
- The accessible dashboard loading state shown in
  `design/Session & Loading States.html`.
- Reading the signed-in applicant's applications from Supabase, newest first.
- Status counts and filtering for all five stored statuses, case-insensitive
  search, list and card views, six-item pagination, and no-match feedback.
- Navigation from dashboard actions to the existing new-application and
  application-detail routes.
- An explicit retryable error state that cannot be mistaken for a genuinely
  empty account.

### Out of scope

- Changing the application wizard or application-detail page.
- Creating notifications, guidance, support, profile, payment, certificate
  download, or feedback experiences whose destinations do not yet exist.
- Changing the `applications` table, RLS policies, or any other database
  schema.
- Copying prototype classes, CSS, scripts, or sample application data from the
  design export into the React application.

## Acceptance criteria

- WHEN a signed-in applicant opens `/applications`, THE SYSTEM SHALL load only
  that applicant's applications and order them by most recently updated first.
- WHILE the applications request is unresolved, THE SYSTEM SHALL render the
  dashboard loading skeleton with an accessible loading status.
- WHEN the applications request fails, THE SYSTEM SHALL show an error message
  and retry control without presenting the first-run experience.
- WHERE the applicant has no applications, THE SYSTEM SHALL render the
  first-run welcome, trust points, three-step explanation, and a link to start
  the first application.
- WHERE the applicant has applications, THE SYSTEM SHALL render the personalised
  dashboard heading, a start-new-application link, and a count for every stored
  application status.
- WHERE an applicant name is available in authentication metadata, THE SYSTEM
  SHALL use its first word in the greeting and fall back safely when it is not
  available.
- WHEN the applicant chooses a status filter, THE SYSTEM SHALL show only
  applications with that status and reset the results to the first page.
- WHEN the applicant searches by application name, address, or reference, THE
  SYSTEM SHALL filter matches case-insensitively and show the designed no-match
  state when no result remains.
- WHEN the applicant changes between list and card views, THE SYSTEM SHALL
  render the selected presentation and restore that preference on a later
  visit in the same browser.
- WHERE more than six applications match the active search and filter, THE
  SYSTEM SHALL paginate them in groups of six and identify the visible range
  and total result count.
- WHEN the applicant activates an application result, THE SYSTEM SHALL navigate
  to `/applications/<id>` for that application.
- WHEN the applicant activates a start-application action, THE SYSTEM SHALL
  navigate to `/applications/new`.
- WHEN the dashboard is used at a mobile viewport or with a keyboard, THE
  SYSTEM SHALL preserve readable content, operable controls, visible focus,
  semantic headings, and labelled view and navigation controls.
- WHERE a design control points to an unbuilt destination, THE SYSTEM SHALL omit
  that control rather than render a dead or misleading link.

## Tests required

- `src/routes/applications/list.test.tsx` — loading, request failure and retry,
  first-run and populated states, greeting fallback, status counts and filters,
  search and no-match behaviour, persisted views, pagination, links, and
  accessible responsive controls.
- `e2e/applications.spec.ts` — a confirmed applicant sees only their own
  Supabase applications in newest-first order and can open an application from
  the dashboard.
