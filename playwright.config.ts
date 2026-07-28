import { execFileSync } from 'node:child_process'
import { defineConfig, devices } from '@playwright/test'

const APP_PORT = 4173
const BASE_URL = `http://localhost:${APP_PORT}`

type SupabaseEnv = {
  apiUrl: string
  anonKey: string
  mailpitUrl: string
}

/* Read straight from the running stack rather than hardcoding keys.
   Done at config load because Playwright starts `webServer` before
   `globalSetup`, and the production build bakes these in. */
const readSupabaseEnv = (): SupabaseEnv => {
  let raw: string
  try {
    raw = execFileSync('npx', ['supabase', 'status', '-o', 'env'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch {
    throw new Error(
      'Could not read local Supabase status. Start it first: npx supabase start',
    )
  }

  const values = new Map<string, string>()
  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/)
    if (match) values.set(match[1], match[2])
  }

  const apiUrl = values.get('API_URL')
  const anonKey = values.get('ANON_KEY') ?? values.get('PUBLISHABLE_KEY')
  const mailpitUrl = values.get('MAILPIT_URL') ?? values.get('INBUCKET_URL')

  if (!apiUrl || !anonKey || !mailpitUrl) {
    throw new Error(
      `Local Supabase did not report the expected values. Got: ${[...values.keys()].join(', ')}`,
    )
  }

  return { apiUrl, anonKey, mailpitUrl }
}

const supabase = readSupabaseEnv()

/* Workers are forked from this process, so they inherit this. Keeps
   the mail server's port in one place rather than hardcoded in tests. */
process.env.MAILPIT_URL = supabase.mailpitUrl

export default defineConfig({
  testDir: './e2e',
  /* Tests share one Supabase instance and one mailbox, so they run
     in sequence rather than racing each other. */
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${APP_PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_SUPABASE_URL: supabase.apiUrl,
      VITE_SUPABASE_ANON_KEY: supabase.anonKey,
    },
  },
})
