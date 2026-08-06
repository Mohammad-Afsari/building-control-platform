import { vi } from 'vitest'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

type AuthStateChangeCallback = (
  event: AuthChangeEvent,
  session: Session | null,
) => void | Promise<void>

/** Stand-in for `@/src/lib/supabase/client`'s `supabase` export.
    Unit tests never talk to a real backend — anything needing a live
    Postgres or GoTrue belongs in the end-to-end suite instead.

    The `getSession`/`onAuthStateChange` defaults are what `AuthProvider`
    calls on mount, so a component tree renders without extra setup. */
export const createSupabaseMock = () => {
  const order = vi.fn()
  const select = vi.fn().mockReturnValue({ order })
  const from = vi.fn().mockReturnValue({ select })
  const authStateChangeCallbacks = new Set<AuthStateChangeCallback>()
  const onAuthStateChange = vi.fn((callback: AuthStateChangeCallback) => {
    authStateChangeCallbacks.add(callback)
    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(() => authStateChangeCallbacks.delete(callback)),
        },
      },
    }
  })

  return {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      verifyOtp: vi.fn(),
      exchangeCodeForSession: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange,
    },
    emitAuthStateChange: async (
      event: AuthChangeEvent,
      session: Session | null,
    ) => {
      await Promise.all(
        [...authStateChangeCallbacks].map((callback) =>
          callback(event, session),
        ),
      )
    },
    from,
    database: { select, order },
  }
}

export type SupabaseMock = ReturnType<typeof createSupabaseMock>

/** A session shaped closely enough to the real thing for assertions
    that only care whether one exists. */
export const fakeSession = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-01-01T00:00:00.000Z',
  },
}
