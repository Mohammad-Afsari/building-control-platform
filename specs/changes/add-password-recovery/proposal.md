---
title: Add password recovery
status: in-progress
capability: auth-password-recovery
design: design/Forgot Password.html
---

## Why

The login page links to `/forgot-password`, but that route does not exist, so
an applicant who forgets their password cannot recover their account. Add the
complete email recovery journey so they can request a secure link, choose a
new password, and return to login.

## Scope

### In scope

- The public forgot-password request and confirmation states shown in
  `design/Forgot Password.html` at `/forgot-password`.
- The recovery-link and new-password states shown in
  `design/Reset Password.html` at `/reset-password`.
- Supabase Auth password-recovery email requests, recovery-session handling,
  password updates, readable failure states, and ending the recovery session
  after a successful update.
- Non-enumerating request copy that does not reveal whether an email address
  belongs to an account.
- Resending the recovery email and links back to the existing login page.
- End-to-end coverage against local Supabase and Mailpit, including proving
  that the old password stops working and the new password works.

### Out of scope

- Changing the signup, email-confirmation, or normal login flows beyond making
  the existing Forgot password link reach a real route.
- Password changes for an already signed-in applicant from a profile or
  settings page.
- Customising the Supabase recovery email template, configuring Resend or any
  other SMTP provider, or changing hosted Supabase dashboard settings.
- Adding passkeys, multi-factor authentication, social login, or a password
  policy beyond the existing minimum-length and strength guidance.
- Copying prototype CSS, classes, scripts, or simulated error behaviour from
  the committed design files.

## Acceptance criteria

- WHEN a visitor activates Forgot password from the login page, THE SYSTEM
  SHALL navigate to `/forgot-password` and render the designed request form.
- WHEN a visitor submits an address that is not a valid email, THE SYSTEM
  SHALL report it, focus the email field, and SHALL NOT contact Supabase.
- WHILE a recovery-email request is in flight, THE SYSTEM SHALL disable its
  submit control and expose a loading state.
- WHEN a valid recovery-email request is accepted, THE SYSTEM SHALL ask
  Supabase to send a recovery link back to `/reset-password` on the current
  application origin.
- WHEN a recovery-email request is accepted, THE SYSTEM SHALL show the
  designed check-email state naming the submitted address without revealing
  whether an account exists for it.
- WHEN recovery-email delivery fails for an operational reason, THE SYSTEM
  SHALL show readable retryable feedback and keep the request form available.
- WHEN the visitor activates resend from the check-email state, THE SYSTEM
  SHALL request another recovery email for the same address and announce the
  outcome without navigating away.
- WHERE the forgot-password experience offers a back-to-login action, THE
  SYSTEM SHALL navigate to `/login`.
- WHEN Supabase establishes a valid password-recovery session at
  `/reset-password`, THE SYSTEM SHALL render the designed new-password form.
- WHEN `/reset-password` is opened without a valid recovery session, or the
  recovery link is invalid or expired, THE SYSTEM SHALL withhold the password
  form and offer a route to request a new link.
- WHEN the new password contains fewer than eight characters, THE SYSTEM SHALL
  report the minimum length and SHALL NOT ask Supabase to update the user.
- WHEN the confirmation does not match the new password, THE SYSTEM SHALL
  report the mismatch and SHALL NOT ask Supabase to update the user.
- WHILE a new password is being entered, THE SYSTEM SHALL show the designed
  strength guidance and offer to reveal or hide the password.
- WHILE a password update is in flight, THE SYSTEM SHALL disable its submit
  control and expose a loading state.
- WHEN Supabase accepts the new password, THE SYSTEM SHALL end the recovery
  session, show the designed Password updated state, and offer a link to
  `/login`.
- WHEN Supabase rejects the password update, THE SYSTEM SHALL show readable
  retryable feedback without presenting a success state.
- WHEN the recovery journey is used with a keyboard or screen reader, THE
  SYSTEM SHALL preserve labelled fields, associated errors, visible focus,
  semantic headings, and announced status changes.

## Tests required

- `src/routes/forgot-password.test.tsx` — routing, email validation, request
  payload and redirect URL, loading, non-enumerating success, operational
  failure, resend, document title, focus, and accessible status behaviour.
- `src/routes/reset-password.test.tsx` — valid versus missing or expired
  recovery sessions, password validation and strength, reveal control,
  Supabase update and sign out, loading, failure, success, routes, document
  title, and accessible status behaviour.
- `e2e/password-recovery.spec.ts` — request a real local recovery email through
  the UI, follow it from Mailpit, update the password, verify the old password
  is rejected, and log in with the new password.

## Decisions

- **Password request and reset ship together.** A request form without a route
  that can consume the emailed recovery session leaves the user unable to
  finish the journey; the two committed designs form one reviewable auth
  capability.
- **Account existence remains private.** The prototype includes a simulated
  “account not found” alert, but the implementation uses its generic “If an
  account exists” success state so the route cannot be used to enumerate
  registered addresses.
- **Recovery ends at signed-out login.** A successful update ends the temporary
  recovery session before offering Continue to log in, matching the design's
  promise that the applicant will use the new password to authenticate.
- **Email infrastructure remains external.** The app supplies the recovery
  redirect and handles delivery outcomes, local tests use Mailpit, and hosted
  delivery continues to depend on the project's existing SMTP configuration.
