# Tasks — add-password-recovery

Ordered checklist derived from the proposal and design. Complete one item at a
time and keep the acceptance criteria intact while implementing.

## Implementation

- [x] Add the non-secret initial callback snapshot to
  `src/lib/supabase/client.ts`, and extend `src/test/supabase-mock.ts` with
  controllable recovery request, session, update, sign-out, and auth-event
  behaviour. This supplies deterministic handling for valid, missing, invalid,
  expired, and delayed recovery callbacks without retaining credentials.
- [x] Build `src/routes/forgot-password.tsx` with the designed request and
  check-email states: local email validation and focus, in-flight disabling,
  current-origin `/reset-password` redirect, generic non-enumerating copy,
  operational retry, resend announcements, and `/login` navigation.
- [x] Build the callback gate and password-entry states in
  `src/routes/reset-password.tsx`: checking and invalid-link states, recovery
  event plus guarded session fallback, eight-character and matching validation,
  strength guidance, reveal control, focus management, and accessible status.
- [ ] Complete the reset mutation states in `src/routes/reset-password.tsx`:
  disabled loading control, readable update failure, local-scope session cleanup
  with its own retry path, Password updated success, and `/login` navigation.
- [ ] Register `/forgot-password` and `/reset-password` as public routes in
  `src/App.tsx`, confirming the existing login Forgot password action reaches
  the new request page and neither route is wrapped by `ProtectedRoute`.

## Tests

- [ ] `src/routes/forgot-password.test.tsx` — prove the login link and request
  route render correctly; invalid email is reported and focused without an Auth
  call; loading is exposed; the request uses the submitted address and exact
  current-origin reset URL; accepted requests remain non-enumerating; delivery
  failures are readable and retryable; resend reuses the address and announces
  success or failure; login links, title, headings, labels, focus, and live
  status behaviour are accessible.
- [ ] `src/routes/reset-password.test.tsx` — prove only a valid recovery callback
  unlocks the form, including delayed event handling; missing, error, expired,
  and ordinary-session visits show request-new-link instead; short and
  mismatched passwords are focused and block updates; strength and reveal work;
  update loading disables submission; failures remain retryable; success updates
  the password, signs out with local scope, and shows the login action only after
  cleanup; cleanup failure can retry without another update; title, headings,
  labels, focus, and live status behaviour are accessible.
- [ ] `e2e/password-recovery.spec.ts` and `e2e/mailbox.ts` — request a real local
  recovery email through the browser, follow its Mailpit link, set a new
  password, verify the recovery session ends, prove the old password is rejected,
  and prove the new password logs in successfully.

## Verification

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test:run`
- [ ] `npm run test:e2e`
