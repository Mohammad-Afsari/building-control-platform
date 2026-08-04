# Tasks — build-applications-dashboard

## Implementation

- [x] Add the typed `applications` summary query and extend the shared Supabase
  test mock for authenticated, ordered table reads.
- [x] Build the reusable signed-in `AppNav` with active Dashboard navigation,
  account identity, sign out, and an accessible mobile disclosure, omitting
  every unbuilt destination.
- [x] Build the accessible dashboard loading skeleton and first-run experience
  from their committed visual references.
- [x] Build the populated dashboard with all five status counts, filtering,
  case-insensitive search, persisted list/card views, responsive application
  links, no-match feedback, relative timestamps, and six-item pagination.
- [x] Compose the `/applications` route with its document title, current user,
  user-keyed TanStack Query, loading/first-run/populated states, and a retryable
  error alert that cannot be mistaken for an empty account.

## Tests

- [ ] `src/routes/applications/list.test.tsx` — prove query ordering and error
  propagation, accessible loading and retry, first-run and populated states,
  greeting fallback, all status counts and filters, search/no-match behaviour,
  persisted views, page reset and pagination, working links, document title,
  navigation semantics, and omission of dead controls.
- [ ] `e2e/supabase.ts`, `playwright.config.ts`, and
  `e2e/applications.spec.ts` — create isolated local users and applications,
  then prove RLS ownership, newest-first rendering, detail navigation, and
  keyboard-operable mobile navigation in Chromium.

## Verification

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test:run`
- [ ] `npm run test:e2e`
