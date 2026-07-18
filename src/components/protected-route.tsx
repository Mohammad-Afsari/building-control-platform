import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/src/lib/auth-context'

/** Client-side route guard. There is no server to redirect before paint,
    so a signed-out user briefly sees this loading state before the
    redirect — the unavoidable tradeoff of a pure SPA. */
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
