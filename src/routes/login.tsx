import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, CircleAlert } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { supabase } from '@/src/lib/supabase/client'
import { AuthShell, AuthCard } from '@/src/components/auth-shell'
import { Button } from '@/src/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { PasswordInput } from '@/src/components/ui/password-input'

type LoginErrors = {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const BANNER_MESSAGES: Record<string, string> = {
  invalid_credentials:
    "Those details don't match an account. Check your email and password and try again.",
  email_not_confirmed:
    'Your email address has not been confirmed yet — check your inbox for the verification link.',
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const [errors, setErrors] = useState<LoginErrors>({})
  const [banner, setBanner] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const clearError = (key: keyof LoginErrors) => {
    setBanner(null)
    setErrors((current) =>
      current[key] ? { ...current, [key]: undefined } : current,
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBanner(null)

    const email = emailRef.current?.value.trim() ?? ''
    const password = passwordRef.current?.value ?? ''

    const nextErrors: LoginErrors = {}
    if (!EMAIL_PATTERN.test(email))
      nextErrors.email = 'Enter a valid email address.'
    if (password.length === 0) nextErrors.password = 'Enter your password.'
    setErrors(nextErrors)

    if (nextErrors.email || nextErrors.password) {
      const target = nextErrors.email ? emailRef : passwordRef
      target.current?.focus()
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      setBanner(
        BANNER_MESSAGES[error.code ?? ''] ??
          BANNER_MESSAGES.invalid_credentials,
      )
      passwordRef.current?.focus()
      passwordRef.current?.select()
      return
    }

    navigate('/applications')
  }

  return (
    <>
      <Helmet>
        <title>Log in · Building Control</title>
      </Helmet>
      <AuthShell>
        <AuthCard>
          <div className="mb-6 text-center">
            <h1 className="text-h2 font-black tracking-snug text-heading">
              Welcome back
            </h1>
            <p className="mt-1.5 text-body-sm text-muted">
              Log in to submit and track your applications.
            </p>
          </div>

          {banner && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.75 rounded-md border border-destructive-soft bg-destructive-bg px-3.5 py-3"
            >
              <CircleAlert
                aria-hidden="true"
                className="mt-px size-4.5 flex-none text-destructive"
              />
              <span className="text-body-sm leading-normal font-semibold text-destructive">
                {banner}
              </span>
            </div>
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
                aria-invalid={banner ? true : undefined}
                onChange={() => clearError('email')}
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>

            <Field>
              <div className="flex items-baseline justify-between gap-3">
                <FieldLabel>Password</FieldLabel>
                <Link
                  className="text-caption font-bold whitespace-nowrap text-link no-underline hover:underline"
                  to="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                ref={passwordRef}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={banner ? true : undefined}
                onChange={() => clearError('password')}
              />
              {errors.password && <FieldError>{errors.password}</FieldError>}
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
                Log in <ArrowRight />
              </span>
              {loading && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 m-auto size-4.75 animate-spin rounded-full border-[2.5px] border-on-primary/45 border-t-on-primary"
                />
              )}
            </Button>
          </form>
        </AuthCard>

        <p className="mt-6 text-center text-body-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link
            className="font-bold text-link no-underline hover:underline"
            to="/signup"
          >
            Sign up
          </Link>
        </p>
      </AuthShell>
    </>
  )
}
