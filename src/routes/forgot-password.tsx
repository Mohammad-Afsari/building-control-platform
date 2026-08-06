import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Mail,
  MailCheck,
} from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { supabase } from '@/src/lib/supabase/client'
import { AuthCard, AuthShell } from '@/src/components/auth-shell'
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
} from '@/src/components/ui/alert'
import { Button } from '@/src/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'

type ForgotPasswordErrors = {
  email?: string
  form?: string
}

type ResendStatus = 'idle' | 'sending' | 'sent' | 'error'

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const FALLBACK_ERROR =
  'We could not send the reset link. Please check your connection and try again.'

const readableError = (message?: string) => {
  return message && message !== '{}' ? message : FALLBACK_ERROR
}

export const ForgotPasswordPage = () => {
  const [errors, setErrors] = useState<ForgotPasswordErrors>({})
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<ResendStatus>('idle')
  const emailRef = useRef<HTMLInputElement>(null)

  const sendRecoveryEmail = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})

    const email = emailRef.current?.value.trim() ?? ''
    if (!EMAIL_PATTERN.test(email)) {
      setErrors({ email: 'Enter a valid email address.' })
      emailRef.current?.focus()
      return
    }

    setLoading(true)
    const { error } = await sendRecoveryEmail(email)
    setLoading(false)

    if (error) {
      setErrors({ form: readableError(error.message) })
      emailRef.current?.focus()
      return
    }

    setSentTo(email)
  }

  const handleResend = async () => {
    if (!sentTo || resendStatus === 'sending') return

    setResendStatus('sending')
    const { error } = await sendRecoveryEmail(sentTo)
    setResendStatus(error ? 'error' : 'sent')
  }

  return (
    <>
      <Helmet>
        <title>Forgot your password? · Building Control</title>
      </Helmet>
      <AuthShell>
        <AuthCard>
          {sentTo === null ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-h2 font-black tracking-snug text-heading">
                  Forgot your password?
                </h1>
                <p className="mt-1.5 text-body-sm text-muted">
                  Enter your email and we&apos;ll send you a link to reset it.
                </p>
              </div>

              {errors.form && (
                <Alert variant="danger" className="mb-5">
                  <AlertIcon>
                    <CircleAlert />
                  </AlertIcon>
                  <AlertContent>
                    <AlertDescription>{errors.form}</AlertDescription>
                  </AlertContent>
                </Alert>
              )}

              <form
                className="flex flex-col gap-4.5"
                onSubmit={handleSubmit}
                noValidate
              >
                <Field>
                  <FieldLabel>Email address</FieldLabel>
                  <Input
                    ref={emailRef}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    onChange={() => setErrors({})}
                  />
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </Field>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className={cn(
                    'relative mt-1 w-full py-3.25',
                    loading && 'disabled:opacity-100',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex items-center gap-2',
                      loading && 'invisible',
                    )}
                  >
                    {loading ? 'Sending reset link…' : 'Send reset link'}
                    <Mail aria-hidden="true" />
                  </span>
                  {loading && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 m-auto size-4.75 animate-spin rounded-full border-[2.5px] border-on-primary/45 border-t-on-primary"
                    />
                  )}
                </Button>
              </form>

              <Link
                className="mt-5 inline-flex w-full items-center justify-center gap-1.75 py-1.5 text-body-sm font-bold text-muted no-underline hover:text-heading [&_svg]:size-4"
                to="/login"
              >
                <ArrowLeft aria-hidden="true" /> Back to log in
              </Link>
            </>
          ) : (
            <div className="px-0 pt-2.5 pb-1.5 text-center">
              <div className="mx-auto mb-4.5 grid size-16 place-items-center rounded-full bg-success-bg text-success [&_svg]:size-7.5">
                <MailCheck aria-hidden="true" />
              </div>
              <h1 className="text-h2 font-black tracking-snug text-heading">
                Check your email
              </h1>
              <p className="mt-2.5 text-body-sm leading-normal text-muted">
                If an account exists for{' '}
                <b className="font-bold text-heading">{sentTo}</b>, you&apos;ll
                receive a password reset link shortly.
              </p>
              <div className="mt-6">
                <Button asChild size="lg" className="w-full py-3.25">
                  <Link to="/login">
                    Back to log in <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <div
                aria-live="polite"
                aria-atomic="true"
                className="mt-4 text-caption text-faint"
              >
                {resendStatus === 'error' ? (
                  <>
                    We could not resend the link.{' '}
                    <button
                      type="button"
                      onClick={handleResend}
                      className="cursor-pointer font-bold text-link hover:underline"
                    >
                      Try again
                    </button>
                    .
                  </>
                ) : (
                  <>
                    Didn&apos;t get it? Check your spam folder or{' '}
                    <button
                      type="button"
                      disabled={resendStatus === 'sending'}
                      onClick={handleResend}
                      className="cursor-pointer font-bold text-link hover:underline disabled:cursor-not-allowed disabled:text-faint disabled:no-underline"
                    >
                      {resendStatus === 'sending'
                        ? 'sending another link…'
                        : resendStatus === 'sent'
                          ? 'link sent'
                          : 'resend the link'}
                    </button>
                    .
                  </>
                )}
              </div>
            </div>
          )}
        </AuthCard>
      </AuthShell>
    </>
  )
}
