import { vi } from 'vitest'

/** Stand-in for `@/src/lib/supabase/client`'s `supabase` export.
    Unit tests never talk to a real backend — anything needing a live
    Postgres or GoTrue belongs in the end-to-end suite instead.

    The `getSession`/`onAuthStateChange` defaults are what `AuthProvider`
    calls on mount, so a component tree renders without extra setup. */
export const createSupabaseMock = () => {
  const order = vi.fn()
  const select = vi.fn().mockReturnValue({ order })
  const from = vi.fn().mockReturnValue({ select })

  return {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resend: vi.fn(),
      verifyOtp: vi.fn(),
      exchangeCodeForSession: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
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
