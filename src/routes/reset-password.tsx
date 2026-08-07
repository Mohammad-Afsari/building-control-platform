import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  Link2Off,
} from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { initialAuthCallback, supabase } from '@/src/lib/supabase/client'
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
import { PasswordInput } from '@/src/components/ui/password-input'

type ResetState = 'checking' | 'ready' | 'invalid' | 'cleanup' | 'success'

type ResetPasswordErrors = {
  password?: string
  confirm?: string
}

const STRENGTH_LABELS = [
  'Use 8+ characters with a mix of letters and numbers.',
  'Weak — add more characters.',
  'Okay — add numbers or symbols.',
  'Good password.',
  'Strong password.',
]

const UPDATE_FALLBACK_ERROR =
  'We could not update your password. Please try again.'
const CLEANUP_ERROR =
  'Your password was updated, but we could not finish signing you out. Try again to secure this browser session.'

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

export const ResetPasswordPage = () => {
  const [state, setState] = useState<ResetState>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<ResetPasswordErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)
  const strength = scorePassword(password)

  useEffect(() => {
    let active = true

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        active &&
        event === 'PASSWORD_RECOVERY' &&
        session &&
        !initialAuthCallback.hasError
      ) {
        setState('ready')
      }
    })

    const checkInitialSession = async () => {
      if (
        initialAuthCallback.hasError ||
        !initialAuthCallback.isPasswordRecovery
      ) {
        if (active) setState('invalid')
        return
      }

      const { data: sessionData, error } = await supabase.auth.getSession()
      if (!active) return

      setState((current) => {
        if (current === 'ready') return current
        return !error && sessionData.session ? 'ready' : 'invalid'
      })
    }

    void checkInitialSession()

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
    setErrors((current) => ({ ...current, password: undefined }))
  }

  const handleConfirmChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirm(event.target.value)
    setErrors((current) => ({ ...current, confirm: undefined }))
  }

  const endRecoverySession = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) {
      setState('cleanup')
      setFormError(CLEANUP_ERROR)
      return
    }

    setState('success')
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const nextErrors: ResetPasswordErrors = {}
    if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }
    if (confirm.length === 0 || confirm !== password) {
      nextErrors.confirm = "Passwords don't match."
    }
    setErrors(nextErrors)

    if (nextErrors.password) {
      passwordRef.current?.focus()
      return
    }
    if (nextErrors.confirm) {
      confirmRef.current?.focus()
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setLoading(false)
      setFormError(
        error.message && error.message !== '{}'
          ? error.message
          : UPDATE_FALLBACK_ERROR,
      )
      passwordRef.current?.focus()
      return
    }

    await endRecoverySession()
    setLoading(false)
  }

  const handleCleanupRetry = async () => {
    if (loading) return
    setLoading(true)
    setFormError(null)
    await endRecoverySession()
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Set a new password · Building Control</title>
      </Helmet>
      <AuthShell>
        <AuthCard className={state === 'ready' ? undefined : 'text-center'}>
          {state === 'checking' && (
            <div aria-live="polite" className="py-4">
              <span
                aria-hidden="true"
                className="mx-auto block size-9 animate-spin rounded-full border-[2.5px] border-primary-100 border-t-primary"
              />
              <h1 className="mt-4 text-h2 font-black tracking-snug text-heading">
                Checking your reset link
              </h1>
              <p className="mt-2.5 text-body-sm text-muted">
                This will only take a moment…
              </p>
            </div>
          )}

          {state === 'invalid' && (
            <div aria-live="polite">
              <div className="mx-auto mb-4.5 grid size-16 place-items-center rounded-full bg-destructive-bg text-destructive [&_svg]:size-7.5">
                <Link2Off aria-hidden="true" />
              </div>
              <h1 className="text-h2 font-black tracking-snug text-heading">
                This reset link is invalid
              </h1>
              <p className="mx-auto mt-2.5 max-w-[36ch] text-body-sm leading-normal text-muted">
                This link has expired, has already been used, or is incomplete.
                Request a new link to reset your password.
              </p>
              <div className="mt-6">
                <Button asChild size="lg" className="w-full py-3.25">
                  <Link to="/forgot-password">
                    Request a new link <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {state === 'cleanup' && (
            <div aria-live="polite">
              <div className="mx-auto mb-4.5 grid size-16 place-items-center rounded-full bg-action-needed-bg text-action-needed [&_svg]:size-7.5">
                <CircleAlert aria-hidden="true" />
              </div>
              <h1 className="text-h2 font-black tracking-snug text-heading">
                Finish signing out
              </h1>
              <p className="mx-auto mt-2.5 max-w-[36ch] text-body-sm leading-normal text-muted">
                Your new password is saved. Finish signing out before you
                continue to keep this recovery session secure.
              </p>
              {formError && (
                <p
                  role="alert"
                  className="mt-4 text-body-sm font-semibold text-destructive"
                >
                  {formError}
                </p>
              )}
              <div className="mt-6">
                <Button
                  type="button"
                  size="lg"
                  disabled={loading}
                  onClick={handleCleanupRetry}
                  className={cn(
                    'relative w-full py-3.25',
                    loading && 'disabled:opacity-100',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex items-center gap-2',
                      loading && 'invisible',
                    )}
                  >
                    {loading ? 'Finishing sign out…' : 'Finish signing out'}
                    <ArrowRight aria-hidden="true" />
                  </span>
                  {loading && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 m-auto size-4.75 animate-spin rounded-full border-[2.5px] border-on-primary/45 border-t-on-primary"
                    />
                  )}
                </Button>
              </div>
            </div>
          )}

          {state === 'success' && (
            <div aria-live="polite">
              <div className="mx-auto mb-4.5 grid size-16 place-items-center rounded-full bg-success-bg text-success [&_svg]:size-7.5">
                <BadgeCheck aria-hidden="true" />
              </div>
              <h1 className="text-h2 font-black tracking-snug text-heading">
                Password updated
              </h1>
              <p className="mx-auto mt-2.5 max-w-[36ch] text-body-sm leading-normal text-muted">
                Your password has been changed. Use it next time you log in to
                your account.
              </p>
              <div className="mt-6">
                <Button asChild size="lg" className="w-full py-3.25">
                  <Link to="/login">
                    Continue to log in <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {state === 'ready' && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-h2 font-black tracking-snug text-heading">
                  Set a new password
                </h1>
                <p className="mt-1.5 text-body-sm text-muted">
                  Choose a new password for your account. Make it something only
                  you would know.
                </p>
              </div>

              {formError && (
                <Alert variant="danger" className="mb-5">
                  <AlertIcon>
                    <CircleAlert />
                  </AlertIcon>
                  <AlertContent>
                    <AlertDescription>{formError}</AlertDescription>
                  </AlertContent>
                </Alert>
              )}

              <form
                className="flex flex-col gap-4.5"
                onSubmit={handleSubmit}
                noValidate
              >
                <Field>
                  <FieldLabel>New password</FieldLabel>
                  <PasswordInput
                    ref={passwordRef}
                    name="new-password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  <div className="mt-0.5">
                    <div className="flex gap-1.25" aria-hidden="true">
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
                  <FieldLabel>Confirm new password</FieldLabel>
                  <Input
                    ref={confirmRef}
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
                    value={confirm}
                    onChange={handleConfirmChange}
                  />
                  {confirm.length > 0 && confirm === password && (
                    <span className="flex items-center gap-1.5 text-caption font-semibold text-success [&_svg]:size-3.5">
                      <CheckCircle2 aria-hidden="true" /> Passwords match.
                    </span>
                  )}
                  {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
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
                    {loading ? 'Updating password…' : 'Update password'}
                    <ArrowRight aria-hidden="true" />
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
          )}
        </AuthCard>
      </AuthShell>
    </>
  )
}
