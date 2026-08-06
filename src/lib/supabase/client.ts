import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

type InitialAuthCallback = Readonly<{
  isPasswordRecovery: boolean
  hasError: boolean
}>

const readInitialAuthCallback = (): InitialAuthCallback => {
  if (typeof window === 'undefined') {
    return Object.freeze({ isPasswordRecovery: false, hasError: false })
  }

  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.slice(1))
  const getParam = (name: string) =>
    searchParams.get(name) ?? hashParams.get(name)

  return Object.freeze({
    isPasswordRecovery: getParam('type') === 'recovery',
    hasError: ['error', 'error_code', 'error_description'].some((name) =>
      Boolean(getParam(name)),
    ),
  })
}

/** Supabase consumes implicit-flow parameters while constructing the client.
    Keep only the callback intent needed by the reset route, never its tokens. */
export const initialAuthCallback = readInitialAuthCallback()

/** Single browser Supabase client — the app is a pure SPA, so there is
    no server-side variant. Session persistence/refresh is handled by
    supabase-js itself (localStorage). */
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)
