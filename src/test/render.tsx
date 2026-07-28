import { StrictMode } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type ProvidersProps = {
  children: ReactNode
  route: string
}

/* Retries turn a deliberate failure into a multi-second timeout. */
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

const Providers = ({ children, route }: ProvidersProps) => (
  <HelmetProvider>
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </QueryClientProvider>
  </HelmetProvider>
)

type RenderWithProvidersOptions = {
  /** Initial URL, including any search or hash the component reads. */
  route?: string
  /** Wrap in `StrictMode` to exercise its double-invoked effects.
      This only works when `StrictMode` is the outermost element handed
      to `render` — nesting it under a provider silently disables the
      double invoke, which makes such a test unable to fail. */
  strict?: boolean
}

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', strict = false }: RenderWithProvidersOptions = {},
) => {
  const tree = <Providers route={route}>{ui}</Providers>
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree)
}
