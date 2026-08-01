---
capability: auth-login
updated_by: initial import from PR #3, #5, #7
---

# Applicant login and route protection

Signing in with email and password, and keeping signed-out visitors out
of applicant pages. Route protection is client-side only — there is no
server to redirect before paint.

## Behaviour

### Logging in

- WHEN a visitor submits an address that is not a valid email, THE
  SYSTEM SHALL report it and SHALL NOT contact Supabase.
- WHEN a visitor submits an empty password, THE SYSTEM SHALL report that
  a password is required and SHALL NOT contact Supabase.
- WHEN credentials are accepted, THE SYSTEM SHALL navigate to the
  applications page.
- WHEN credentials are rejected, THE SYSTEM SHALL show a banner saying
  the details do not match an account, and SHALL return focus to the
  password field with its contents selected.
- WHEN sign-in fails because the address is unconfirmed, THE SYSTEM
  SHALL say the email has not been confirmed rather than implying the
  password is wrong.
- WHERE a password field is present, THE SYSTEM SHALL offer to reveal or
  hide its contents.

### Protecting applicant pages

- WHEN a signed-out visitor opens a protected route, THE SYSTEM SHALL
  redirect them to the login page.
- WHILE the session is still being restored, THE SYSTEM SHALL render
  nothing rather than briefly showing protected content.

## Covered by

- `src/routes/login.test.tsx` — validation, successful navigation, both
  failure messages
- `e2e/auth.spec.ts` — an unconfirmed account being refused, and a
  signed-out visitor redirected away from `/applications`

## Notes

Distinguishing an unconfirmed address from bad credentials matters
because the two are indistinguishable to a user otherwise, and the
recovery is completely different.

A signed-out visitor hitting a protected route directly sees a brief
blank frame before the redirect. That is inherent to a static SPA with
no server, and is accepted rather than worked around.

The "Forgot password?" link on the login page points at
`/forgot-password`, which has no route and no catch-all — it currently
renders a blank page. Known gap, not yet specced.
