import { BrowserRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from '@/src/lib/auth-context'
import { ProtectedRoute } from '@/src/components/protected-route'
import { HomePage } from '@/src/routes/home'
import { LoginPage } from '@/src/routes/login'
import { SignupPage } from '@/src/routes/signup'
import { AuthConfirmPage } from '@/src/routes/auth-confirm'
import { NotFoundPage } from '@/src/routes/not-found'
import { ApplicationsListPage } from '@/src/routes/applications/list'
import { NewApplicationPage } from '@/src/routes/applications/new'
import { ApplicationDetailPage } from '@/src/routes/applications/detail'

const queryClient = new QueryClient()

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth/confirm" element={<AuthConfirmPage />} />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute>
                    <ApplicationsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/new"
                element={
                  <ProtectedRoute>
                    <NewApplicationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/:id"
                element={
                  <ProtectedRoute>
                    <ApplicationDetailPage />
                  </ProtectedRoute>
                }
              />
              {/* Last: only matches when nothing else does. */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
