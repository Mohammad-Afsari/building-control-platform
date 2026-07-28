import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Helmet } from 'react-helmet-async'
import type { EmailOtpType } from '@supabase/supabase-js'
import { ArrowRight, ArrowLeft, BadgeCheck, Link2Off, Mail } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { supabase } from '@/src/lib/supabase/client'
import { AuthShell, AuthCard } from '@/src/components/auth-shell'
import { Button } from '@/src/components/ui/button'

type ConfirmState = 'verifying' | 'success' | 'failure'

/* Client-side replacement for a server route handler — there is no
   server in this SPA. The default "Confirm signup" template's
   {{ .ConfirmationURL }} points at Supabase's own /auth/v1/verify
   endpoint, which verifies server-side and then redirects back here.
   That redirect can carry the result three different ways depending
   on project config: ?token_hash=...&type=... (still needs verifying
   client-side), ?code=... (PKCE, needs exchanging), or #access_token=
   ...&refresh_token=... in the hash fragment (implicit flow, session
   is already established — supabase-js's client picks this up from
   the URL automatically via detectSessionInUrl on init, so by the
   time this effect runs there may already be a session to check). */
export const AuthConfirmPage = () => {
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<ConfirmState>('verifying')
  const [resendLoading, setResendLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    // verifyOtp/exchangeCodeForSession tokens are single-use — guard
    // against StrictMode's dev-only double-invoke firing this twice
    // and turning a valid link into a false "expired" result.
    if (hasRun.current) return
    hasRun.current = true

    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const code = searchParams.get('code')
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const hashAccessToken = hashParams.get('access_token')
    const hashError = hashParams.get('error')

    const confirm = async () => {
      if (hashAccessToken && !hashError) {
        // supabase-js already parsed this from the URL and set the
        // session on client init — confirm it's actually there.
        const { data } = await supabase.auth.getSession()
        setState(data.session ? 'success' : 'failure')
        return
      }

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        })
        setState(error ? 'failure' : 'success')
        return
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        setState(error ? 'failure' : 'success')
        return
      }

      setState('failure')
    }

    confirm()
  }, [searchParams])

  const handleResend = async () => {
    const email = searchParams.get('email')
    if (!email || resendLoading || resent) return
    setResendLoading(true)
    await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })
    setResendLoading(false)
    setResent(true)
  }

  const resendEmail = searchParams.get('email')

  return (
    <>
      <Helmet>
        <title>Email verification · Building Control</title>
      </Helmet>
      <AuthShell>
        <AuthCard className="text-center">
          {state === 'verifying' && (
            <div aria-live="polite" className="py-4">
              <span
                aria-hidden="true"
                className="mx-auto block size-9 animate-spin rounded-full border-[2.5px] border-primary-100 border-t-primary"
              />
              <p className="mt-4 text-body-sm text-muted">
                Verifying your email…
              </p>
            </div>
          )}

          {state === 'success' && (
            <div aria-live="polite">
              <div className="mx-auto mb-4.5 grid size-16 place-items-center rounded-full bg-success-bg text-success [&_svg]:size-7.5">
                <BadgeCheck aria-hidden="true" />
              </div>
              <h1 className="text-h2 font-black tracking-snug text-heading">
                Your email is verified
              </h1>
              <p className="mx-auto mt-2.5 max-w-[36ch] text-body-sm leading-normal text-muted">
                Your account is now active. You&apos;re all set to submit and
                track building regulations applications.
              </p>
              <div className="mt-6">
                <Button asChild size="lg" className="w-full py-3.25">
                  <Link to="/applications">
                    Continue to dashboard <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {state === 'failure' && (
            <div aria-live="polite">
              <div className="mx-auto mb-4.5 grid size-16 place-items-center rounded-full bg-destructive-bg text-destructive [&_svg]:size-7.5">
                <Link2Off aria-hidden="true" />
              </div>
              <h1 className="text-h2 font-black tracking-snug text-heading">
                This link has expired
              </h1>
              <p className="mx-auto mt-2.5 max-w-[36ch] text-body-sm leading-normal text-muted">
                Verification links are valid for{' '}
                <b className="font-bold text-heading">24 hours</b>. This one
                has expired or has already been used.
                {resendEmail && ' We can send you a fresh one.'}
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                {resendEmail && (
                  <Button
                    type="button"
                    size="lg"
                    disabled={resendLoading || resent}
                    onClick={handleResend}
                    className={cn(
                      'relative w-full py-3.25',
                      resendLoading && 'disabled:opacity-100',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex items-center gap-2',
                        resendLoading && 'invisible',
                      )}
                    >
                      <Mail aria-hidden="true" />
                      {resent
                        ? 'New link sent'
                        : 'Resend verification email'}
                    </span>
                    {resendLoading && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 m-auto size-4.75 animate-spin rounded-full border-[2.5px] border-on-primary/45 border-t-on-primary"
                      />
                    )}
                  </Button>
                )}
                <Link
                  className="inline-flex w-full items-center justify-center gap-1.75 py-1.5 text-body-sm font-bold text-muted no-underline hover:text-heading [&_svg]:size-4"
                  to={resendEmail ? '/login' : '/signup'}
                >
                  <ArrowLeft aria-hidden="true" />
                  {resendEmail ? 'Back to log in' : 'Back to sign up'}
                </Link>
              </div>
            </div>
          )}
        </AuthCard>
      </AuthShell>
    </>
  )
}
