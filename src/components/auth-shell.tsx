import { Link } from 'react-router'
import { cn } from '@/src/lib/utils'

type AuthShellProps = {
  children: React.ReactNode
}

/** Shared scaffold for the auth pages (sign up, log in): radial brand
    glow, stacked logo lockup, centred column and the back-to-home
    footer. */
const AuthShell = ({ children }: AuthShellProps) => {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(120%_80%_at_50%_-10%,var(--primary-50)_0%,transparent_55%)] px-5 py-8">
      <div className="w-full max-w-102">
        <div className="mb-6.5 flex flex-col items-center gap-3">
          <img
            src="/logo/building-control-logo.svg"
            alt=""
            width={52}
            height={52}
            className="block size-13"
          />
          {/* text-h3 (19px) matches the design's auth wordmark size */}
          <span className="text-h3 tracking-snug whitespace-nowrap">
            <span className="font-black text-heading">Building</span>{' '}
            <span className="font-semibold text-muted">Control</span>
          </span>
        </div>

        {children}

        <p className="mt-5.5 text-center text-caption">
          <Link
            className="text-muted no-underline transition-colors duration-150 hover:text-default"
            to="/"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}

type AuthCardProps = React.ComponentProps<'div'>

const AuthCard = ({ className, ...props }: AuthCardProps) => {
  return (
    <div
      data-slot="auth-card"
      className={cn(
        'rounded-xl border border-border bg-card px-8.5 pt-8.5 pb-7.5 shadow-md max-sm:px-5.5 max-sm:py-6.5',
        className,
      )}
      {...props}
    />
  )
}

export { AuthShell, AuthCard }
