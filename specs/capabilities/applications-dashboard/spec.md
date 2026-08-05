---
capability: applications-dashboard
updated_by: build-applications-dashboard
---

# Applications dashboard

What signed-in applicants see and can do from the centre of their application
account.

## Behaviour

- WHEN a signed-in applicant opens `/applications`, THE SYSTEM SHALL load only
  that applicant's applications and order them by most recently updated first.
- WHILE the applications request is unresolved, THE SYSTEM SHALL render the
  dashboard loading skeleton with an accessible loading status.
- WHEN the applications request fails, THE SYSTEM SHALL show an error message
  and retry control without presenting the first-run experience.
- WHERE the applicant has no applications, THE SYSTEM SHALL render the
  first-run welcome, trust points, three-step explanation, and a link to start
  the first application.
- WHERE the applicant has applications, THE SYSTEM SHALL render the
  personalised dashboard heading, a start-new-application link, and a count
  for every stored application status.
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
- WHEN the applicant activates an application result, THE SYSTEM SHALL
  navigate to `/applications/<id>` for that application.
- WHEN the applicant activates a start-application action, THE SYSTEM SHALL
  navigate to `/applications/new`.
- WHEN the dashboard is used at a mobile viewport or with a keyboard, THE
  SYSTEM SHALL preserve readable content, operable controls, visible focus,
  semantic headings, and labelled view and navigation controls.
- WHERE a design control points to an unbuilt destination, THE SYSTEM SHALL
  omit that control rather than render a dead or misleading link.

## Covered by

- `src/routes/applications/list.test.tsx` — query ordering and errors, loading,
  retry, first-run and populated states, greeting fallback, status counts and
  filters, search, persisted views, pagination, routes, title, and accessible
  signed-in navigation.
- `e2e/applications.spec.ts` — authenticated ownership through RLS,
  newest-first rendering, application-detail navigation, and keyboard-operated
  mobile navigation against local Supabase.

## Notes

**RLS is the ownership boundary.** The browser uses the authenticated Supabase
client and does not supply an owner filter from display metadata. The query
cache is keyed by authenticated user ID so sessions cannot reuse another
applicant's cached rows.

**Filtering is client-side.** The dashboard loads its small, RLS-scoped summary
set once, then filters, searches, counts, and paginates in memory. Revisit
server-side pagination if real applicants begin reaching hundreds of rows.

**Only real destinations are rendered.** Identity, Dashboard, Home, Sign out,
new application, and application-detail routes are available. Notifications,
profile, settings, guidance, support, payment, certificate download, and
feedback controls remain omitted until those experiences exist.

**Application actions share the detail route.** Draft rows say “Continue”; all
other statuses say “View”. Distinct download or feedback actions are deferred
until those destinations are implemented.
