import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { renderWithProviders } from '@/src/test/render'
import { supabase } from '@/src/lib/supabase/client'
import { LoginPage } from '@/src/routes/login'
import type { SupabaseMock } from '@/src/test/supabase-mock'

vi.mock('@/src/lib/supabase/client', async () => {
  const { createSupabaseMock } = await import('@/src/test/supabase-mock')
  return { supabase: createSupabaseMock() }
})

const auth = (supabase as unknown as SupabaseMock).auth

const renderLogin = () =>
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/applications" element={<h1>Your applications</h1>} />
    </Routes>,
    { route: '/login' },
  )

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('rejects a malformed email without calling Supabase', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email address'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'somepassword')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument()
    expect(auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it('requires a password', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email address'), 'a@example.com')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/enter your password/i)).toBeInTheDocument()
    expect(auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it('signs in and lands on the applications page', async () => {
    const user = userEvent.setup()
    auth.signInWithPassword.mockResolvedValue({ error: null })
    renderLogin()

    await user.type(screen.getByLabelText('Email address'), 'sarah@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct-horse')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(
      await screen.findByRole('heading', { name: /your applications/i }),
    ).toBeInTheDocument()
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'sarah@example.com',
      password: 'correct-horse',
    })
  })

  it('shows the credentials banner when sign-in is rejected', async () => {
    const user = userEvent.setup()
    auth.signInWithPassword.mockResolvedValue({
      error: { code: 'invalid_credentials', message: 'Invalid login' },
    })
    renderLogin()

    await user.type(screen.getByLabelText('Email address'), 'sarah@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/don't match an account/i)
  })

  it('explains an unconfirmed email rather than blaming the password', async () => {
    const user = userEvent.setup()
    auth.signInWithPassword.mockResolvedValue({
      error: { code: 'email_not_confirmed', message: 'Email not confirmed' },
    })
    renderLogin()

    await user.type(screen.getByLabelText('Email address'), 'sarah@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct-horse')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /has not been confirmed/i,
    )
  })
})
