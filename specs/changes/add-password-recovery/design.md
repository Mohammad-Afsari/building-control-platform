# Design — add-password-recovery

## Approach

Add two public routes that share the existing authentication shell and UI
primitives but own separate, explicit state machines.

`/forgot-password` starts in a request state. It validates the address locally,
then calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`, where
`redirectTo` is `${window.location.origin}/reset-password`. An accepted request
moves to the generic check-email state whether or not the address belongs to an
account. Resend repeats the same request for the submitted address. Operational
failures leave a retryable form or status control available and never introduce
account-enumerating copy.

`/reset-password` starts in a checking state and withholds the form until it can
prove that this navigation established a Supabase password-recovery session.
The Supabase browser client processes the callback URL during asynchronous
initialisation and can remove its auth parameters before the route mounts. To
make that hand-off deterministic, `src/lib/supabase/client.ts` captures a small,
immutable snapshot of the initial URL before creating the client. The snapshot
contains only recovery/error markers and never tokens or credentials. The route
listens for `PASSWORD_RECOVERY`; when the initial URL was a non-error recovery
callback, `getSession()` is also used as a timing-safe fallback after client
initialisation. An existing ordinary session without that initial recovery
marker does not unlock the form. Missing, invalid, and expired callbacks render
a request-new-link state instead.

The reset form validates the existing eight-character minimum and matching
confirmation locally, displays the same strength guidance used by signup, and
calls `supabase.auth.updateUser({ password })` only after validation succeeds.
After the update succeeds, it calls `supabase.auth.signOut({ scope: 'local' })`
so the temporary recovery session ends in this browser without signing the user
out on every device. Only then does it show the Password updated state and a
link to `/login`. If sign-out fails after the password changed, the page exposes
a retry for session cleanup rather than submitting the password a second time.

Both routes use direct Supabase client calls and local route state, matching the
existing login, signup, and confirmation routes. Status and error changes use
semantic live regions, each rendered state has one page-level heading, and
validation returns focus to the first invalid field.

## Alternatives rejected

- **Ship only the email-request page** — users could receive a recovery link
  but could not complete the journey in the application.
- **Put `/reset-password` behind `ProtectedRoute`** — the callback is an auth
  entry point, and the existing guard could redirect before recovery setup is
  complete or admit an unrelated signed-in session.
- **Treat any active session as a recovery session** — a normal authenticated
  visitor could then reach a password form without arriving through a recovery
  link.
- **Rely only on the `PASSWORD_RECOVERY` event** — client initialisation begins
  at module load, so a route-level subscriber alone creates a timing dependency.
  The initial marker plus `getSession()` fallback preserves the callback intent.
- **Persist the callback URL or its tokens** — only non-secret markers are
  needed; retaining credentials would increase exposure without helping the
  route decide which state to show.
- **Copy the prototype's account-not-found error** — revealing whether an
  address exists enables account enumeration and conflicts with the proposal.
- **Use global sign-out after the update** — the recovery journey only needs to
  end its current browser session; invalidating sessions on other devices would
  be an unnecessary side effect.
- **Move the flow to an Edge Function or use a service-role client** — the
  supported browser Auth methods already provide the complete user-scoped flow,
  and no privileged secret belongs in the application.
- **Use TanStack Query for these mutations** — callback/session transitions are
  one-shot authentication state, not server data that benefits from caching.
- **Refactor signup password-strength logic as part of this change** — keeping
  equivalent route-local logic avoids expanding a security-sensitive change;
  shared extraction can be proposed separately if the rules evolve.
- **Copy HTML, CSS, or scripted states from the visual prototypes** — the
  prototypes describe appearance and behaviour, while the application design
  system remains the implementation source of truth.

## Components

- **new:** `src/routes/forgot-password.tsx` — request, check-email, resend, and
  operational-error states for recovery email delivery.
- **new:** `src/routes/forgot-password.test.tsx` — focused unit and accessibility
  coverage for the request half of the journey.
- **new:** `src/routes/reset-password.tsx` — recovery callback gate, reset form,
  invalid-link state, session cleanup, and success state.
- **new:** `src/routes/reset-password.test.tsx` — focused unit and accessibility
  coverage for callback and password-update states.
- **modified:** `src/App.tsx` — register `/forgot-password` and
  `/reset-password` as public routes.
- **modified:** `src/lib/supabase/client.ts` — capture and export the initial,
  non-secret auth callback markers before the browser client consumes the URL.
- **modified:** `src/test/supabase-mock.ts` — mock recovery requests, password
  updates, session lookup, sign-out scope, and controllable auth-state events.
- **modified:** `e2e/mailbox.ts` — expose recovery-link extraction while sharing
  the existing Supabase verification-link parsing.
- **new:** `e2e/password-recovery.spec.ts` — exercise the real local recovery
  email, browser callback, password update, and subsequent login behaviour.

## Patterns to follow

- Compose both pages with `AuthShell` and `AuthCard`, following the document
  title, responsive layout, and focus conventions in `login.tsx`, `signup.tsx`,
  and `auth-confirm.tsx`.
- Reuse `Field`, `Input`, `PasswordInput`, `Button`, and `Alert` from
  `src/components/ui/`; do not introduce route-specific versions of these
  controls.
- Follow `.claude/COMPONENT_PATTERNS.md`: use semantic elements first, design
  tokens rather than literal colours, and keep route state separate from visual
  primitives.
- Match signup's password-strength calculation and feedback so both password
  creation paths communicate the same rules. Use `PasswordInput` for the new
  password and an ordinary password `Input` for confirmation.
- Follow `auth-confirm.tsx` for guarded asynchronous auth handling and for an
  invalid-link presentation. Effects and callback handling must remain stable
  under React Strict Mode.
- Keep Supabase error text readable with a safe fallback. Do not expose raw
  callback parameters, tokens, stack traces, or account-existence information.
- Each conditional page state renders exactly one `h1`; changing the prototype's
  success heading level is intentional for page semantics.

## Visual reference

Use `design/Forgot Password.html` for the request and check-email compositions,
including the centred auth card, email field, back-to-login action, submitted
address, and resend affordance. Omit its simulated account-not-found behaviour
and demo controls.

Use `design/Reset Password.html` for the new-password form, strength guidance,
show/hide interaction, and Password updated state. That prototype does not
define the missing/expired-link state, so adapt the established failure state
from `design/Email Verified.html` and `src/routes/auth-confirm.tsx`, with a single
action to `/forgot-password`.

These HTML files are visual specifications only. Recreate them with the repo's
React components, Tailwind utilities, and `src/styles/` tokens; do not copy
their classes, stylesheet, scripts, or demo-only content.

## Data and schema

None. This change adds no tables, columns, RLS policies, database functions, or
Supabase migrations.

The browser uses the existing anonymous Supabase client and these user-scoped
Auth operations:

- `resetPasswordForEmail(email, { redirectTo })`
- `onAuthStateChange` with `PASSWORD_RECOVERY`
- `getSession()` after callback initialisation as the guarded timing fallback
- `updateUser({ password })`
- `signOut({ scope: 'local' })`

Local Supabase already permits `http://localhost:4173/**`, and the end-to-end
server runs on that origin. The hosted project's redirect allow list must also
permit the deployed application's `/reset-password` URL (or an intentional
same-origin wildcard) before hosted recovery can complete. SMTP delivery and
hosted dashboard configuration remain deployment prerequisites, not repository
changes. No service-role key or additional browser environment variable is
required. The application enforces the proposal's eight-character minimum even
if a Supabase environment accepts a shorter password.

## Test strategy

- **Unit — forgot password:** prove login routing, invalid-email focus and zero
  Auth calls, loading/disabled state, exact current-origin redirect, generic
  success copy, resend outcomes, operational failure recovery, `/login` links,
  document title, labels, headings, focus, and live status announcements.
- **Unit — reset password:** drive missing, callback-error, ordinary-session,
  recovery-event, and event-timing-fallback cases; prove the form is gated,
  local validation prevents Auth calls, strength and reveal behaviour, loading,
  update rejection, local-scope sign-out, cleanup retry, success routing,
  document title, labels, headings, focus, and live announcements.
- **End-to-end:** create a confirmed user through the local Supabase helper,
  clear Mailpit, request recovery through the UI, extract and follow the real
  recovery message link, choose a new password, verify the recovery session is
  ended, prove the old password is rejected, and log in with the new password.
  This test owns a unique address and does not depend on hosted SMTP.
