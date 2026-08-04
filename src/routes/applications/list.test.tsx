import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { AuthProvider } from '@/src/lib/auth-context'
import { supabase } from '@/src/lib/supabase/client'
import { ApplicationsListPage } from '@/src/routes/applications/list'
import { renderWithProviders } from '@/src/test/render'
import { fakeSession } from '@/src/test/supabase-mock'
import type { SupabaseMock } from '@/src/test/supabase-mock'
import type { ApplicationStatus } from '@/src/types/application'

vi.mock('@/src/lib/supabase/client', async () => {
  const { createSupabaseMock } = await import('@/src/test/supabase-mock')
  return { supabase: createSupabaseMock() }
})

const supabaseMock = supabase as unknown as SupabaseMock
const { auth, database } = supabaseMock
const localStorageValues = new Map<string, string>()

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem: vi.fn((key: string) => localStorageValues.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageValues.set(key, String(value))
    }),
    removeItem: vi.fn((key: string) => {
      localStorageValues.delete(key)
    }),
    clear: vi.fn(() => {
      localStorageValues.clear()
    }),
    key: vi.fn((index: number) => [...localStorageValues.keys()][index] ?? null),
    get length() {
      return localStorageValues.size
    },
  },
})

type ApplicationRowOverrides = {
  id?: string
  name?: string
  address?: string | null
  reference?: string
  status?: ApplicationStatus
  updated_at?: string
}

const applicationRow = ({
  id = 'application-1',
  name = 'Rear extension',
  address = '14 Elm Grove',
  reference = 'BC-2026-04001',
  status = 'draft',
  updated_at = '2026-08-03T12:00:00.000Z',
}: ApplicationRowOverrides = {}) => ({
  id,
  name,
  address,
  reference,
  status,
  type: 'full-plans',
  category: 'domestic',
  updated_at,
})

const renderApplications = () =>
  renderWithProviders(
    <AuthProvider>
      <Routes>
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route
          path="/applications/new"
          element={<h1>New application route</h1>}
        />
        <Route
          path="/applications/:id"
          element={<h1>Application detail route</h1>}
        />
      </Routes>
    </AuthProvider>,
    { route: '/applications' },
  )

const signedInSession = (fullName?: string) => ({
  ...fakeSession,
  user: {
    ...fakeSession.user,
    user_metadata: fullName === undefined ? {} : { full_name: fullName },
  },
})

beforeEach(() => {
  vi.clearAllMocks()
  localStorageValues.clear()
  auth.getSession.mockResolvedValue({
    data: { session: signedInSession('Sarah Davies') },
    error: null,
  })
  auth.signOut.mockResolvedValue({ error: null })
  database.order.mockResolvedValue({ data: [], error: null })
})

describe('ApplicationsListPage', () => {
  it('announces loading and requests summary rows newest first', async () => {
    let finishRequest: (value: { data: never[]; error: null }) => void = () => {}
    database.order.mockReturnValueOnce(
      new Promise((resolve) => {
        finishRequest = resolve
      }),
    )

    renderApplications()

    expect(await screen.findByRole('status')).toHaveTextContent(
      /loading your applications/i,
    )
    expect(supabaseMock.from).toHaveBeenCalledWith('applications')
    expect(database.select).toHaveBeenCalledWith(
      'id, name, address, reference, status, type, category, updated_at',
    )
    expect(database.order).toHaveBeenCalledWith('updated_at', {
      ascending: false,
    })

    await act(async () => finishRequest({ data: [], error: null }))
    expect(
      await screen.findByRole('heading', {
        name: /get your first application started/i,
      }),
    ).toBeInTheDocument()
  })

  it('shows a retryable error instead of first run when the query fails', async () => {
    const user = userEvent.setup()
    database.order
      .mockResolvedValueOnce({ data: null, error: { message: 'offline' } })
      .mockResolvedValueOnce({ data: [], error: null })

    renderApplications()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /couldn't load your applications/i,
    )
    expect(
      screen.queryByRole('heading', {
        name: /get your first application started/i,
      }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(
      await screen.findByRole('heading', {
        name: /get your first application started/i,
      }),
    ).toBeInTheDocument()
    expect(database.order).toHaveBeenCalledTimes(2)
  })

  it('renders the designed first-run content without dead destinations', async () => {
    renderApplications()

    expect(
      await screen.findByRole('heading', {
        name: /get your first application started/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Welcome, Sarah')).toBeInTheDocument()
    expect(screen.getByText('Free to start')).toBeInTheDocument()
    expect(screen.getByText('Save and return any time')).toBeInTheDocument()
    expect(screen.getByText("We tell you what's next")).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Tell us about the work' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Add your details & plans' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Submit & track' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /start your first application/i }),
    ).toHaveAttribute('href', '/applications/new')
    expect(screen.queryByText(/notifications/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/plain-english guidance/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/account settings/i)).not.toBeInTheDocument()
  })

  it('renders every status count and a safe fallback greeting', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: signedInSession() },
      error: null,
    })
    database.order.mockResolvedValue({
      data: [
        applicationRow({ id: 'draft', status: 'draft' }),
        applicationRow({ id: 'submitted', status: 'submitted' }),
        applicationRow({ id: 'review', status: 'review' }),
        applicationRow({ id: 'approved', status: 'approved' }),
        applicationRow({ id: 'rejected', status: 'rejected' }),
      ],
      error: null,
    })

    renderApplications()

    expect(
      await screen.findByRole('button', { name: /All\s*5/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveTextContent(/test@example.com/)
    expect(screen.getByRole('button', { name: /Drafts\s*1/ })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Submitted\s*1/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Under review\s*1/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Approved\s*1/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Changes\s*1/ }),
    ).toBeInTheDocument()
    expect(document.title).toBe('Your applications · Building Control')
  })

  it('filters and searches by name, address, and reference case-insensitively', async () => {
    const user = userEvent.setup()
    database.order.mockResolvedValue({
      data: [
        applicationRow({
          id: 'draft',
          name: 'Loft Conversion',
          address: '14 Elm Grove',
          reference: 'BC-2026-04001',
          status: 'draft',
        }),
        applicationRow({
          id: 'submitted',
          name: 'Shopfront alteration',
          address: '5 Tanners Yard',
          reference: 'BC-2026-04002',
          status: 'submitted',
        }),
      ],
      error: null,
    })
    renderApplications()

    await screen.findByText('14 Elm Grove')
    await user.click(screen.getByRole('button', { name: /Submitted\s*1/ }))
    expect(screen.queryByText('14 Elm Grove')).not.toBeInTheDocument()
    expect(screen.getByText('5 Tanners Yard')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /All\s*2/ }))
    const search = screen.getByRole('searchbox', { name: /search applications/i })
    await user.type(search, 'loft conversion')
    expect(screen.getByText('14 Elm Grove')).toBeInTheDocument()
    expect(screen.queryByText('5 Tanners Yard')).not.toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'TANNERS')
    expect(screen.getByText('5 Tanners Yard')).toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'bc-2026-99999')
    expect(
      screen.getByText(/no applications match your filter/i),
    ).toBeInTheDocument()
  })

  it('restores and persists the selected view', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('bc_dash_view', 'cards')
    database.order.mockResolvedValue({
      data: [applicationRow()],
      error: null,
    })

    renderApplications()

    const cards = await screen.findByRole('button', { name: 'Card view' })
    expect(cards).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Continue')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'List view' }))
    expect(window.localStorage.getItem('bc_dash_view')).toBe('list')
    expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('paginates six at a time and resets to page one after filtering', async () => {
    const user = userEvent.setup()
    const rows = Array.from({ length: 8 }, (_, index) =>
      applicationRow({
        id: `application-${index + 1}`,
        name: `Project ${index + 1}`,
        address: `Address ${index + 1}`,
        reference: `BC-2026-${String(index + 1).padStart(5, '0')}`,
        status: index === 0 ? 'draft' : 'submitted',
      }),
    )
    database.order.mockResolvedValue({ data: rows, error: null })

    renderApplications()

    expect(
      await screen.findByText((_, element) =>
        Boolean(
          element?.tagName === 'P' &&
            element.textContent === 'Showing 1–6 of 8 applications',
        ),
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('Address 7')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(
      screen.getByText((_, element) =>
        Boolean(
          element?.tagName === 'P' &&
            element.textContent === 'Showing 7–8 of 8 applications',
        ),
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Address 7')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Drafts\s*1/ }))
    expect(screen.getByText('Address 1')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument()
  })

  it('links application and start actions to the existing routes', async () => {
    database.order.mockResolvedValue({
      data: [applicationRow({ id: 'target-application' })],
      error: null,
    })
    renderApplications()

    const address = await screen.findByText('14 Elm Grove')
    expect(address.closest('a')).toHaveAttribute(
      'href',
      '/applications/target-application',
    )
    expect(
      screen.getByRole('link', { name: /start new application/i }),
    ).toHaveAttribute('href', '/applications/new')
  })

  it('exposes accessible desktop and mobile navigation with sign out', async () => {
    const user = userEvent.setup()
    database.order.mockResolvedValue({ data: [], error: null })
    renderApplications()

    await screen.findByRole('heading', {
      name: /get your first application started/i,
    })
    const applicationNav = screen.getByRole('navigation', {
      name: /application navigation/i,
    })
    expect(
      within(applicationNav).getByRole('link', { name: /building control/i }),
    ).toHaveAttribute('href', '/')
    expect(
      within(applicationNav).getByRole('link', { name: 'Dashboard' }),
    ).toHaveAttribute('aria-current', 'page')

    const menu = within(applicationNav).getByRole('button', { name: 'Menu' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    await user.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
    expect(within(applicationNav).getByText('Sarah Davies')).toBeInTheDocument()

    await user.click(
      within(applicationNav).getAllByRole('button', { name: 'Sign out' })[0],
    )
    expect(auth.signOut).toHaveBeenCalledTimes(1)
    expect(within(applicationNav).queryByText(/notifications/i)).not.toBeInTheDocument()
  })
})
