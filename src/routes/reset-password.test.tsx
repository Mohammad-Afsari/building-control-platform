import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { renderWithProviders } from '@/src/test/render'
import { fakeSession } from '@/src/test/supabase-mock'
import { supabase } from '@/src/lib/supabase/client'
import { ResetPasswordPage } from '@/src/routes/reset-password'
import type { SupabaseMock } from '@/src/test/supabase-mock'

const mocks = vi.hoisted(() => ({
  initialAuthCallback: {
    isPasswordRecovery: false,
    hasError: false,
  },
}))

vi.mock('@/src/lib/supabase/client', async () => {
  const { createSupabaseMock } = await import('@/src/test/supabase-mock')
  return {
    supabase: createSupabaseMock(),
    initialAuthCallback: mocks.initialAuthCallback,
  }
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

const supabaseMock = supabase as unknown as SupabaseMock
const auth = supabaseMock.auth

const renderResetPassword = (strict = false) =>
  renderWithProviders(
    <Routes>
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/forgot-password" element={<h1>Request another link</h1>} />
      <Route path="/login" element={<h1>Log in destination</h1>} />
    </Routes>,
    { route: '/reset-password', strict },
  )

const enableRecoveryFallback = () => {
  mocks.initialAuthCallback.isPasswordRecovery = true
  auth.getSession.mockResolvedValue({
    data: { session: fakeSession },
    error: null,
  })
}

const enterMatchingPasswords = async (password = 'StrongPass123!') => {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('New password'), password)
  await user.type(screen.getByLabelText('Confirm new password'), password)
  return user
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.initialAuthCallback.isPasswordRecovery = false
  mocks.initialAuthCallback.hasError = false
  auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
  auth.updateUser.mockResolvedValue({ data: { user: {} }, error: null })
  auth.signOut.mockResolvedValue({ error: null })
})

describe('ResetPasswordPage', () => {
  it('withholds the form on a direct visit and links to a new request', async () => {
    const user = userEvent.setup()
    renderResetPassword()

    expect(
      await screen.findByRole('heading', {
        name: /this reset link is invalid/i,
      }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /request a new link/i }))
    expect(
      screen.getByRole('heading', { name: /request another link/i }),
    ).toBeInTheDocument()
  })

  it('withholds the form when the callback carries an error', async () => {
    mocks.initialAuthCallback.isPasswordRecovery = true
    mocks.initialAuthCallback.hasError = true
    auth.getSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    })

    renderResetPassword()

    expect(
      await screen.findByRole('heading', {
        name: /this reset link is invalid/i,
      }),
    ).toBeInTheDocument()
    expect(auth.getSession).not.toHaveBeenCalled()
  })

  it('does not unlock for an ordinary existing session', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    })

    renderResetPassword()

    expect(
      await screen.findByRole('heading', {
        name: /this reset link is invalid/i,
      }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
  })

  it('uses the initial recovery marker and session as a timing fallback', async () => {
    enableRecoveryFallback()

    renderResetPassword(true)

    expect(
      await screen.findByRole('heading', { name: /set a new password/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('New password')).toBeInTheDocument()
    expect(auth.onAuthStateChange).toHaveBeenCalled()
  })

  it('unlocks when a delayed PASSWORD_RECOVERY event establishes a session', async () => {
    renderResetPassword()

    await screen.findByRole('heading', { name: /reset link is invalid/i })
    await act(async () => {
      await supabaseMock.emitAuthStateChange(
        'PASSWORD_RECOVERY',
        fakeSession as never,
      )
    })

    expect(
      screen.getByRole('heading', { name: /set a new password/i }),
    ).toBeInTheDocument()
  })

  it('focuses a short password and blocks the update', async () => {
    enableRecoveryFallback()
    const user = userEvent.setup()
    renderResetPassword()
    await screen.findByLabelText('New password')

    const password = screen.getByLabelText('New password')
    await user.type(password, 'short')
    await user.type(screen.getByLabelText('Confirm new password'), 'short')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(
      await screen.findByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument()
    expect(password).toHaveFocus()
    expect(auth.updateUser).not.toHaveBeenCalled()
  })

  it('focuses a mismatched confirmation and blocks the update', async () => {
    enableRecoveryFallback()
    const user = userEvent.setup()
    renderResetPassword()
    await screen.findByLabelText('New password')

    await user.type(screen.getByLabelText('New password'), 'StrongPass123!')
    const confirm = screen.getByLabelText('Confirm new password')
    await user.type(confirm, 'DifferentPass123!')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/passwords don't match/i)).toBeInTheDocument()
    expect(confirm).toHaveFocus()
    expect(auth.updateUser).not.toHaveBeenCalled()
  })

  it('shows strength guidance, match feedback, and password visibility', async () => {
    enableRecoveryFallback()
    const user = userEvent.setup()
    renderResetPassword()
    const password = await screen.findByLabelText('New password')

    await user.type(password, 'StrongPass123!')
    expect(screen.getByText('Strong password.')).toBeInTheDocument()

    await user.type(
      screen.getByLabelText('Confirm new password'),
      'StrongPass123!',
    )
    expect(screen.getByText(/passwords match/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(password).toHaveAttribute('type', 'text')
    expect(
      screen.getByRole('button', { name: /hide password/i }),
    ).toBeInTheDocument()
  })

  it('disables submission while the password update is in flight', async () => {
    enableRecoveryFallback()
    const update = createDeferred<{ data: object; error: null }>()
    auth.updateUser.mockReturnValue(update.promise)
    renderResetPassword()
    await screen.findByLabelText('New password')
    const user = await enterMatchingPasswords()

    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(
      screen.getByRole('button', { name: /updating password/i }),
    ).toBeDisabled()
    update.resolve({ data: {}, error: null })
    expect(
      await screen.findByRole('heading', { name: /password updated/i }),
    ).toBeInTheDocument()
  })

  it('shows an update rejection without success and allows retry', async () => {
    enableRecoveryFallback()
    auth.updateUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'New password should be different' },
    })
    renderResetPassword()
    const password = await screen.findByLabelText('New password')
    const user = await enterMatchingPasswords()

    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /new password should be different/i,
    )
    expect(password).toHaveFocus()
    expect(
      screen.getByRole('button', { name: /update password/i }),
    ).toBeEnabled()
    expect(
      screen.queryByRole('heading', { name: /password updated/i }),
    ).not.toBeInTheDocument()
    expect(auth.signOut).not.toHaveBeenCalled()
  })

  it('updates, ends only the local session, and offers login', async () => {
    enableRecoveryFallback()
    renderResetPassword()
    await screen.findByLabelText('New password')
    const user = await enterMatchingPasswords('AnotherStrong123!')

    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(
      await screen.findByRole('heading', { name: /password updated/i }),
    ).toBeInTheDocument()
    expect(auth.updateUser).toHaveBeenCalledWith({
      password: 'AnotherStrong123!',
    })
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' })

    await user.click(screen.getByRole('link', { name: /continue to log in/i }))
    expect(
      screen.getByRole('heading', { name: /log in destination/i }),
    ).toBeInTheDocument()
  })

  it('retries session cleanup without updating the password twice', async () => {
    enableRecoveryFallback()
    auth.signOut
      .mockResolvedValueOnce({ error: { message: 'Network error' } })
      .mockResolvedValueOnce({ error: null })
    renderResetPassword()
    await screen.findByLabelText('New password')
    const user = await enterMatchingPasswords()

    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(
      await screen.findByRole('heading', { name: /finish signing out/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      /password was updated/i,
    )
    await user.click(screen.getByRole('button', { name: /finish signing out/i }))

    expect(
      await screen.findByRole('heading', { name: /password updated/i }),
    ).toBeInTheDocument()
    expect(auth.updateUser).toHaveBeenCalledTimes(1)
    expect(auth.signOut).toHaveBeenCalledTimes(2)
  })

  it('sets the title and keeps one page-level heading per state', async () => {
    enableRecoveryFallback()
    renderResetPassword()

    await screen.findByRole('heading', { name: /set a new password/i })
    await waitFor(() => {
      expect(document.title).toBe('Set a new password · Building Control')
    })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
