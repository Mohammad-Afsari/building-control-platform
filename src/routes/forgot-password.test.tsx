import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { renderWithProviders } from '@/src/test/render'
import { supabase } from '@/src/lib/supabase/client'
import { ForgotPasswordPage } from '@/src/routes/forgot-password'
import { LoginPage } from '@/src/routes/login'
import type { SupabaseMock } from '@/src/test/supabase-mock'

vi.mock('@/src/lib/supabase/client', async () => {
  const { createSupabaseMock } = await import('@/src/test/supabase-mock')
  return { supabase: createSupabaseMock() }
})

type Deferred<T> = {
  promise: Promise<T>
  resolve: (value: T) => void
}

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((complete) => {
    resolve = complete
  })
  return { promise, resolve }
}

const auth = (supabase as unknown as SupabaseMock).auth

const renderForgotPassword = () =>
  renderWithProviders(
    <Routes>
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/login" element={<h1>Log in destination</h1>} />
    </Routes>,
    { route: '/forgot-password' },
  )

beforeEach(() => {
  vi.clearAllMocks()
  auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null })
})

describe('ForgotPasswordPage', () => {
  it('opens the designed request route from the login link', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>,
      { route: '/login' },
    )

    await user.click(
      screen.getByRole('link', { name: /forgot password/i }),
    )

    expect(
      screen.getByRole('heading', { name: /forgot your password/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
  })

  it('rejects invalid email, focuses it, and does not contact Supabase', async () => {
    const user = userEvent.setup()
    renderForgotPassword()

    const email = screen.getByLabelText('Email address')
    await user.type(email, 'not-an-email')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument()
    expect(email).toHaveFocus()
    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled()
  })

  it('exposes loading and sends the current-origin reset URL', async () => {
    const user = userEvent.setup()
    const request = createDeferred<{ data: object; error: null }>()
    auth.resetPasswordForEmail.mockReturnValue(request.promise)
    renderForgotPassword()

    await user.type(
      screen.getByLabelText('Email address'),
      'sarah@example.com',
    )
    await user.click(screen.getByRole('button', { name: /send reset link/i }))

    expect(
      screen.getByRole('button', { name: /sending reset link/i }),
    ).toBeDisabled()
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'sarah@example.com',
      { redirectTo: `${window.location.origin}/reset-password` },
    )

    request.resolve({ data: {}, error: null })
    expect(
      await screen.findByRole('heading', { name: /check your email/i }),
    ).toBeInTheDocument()
  })

  it('shows a generic success state that names the submitted address', async () => {
    const user = userEvent.setup()
    renderForgotPassword()

    await user.type(
      screen.getByLabelText('Email address'),
      'unknown@example.com',
    )
    await user.click(screen.getByRole('button', { name: /send reset link/i }))

    expect(await screen.findByText('unknown@example.com')).toBeInTheDocument()
    expect(screen.getByText(/if an account exists/i)).toBeInTheDocument()
    expect(screen.queryByText(/account not found/i)).not.toBeInTheDocument()
  })

  it('keeps the form available with readable retryable operational feedback', async () => {
    const user = userEvent.setup()
    auth.resetPasswordForEmail.mockResolvedValue({
      data: {},
      error: { message: 'Email service is temporarily unavailable' },
    })
    renderForgotPassword()

    const email = screen.getByLabelText('Email address')
    await user.type(email, 'sarah@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /email service is temporarily unavailable/i,
    )
    expect(email).toBeInTheDocument()
    expect(email).toHaveFocus()
    expect(
      screen.getByRole('button', { name: /send reset link/i }),
    ).toBeEnabled()
  })

  it('resends to the same address and announces success', async () => {
    const user = userEvent.setup()
    renderForgotPassword()

    await user.type(
      screen.getByLabelText('Email address'),
      'sarah@example.com',
    )
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    await user.click(
      await screen.findByRole('button', { name: /resend the link/i }),
    )

    expect(auth.resetPasswordForEmail).toHaveBeenCalledTimes(2)
    expect(auth.resetPasswordForEmail).toHaveBeenLastCalledWith(
      'sarah@example.com',
      { redirectTo: `${window.location.origin}/reset-password` },
    )
    const status = await screen.findByText(/link sent/i)
    expect(status.closest('[aria-live="polite"]')).not.toBeNull()
  })

  it('announces resend failure and allows another attempt', async () => {
    const user = userEvent.setup()
    auth.resetPasswordForEmail
      .mockResolvedValueOnce({ data: {}, error: null })
      .mockResolvedValueOnce({
        data: {},
        error: { message: 'Rate limit reached' },
      })
      .mockResolvedValueOnce({ data: {}, error: null })
    renderForgotPassword()

    await user.type(
      screen.getByLabelText('Email address'),
      'sarah@example.com',
    )
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    await user.click(
      await screen.findByRole('button', { name: /resend the link/i }),
    )

    const retry = await screen.findByRole('button', { name: /try again/i })
    expect(retry.closest('[aria-live="polite"]')).not.toBeNull()
    await user.click(retry)

    expect(auth.resetPasswordForEmail).toHaveBeenCalledTimes(3)
    expect(await screen.findByText(/link sent/i)).toBeInTheDocument()
  })

  it('sets the title, one heading, and navigates back to login', async () => {
    const user = userEvent.setup()
    renderForgotPassword()

    await waitFor(() => {
      expect(document.title).toBe('Forgot your password? · Building Control')
    })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)

    await user.click(screen.getByRole('link', { name: /back to log in/i }))
    expect(
      screen.getByRole('heading', { name: /log in destination/i }),
    ).toBeInTheDocument()
  })
})
