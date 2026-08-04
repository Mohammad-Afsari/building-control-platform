import { createClient } from '@supabase/supabase-js'
import { confirmationLinkFrom, waitForEmail } from './mailbox.ts'

const API_URL = process.env.SUPABASE_API_URL
const ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!API_URL || !ANON_KEY) {
  throw new Error(
    'Playwright did not receive the local Supabase URL and anonymous key.',
  )
}

export const E2E_PASSWORD = 'correct-horse-battery-9'

const makeClient = () =>
  createClient(API_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

type E2EClient = ReturnType<typeof makeClient>

const uniqueEmail = () =>
  `dashboard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

export const createConfirmedUser = async (fullName: string) => {
  const email = uniqueEmail()
  const client = makeClient()
  const { error: signUpError } = await client.auth.signUp({
    email,
    password: E2E_PASSWORD,
    options: { data: { full_name: fullName } },
  })
  if (signUpError) throw signUpError

  const confirmation = confirmationLinkFrom(await waitForEmail(email))
  const response = await fetch(confirmation, { redirect: 'manual' })
  if (response.status < 300 || response.status >= 400) {
    throw new Error(`Email confirmation returned HTTP ${response.status}.`)
  }

  const { data, error: signInError } = await client.auth.signInWithPassword({
    email,
    password: E2E_PASSWORD,
  })
  if (signInError) throw signInError
  if (!data.user) throw new Error(`Supabase did not return a user for ${email}.`)

  return { client, email, userId: data.user.id }
}

type ApplicationSeed = {
  name: string
  address: string
  status?: 'draft' | 'submitted' | 'review' | 'approved' | 'rejected'
  updatedAt: string
}

export const createApplication = async (
  client: E2EClient,
  seed: ApplicationSeed,
) => {
  const { data, error } = await client
    .from('applications')
    .insert({
      name: seed.name,
      address: seed.address,
      type: 'full-plans',
      category: 'domestic',
      status: seed.status ?? 'draft',
      updated_at: seed.updatedAt,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id as string
}
