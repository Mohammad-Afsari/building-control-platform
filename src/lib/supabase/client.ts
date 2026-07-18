import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Single browser Supabase client — the app is a pure SPA, so there is
    no server-side variant. Session persistence/refresh is handled by
    supabase-js itself (localStorage). */
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)
