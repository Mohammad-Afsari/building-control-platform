import type { User } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'
import { TriangleAlert } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { AppNav } from '@/src/components/app-nav'
import { ApplicationsDashboard } from '@/src/components/applications-dashboard'
import { ApplicationsFirstRun } from '@/src/components/applications-first-run'
import { ApplicationsLoading } from '@/src/components/applications-loading'
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/src/components/ui/alert'
import { Button } from '@/src/components/ui/button'
import { getApplications } from '@/src/lib/applications'
import { useAuth } from '@/src/lib/auth-context'

const firstNameOf = (user: User) => {
  const fullName = user.user_metadata.full_name
  if (typeof fullName === 'string' && fullName.trim()) {
    return fullName.trim().split(/\s+/)[0]
  }
  return user.email ?? 'there'
}

export const ApplicationsListPage = () => {
  const { user } = useAuth()
  const applications = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: getApplications,
    enabled: Boolean(user),
  })

  if (!user) return null

  const firstName = firstNameOf(user)

  return (
    <>
      <Helmet>
        <title>Your applications · Building Control</title>
      </Helmet>
      <AppNav user={user} />

      {applications.isPending ? (
        <ApplicationsLoading />
      ) : applications.isError ? (
        <main className="mx-auto max-w-205 px-5 pt-9.5 pb-20 md:px-7">
          <h1 className="text-display leading-tight font-black tracking-tight text-heading">
            Your applications
          </h1>
          <Alert variant="danger" className="mt-6">
            <AlertIcon>
              <TriangleAlert />
            </AlertIcon>
            <AlertContent>
              <AlertTitle>We couldn't load your applications</AlertTitle>
              <AlertDescription>
                Check your connection and try again. Your saved applications
                have not been changed.
              </AlertDescription>
            </AlertContent>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void applications.refetch()}
            >
              Try again
            </Button>
          </Alert>
        </main>
      ) : applications.data.length === 0 ? (
        <ApplicationsFirstRun firstName={firstName} />
      ) : (
        <ApplicationsDashboard
          applications={applications.data}
          firstName={firstName}
        />
      )}
    </>
  )
}
