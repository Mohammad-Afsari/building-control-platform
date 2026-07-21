import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, MailCheck } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { supabase } from '@/src/lib/supabase/client'
import { AuthShell, AuthCard } from '@/src/components/auth-shell'
import { Button } from '@/src/components/ui/button'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/src/components/ui/field'
import { Input } from '@/src/components/ui/input'
import { PasswordInput } from '@/src/components/ui/password-input'

type SignUpErrors = {
  name?: string
  email?: string
  password?: string
  confirm?: string
  terms?: string
  form?: string
}

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const STRENGTH_LABELS = [
  'Use 8+ characters with a mix of letters and numbers.',
  'Weak — add more characters.',
  'Okay — add numbers or symbols.',
  'Good password.',
  'Strong password.',
]

const scorePassword = (value: string) => {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[0-9]/.test(value) && /[a-zA-Z]/.test(value)) score++
  if (/[^a-zA-Z0-9]/.test(value)) score++
  return Math.max(1, Math.min(4, score))
}

const strengthBarClass = (level: number) => {
  if (level === 1) return 'bg-destructive-dot'
  if (level === 2) return 'bg-action-needed-dot'
  return 'bg-success-dot'
}

const strengthLabelClass = (level: number) => {
  if (level === 0) return 'text-faint'
  if (level === 1) return 'text-destructive'
  if (level === 2) return 'text-action-needed'
  return 'text-success'
}

export const SignupPage = () => {
  const [strength, setStrength] = useState(0)
  const [errors, setErrors] = useState<SignUpErrors>({})
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)
  const termsRef = useRef<HTMLInputElement>(null)

  const clearError = (key: keyof SignUpErrors) => {
    setErrors((current) =>
      current[key] ? { ...current, [key]: undefined } : current,
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = nameRef.current?.value.trim() ?? ''
    const email = emailRef.current?.value.trim() ?? ''
    const password = passwordRef.current?.value ?? ''
    const confirm = confirmRef.current?.value ?? ''
    const terms = termsRef.current?.checked ?? false

    const nextErrors: SignUpErrors = {}
    if (name.length < 2) nextErrors.name = 'Enter your full name.'
    if (!EMAIL_PATTERN.test(email))
      nextErrors.email = 'Enter a valid email address.'
    if (password.length < 8)
      nextErrors.password = 'Password must be at least 8 characters.'
    if (confirm.length === 0 || confirm !== password)
      nextErrors.confirm = "Passwords don't match."
    if (!terms) nextErrors.terms = 'Please agree to the terms to continue.'

    setErrors(nextErrors)

    const focusOrder = [
      [nextErrors.name, nameRef],
      [nextErrors.email, emailRef],
      [nextErrors.password, passwordRef],
      [nextErrors.confirm, confirmRef],
    ] as const
    const firstBad = focusOrder.find(([error]) => error)
    if (firstBad) {
      firstBad[1].current?.focus()
      return
    }
    if (nextErrors.terms) return

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })
    setLoading(false)

    if (error) {
      setErrors({ form: error.message })
      return
    }
    // Supabase obfuscates existing confirmed accounts: it "succeeds"
    // but returns a user with no identities
    if (data.user?.identities?.length === 0) {
      setErrors({
        email: 'An account with this email already exists. Try logging in.',
      })
      emailRef.current?.focus()
      return
    }

    setSentTo(email)
  }

  const handleResend = async () => {
    if (!sentTo || resent) return
    setResent(true)
    await supabase.auth.resend({
      type: 'signup',
      email: sentTo,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })
    setTimeout(() => setResent(false), 2400)
  }

  return (
    <>
      <Helmet>
        <title>Create your account · Building Control</title>
      </Helmet>
      <AuthShell>
        <AuthCard>
          {sentTo === null ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-h2 font-black tracking-snug text-heading">
                  Create your account
                </h1>
                <p className="mt-1.5 text-body-sm text-muted">
                  Submit and track building regulations applications.
                </p>
              </div>

              <form
                className="flex flex-col gap-4.5"
                onSubmit={handleSubmit}
                noValidate
              >
                <Field>
                  <FieldLabel>Full name</FieldLabel>
                  <Input
                    ref={nameRef}
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Sarah Davies"
                    onChange={() => clearError('name')}
                  />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel>Email address</FieldLabel>
                  <Input
                    ref={emailRef}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    onChange={() => clearError('email')}
                  />
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <PasswordInput
                    ref={passwordRef}
                    name="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setStrength(scorePassword(event.target.value))
                      clearError('password')
                    }}
                  />
                  <div className="mt-0.5">
                    <div className="flex gap-1.25">
                      {[1, 2, 3, 4].map((bar) => (
                        <span
                          key={bar}
                          className={cn(
                            'h-1 flex-1 rounded-xs transition-colors duration-200',
                            bar <= strength
                              ? strengthBarClass(strength)
                              : 'bg-border',
                          )}
                        />
                      ))}
                    </div>
                    <p
                      aria-live="polite"
                      className={cn(
                        'mt-1.5 text-caption font-semibold',
                        strengthLabelClass(strength),
                      )}
                    >
                      {STRENGTH_LABELS[strength]}
                    </p>
                  </div>
                  {errors.password && (
                    <FieldError>{errors.password}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Confirm password</FieldLabel>
                  <Input
                    ref={confirmRef}
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    onChange={() => clearError('confirm')}
                  />
                  {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
                </Field>

                <label className="flex cursor-pointer items-start gap-2.75 select-none">
                  <Checkbox
                    ref={termsRef}
                    className="mt-px"
                    aria-invalid={errors.terms ? true : undefined}
                    onChange={() => clearError('terms')}
                  />
                  <span className="text-caption leading-normal text-default">
                    I agree to the{' '}
                    <a
                      className="font-bold text-link hover:underline"
                      href="#"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      className="font-bold text-link hover:underline"
                      href="#"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                {errors.terms && (
                  <FieldError className="-mt-2.5">{errors.terms}</FieldError>
                )}

                {errors.form && <FieldError>{errors.form}</FieldError>}

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
                    Create account <ArrowRight />
                  </span>
                  {loading && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 m-auto size-4.75 animate-spin rounded-full border-[2.5px] border-on-primary/45 border-t-on-primary"
                    />
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div aria-live="polite" className="px-0 pt-2.5 pb-1.5 text-center">
              <div className="mx-auto mb-4.5 grid size-16 place-items-center rounded-full bg-success-bg text-success [&_svg]:size-7.5">
                <MailCheck aria-hidden="true" />
              </div>
              <h2 className="text-h2 font-black tracking-snug text-heading">
                Check your email
              </h2>
              <p className="mt-2.5 text-body-sm leading-normal text-muted">
                We&apos;ve sent a verification link to{' '}
                <b className="font-bold text-heading">{sentTo}</b>.
                <br />
                Click the link to activate your account.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <Button asChild size="lg" className="w-full py-3.25">
                  <Link to="/login">
                    Go to log in <ArrowRight />
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-caption text-faint">
                Didn&apos;t get it? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  className="cursor-pointer font-bold text-link hover:underline"
                >
                  {resent ? 'email sent ✓' : 'resend the email'}
                </button>
                .
              </p>
            </div>
          )}
        </AuthCard>

        {sentTo === null && (
          <p className="mt-6 text-center text-body-sm text-muted">
            Already have an account?{' '}
            <Link
              className="font-bold text-link no-underline hover:underline"
              to="/login"
            >
              Log in
            </Link>
          </p>
        )}
      </AuthShell>
    </>
  )
}
