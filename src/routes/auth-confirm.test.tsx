import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/src/test/render'
import { fakeSession } from '@/src/test/supabase-mock'
import { supabase } from '@/src/lib/supabase/client'
import { AuthConfirmPage } from '@/src/routes/auth-confirm'
import type { SupabaseMock } from '@/src/test/supabase-mock'

vi.mock('@/src/lib/supabase/client', async () => {
  const { createSupabaseMock } = await import('@/src/test/supabase-mock')
  return { supabase: createSupabaseMock() }
})

const auth = (supabase as unknown as SupabaseMock).auth

const CONFIRM_ROUTE = '/auth/confirm'

beforeEach(() => {
  vi.clearAllMocks()
  /* The page reads window.location.hash directly, and jsdom keeps it
     between tests in a file. */
  window.location.hash = ''
  auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
})

describe('AuthConfirmPage', () => {
  it('verifies a token_hash link and shows the success state', async () => {
    auth.verifyOtp.mockResolvedValue({ error: null })

    renderWithProviders(<AuthConfirmPage />, {
      route: `${CONFIRM_ROUTE}?token_hash=abc123&type=email`,
    })

    expect(
      await screen.findByRole('heading', { name: /your email is verified/i }),
    ).toBeInTheDocument()
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      type: 'email',
      token_hash: 'abc123',
    })
  })

  it('shows the failure state when the token is rejected', async () => {
    auth.verifyOtp.mockResolvedValue({ error: { message: 'expired' } })

    renderWithProviders(<AuthConfirmPage />, {
      route: `${CONFIRM_ROUTE}?token_hash=stale&type=email`,
    })

    expect(
      await screen.findByRole('heading', { name: /this link has expired/i }),
    ).toBeInTheDocument()
  })

  it('exchanges a PKCE code when one is present', async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: null })

    renderWithProviders(<AuthConfirmPage />, {
      route: `${CONFIRM_ROUTE}?code=pkce-code`,
    })

    expect(
      await screen.findByRole('heading', { name: /your email is verified/i }),
    ).toBeInTheDocument()
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith('pkce-code')
  })

  it('fails when the link carries no verification parameters', async () => {
    renderWithProviders(<AuthConfirmPage />, { route: CONFIRM_ROUTE })

    expect(
      await screen.findByRole('heading', { name: /this link has expired/i }),
    ).toBeInTheDocument()
    expect(auth.verifyOtp).not.toHaveBeenCalled()
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled()
  })

  /* Regression: StrictMode's dev-only double-invoke fired verifyOtp
     twice. Verification tokens are single-use, so the second call
     always failed and every valid link rendered as expired. */
  it('verifies exactly once under StrictMode', async () => {
    auth.verifyOtp.mockResolvedValue({ error: null })

    renderWithProviders(<AuthConfirmPage />, {
      route: `${CONFIRM_ROUTE}?token_hash=single-use&type=email`,
      strict: true,
    })

    await screen.findByRole('heading', { name: /your email is verified/i })
    expect(auth.verifyOtp).toHaveBeenCalledTimes(1)
  })

  /* Regression: Supabase's default confirmation template redirects
     back with the session in a #hash fragment. Only the query string
     was read, so real links fell through to the expired state. */
  it('treats a hash-fragment session as verified', async () => {
    window.location.hash = '#access_token=abc&refresh_token=def&type=signup'
    auth.getSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    })

    renderWithProviders(<AuthConfirmPage />, { route: CONFIRM_ROUTE })

    expect(
      await screen.findByRole('heading', { name: /your email is verified/i }),
    ).toBeInTheDocument()
    expect(auth.verifyOtp).not.toHaveBeenCalled()
  })

  it('fails a hash fragment that carries an error', async () => {
    window.location.hash = '#error=access_denied&error_code=otp_expired'

    renderWithProviders(<AuthConfirmPage />, { route: CONFIRM_ROUTE })

    expect(
      await screen.findByRole('heading', { name: /this link has expired/i }),
    ).toBeInTheDocument()
  })

  it('offers a resend only when the link identifies the address', async () => {
    auth.verifyOtp.mockResolvedValue({ error: { message: 'expired' } })

    renderWithProviders(<AuthConfirmPage />, {
      route: `${CONFIRM_ROUTE}?token_hash=stale&type=email&email=sarah%40example.com`,
    })

    const resend = await screen.findByRole('button', {
      name: /resend verification email/i,
    })

    auth.resend.mockResolvedValue({ error: null })
    resend.click()

    await waitFor(() => {
      expect(auth.resend).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'signup', email: 'sarah@example.com' }),
      )
    })
  })
})
