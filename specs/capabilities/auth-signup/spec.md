---
capability: auth-signup
updated_by: initial import from PR #3, #5, #7
---

# Applicant signup and email confirmation

Creating an account, and confirming the email address before it can be
used. Backed by Supabase Auth; there is no server, so confirmation is
completed in the browser.

## Behaviour

### Signing up

- WHEN a visitor submits the signup form with a name shorter than two
  characters, THE SYSTEM SHALL report that a full name is required and
  SHALL NOT contact Supabase.
- WHEN a visitor submits an address that is not a valid email, THE
  SYSTEM SHALL report it and SHALL NOT contact Supabase.
- WHEN a visitor submits a password shorter than eight characters, THE
  SYSTEM SHALL report the minimum length.
- WHEN the confirmation field does not match the password, THE SYSTEM
  SHALL report that the passwords do not match.
- WHEN the terms have not been agreed, THE SYSTEM SHALL report that
  agreement is required.
- WHILE a password is being typed, THE SYSTEM SHALL show a strength
  indicator reflecting its length and character variety.
- WHEN a signup succeeds, THE SYSTEM SHALL show a confirmation screen
  naming the address the verification link was sent to.
- WHEN an account already exists for the address, THE SYSTEM SHALL say
  so and direct the visitor to log in.
- WHEN Supabase returns an error whose message is unusable, THE SYSTEM
  SHALL show readable fallback copy rather than the raw value.

### Confirming the address

- WHEN a confirmation link carries a token hash, THE SYSTEM SHALL verify
  it and report success or failure.
- WHEN a confirmation link carries a PKCE code, THE SYSTEM SHALL
  exchange it for a session.
- WHEN Supabase redirects back with the session in the URL hash
  fragment, THE SYSTEM SHALL treat the established session as success.
- WHEN a confirmation link carries no recognisable parameters, THE
  SYSTEM SHALL show the expired-link state.
- WHEN a confirmation link identifies the address, THE SYSTEM SHALL
  offer to resend the verification email.
- WHEN the confirmation page loads, THE SYSTEM SHALL verify exactly
  once, even under React StrictMode's double-invoked effects.

## Covered by

- `src/routes/signup.test.tsx` — validation, success state, existing
  account, unusable error message
- `src/routes/auth-confirm.test.tsx` — each confirmation route, the
  single-verification guarantee, hash-fragment handling
- `e2e/auth.spec.ts` — signup through to a real confirmation email read
  from Mailpit and followed to the verified state

## Notes

The single-verification rule exists because verification tokens are
single-use: a second call always fails, which made valid links appear
expired. The hash-fragment rule exists because Supabase's default
confirmation template redirects that way rather than with query
parameters. Both shipped as bugs once and are pinned by tests that fail
without their fix.

Email delivery in production currently goes through Resend's sandbox
sender, which only delivers to the account owner's own address. Real
applicants cannot yet receive confirmation email.
