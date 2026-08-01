import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { renderWithProviders } from '@/src/test/render'
import { NotFoundPage } from '@/src/routes/not-found'
import { LoginPage } from '@/src/routes/login'

vi.mock('@/src/lib/supabase/client', async () => {
  const { createSupabaseMock } = await import('@/src/test/supabase-mock')
  return { supabase: createSupabaseMock() }
})

/* Mirrors the shape of App.tsx rather than rendering NotFoundPage
   alone: the two criteria most likely to break — that an unmatched
   path reaches this page, and that a matched one does not — are
   properties of the route configuration, not of the component. */
const renderApp = (route: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<h1>Building Control</h1>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>,
    { route },
  )

describe('NotFoundPage', () => {
  it('renders for a path that matches no route', async () => {
    renderApp('/no-such-page')

    expect(
      await screen.findByRole('heading', { name: /we can't find that page/i }),
    ).toBeInTheDocument()
  })

  it('shows the error code and an explanation', () => {
    renderApp('/no-such-page')

    expect(screen.getByText(/error 404/i)).toBeInTheDocument()
    expect(screen.getByText(/may have moved/i)).toBeInTheDocument()
  })

  it('sets the document title', async () => {
    renderApp('/no-such-page')

    await waitFor(() => {
      expect(document.title).toMatch(/page not found/i)
    })
  })

  it('has exactly one level-one heading', () => {
    renderApp('/no-such-page')

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('offers a link home that navigates there', async () => {
    const user = userEvent.setup()
    renderApp('/no-such-page')

    await user.click(screen.getByRole('link', { name: /home page/i }))

    expect(
      await screen.findByRole('heading', { name: 'Building Control' }),
    ).toBeInTheDocument()
  })

  /* A catch-all written or placed carelessly shadows every real route,
     and the failure is silent — each page renders as 404 and nothing
     throws. */
  it('does not shadow a route that does match', async () => {
    renderApp('/login')

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /we can't find that page/i }),
    ).not.toBeInTheDocument()
  })
})
