import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'
import { renderWithProviders } from '@/src/test/render'
import { supabase } from '@/src/lib/supabase/client'
import { SignupPage } from '@/src/routes/signup'
import type { SupabaseMock } from '@/src/test/supabase-mock'

vi.mock('@/src/lib/supabase/client', async () => {
  const { createSupabaseMock } = await import('@/src/test/supabase-mock')
  return { supabase: createSupabaseMock() }
})

const auth = (supabase as unknown as SupabaseMock).auth

const submit = () => screen.getByRole('button', { name: /create account/i })

const fillValidForm = async (user: UserEvent) => {
  await user.type(screen.getByLabelText('Full name'), 'Sarah Davies')
  await user.type(screen.getByLabelText('Email address'), 'sarah@example.com')
  await user.type(screen.getByLabelText('Password'), 'correct-horse-9')
  await user.type(screen.getByLabelText('Confirm password'), 'correct-horse-9')
  await user.click(screen.getByRole('checkbox'))
}

beforeEach(() => {
  vi.clearAllMocks()
  auth.signUp.mockResolvedValue({
    data: { user: { identities: [{ id: 'identity-1' }] } },
    error: null,
  })
})

describe('SignupPage', () => {
  it('reports every invalid field at once and calls nothing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignupPage />, { route: '/signup' })

    await user.click(submit())

    expect(await screen.findByText(/enter your full name/i)).toBeInTheDocument()
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
    expect(
      screen.getByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/agree to the terms/i)).toBeInTheDocument()
    expect(auth.signUp).not.toHaveBeenCalled()
  })

  it('requires the confirmation to match', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignupPage />, { route: '/signup' })

    await user.type(screen.getByLabelText('Full name'), 'Sarah Davies')
    await user.type(screen.getByLabelText('Email address'), 'sarah@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct-horse-9')
    await user.type(screen.getByLabelText('Confirm password'), 'different-9')
    await user.click(screen.getByRole('checkbox'))
    await user.click(submit())

    expect(
      await screen.findByText(/passwords don't match/i),
    ).toBeInTheDocument()
    expect(auth.signUp).not.toHaveBeenCalled()
  })

  it('confirms where the verification link was sent', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignupPage />, { route: '/signup' })

    await fillValidForm(user)
    await user.click(submit())

    expect(
      await screen.findByRole('heading', { name: /check your email/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('sarah@example.com')).toBeInTheDocument()
    expect(auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'sarah@example.com',
        password: 'correct-horse-9',
      }),
    )
  })

  it('points an existing account at the login page', async () => {
    const user = userEvent.setup()
    auth.signUp.mockResolvedValue({
      data: { user: { identities: [] } },
      error: null,
    })
    renderWithProviders(<SignupPage />, { route: '/signup' })

    await fillValidForm(user)
    await user.click(submit())

    expect(
      await screen.findByText(/account with this email already exists/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /check your email/i }),
    ).not.toBeInTheDocument()
  })

  /* Regression: Supabase can hand back an error whose message is the
     string "{}" — it rendered raw, so the form showed literal braces
     where an explanation belonged. */
  it('falls back to readable copy when the error message is unusable', async () => {
    const user = userEvent.setup()
    auth.signUp.mockResolvedValue({ data: null, error: { message: '{}' } })
    renderWithProviders(<SignupPage />, { route: '/signup' })

    await fillValidForm(user)
    await user.click(submit())

    expect(
      await screen.findByText(/something went wrong creating your account/i),
    ).toBeInTheDocument()
    expect(screen.queryByText('{}')).not.toBeInTheDocument()
  })

  it('surfaces a genuine error message unchanged', async () => {
    const user = userEvent.setup()
    auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'Password is too weak' },
    })
    renderWithProviders(<SignupPage />, { route: '/signup' })

    await fillValidForm(user)
    await user.click(submit())

    expect(
      await screen.findByText(/password is too weak/i),
    ).toBeInTheDocument()
  })
})
