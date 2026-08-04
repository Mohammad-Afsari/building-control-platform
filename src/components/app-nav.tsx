import { useEffect, useId, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { LayoutGrid, LogOut, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { Logo } from '@/src/components/logo'
import { cn } from '@/src/lib/utils'
import { supabase } from '@/src/lib/supabase/client'

type AppNavProps = {
  user: User
}

const displayName = (user: User) => {
  const fullName = user.user_metadata.full_name
  return typeof fullName === 'string' && fullName.trim()
    ? fullName.trim()
    : (user.email ?? 'Your account')
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const AppNav = ({ user }: AppNavProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState(false)
  const mobileMenuId = useId()
  const accountMenuId = useId()
  const accountRef = useRef<HTMLDivElement>(null)
  const name = displayName(user)
  const initials = initialsOf(name)

  useEffect(() => {
    if (!accountOpen) return

    const closeOnPointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false)
    }

    document.addEventListener('pointerdown', closeOnPointerDown)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [accountOpen])

  const signOut = async () => {
    setSigningOut(true)
    setSignOutError(false)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setSignOutError(true)
      setSigningOut(false)
    }
  }

  const dashboardLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex items-center gap-1.75 rounded-sm px-3.25 py-2 text-body-sm font-semibold no-underline transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-primary-100 [&_svg]:size-4',
      isActive
        ? 'bg-primary-subtle text-primary-hover'
        : 'text-muted hover:bg-raised hover:text-heading',
    )

  return (
    <nav
      aria-label="Application navigation"
      className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-15 max-w-205 items-center gap-3.5 px-5 md:h-16 md:gap-7 md:px-7">
        <Link
          to="/"
          aria-label="Building Control — home"
          className="rounded-sm no-underline outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          <Logo size={34} className="gap-2.75" />
        </Link>

        <div className="hidden md:block">
          <NavLink to="/applications" end className={dashboardLinkClass}>
            <LayoutGrid aria-hidden="true" /> Dashboard
          </NavLink>
        </div>

        <div ref={accountRef} className="relative ml-auto hidden md:block">
          <button
            type="button"
            aria-label="Your account"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            aria-controls={accountMenuId}
            onClick={() => setAccountOpen((current) => !current)}
            className="grid size-9 cursor-pointer place-items-center rounded-full border border-border-strong bg-primary-100 font-sans text-body-sm font-bold text-primary-700 outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            {initials}
          </button>

          {accountOpen && (
            <div
              id={accountMenuId}
              role="menu"
              className="absolute top-full right-0 z-50 mt-2.5 w-66 rounded-lg border border-border bg-card p-2 shadow-lg"
            >
              <div className="px-3 pt-2.5 pb-3.5">
                <div className="truncate text-body-sm font-bold text-heading">
                  {name}
                </div>
                <div className="truncate text-caption font-medium text-muted">
                  {user.email}
                </div>
              </div>
              <div className="mx-1.5 my-1 h-px bg-border" />
              <button
                type="button"
                role="menuitem"
                disabled={signingOut}
                onClick={signOut}
                className="flex w-full cursor-pointer items-center gap-2.75 rounded-sm px-3 py-2.5 text-left text-body-sm font-semibold text-destructive outline-none transition-colors duration-150 hover:bg-destructive-bg focus-visible:ring-3 focus-visible:ring-destructive-bg disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:size-4.25"
              >
                <LogOut aria-hidden="true" />
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
              {signOutError && (
                <p role="alert" className="px-3 pt-2 text-caption text-destructive">
                  We couldn't sign you out. Please try again.
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={mobileOpen}
          aria-controls={mobileMenuId}
          onClick={() => setMobileOpen((current) => !current)}
          className="ml-auto inline-grid size-10.5 place-items-center rounded-sm border border-border bg-card text-heading outline-none focus-visible:ring-3 focus-visible:ring-primary-100 md:hidden [&_svg]:size-5.25"
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          id={mobileMenuId}
          className="border-t border-border bg-card px-5 pt-2.5 pb-4.5 md:hidden"
        >
          <NavLink
            to="/applications"
            end
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.75 rounded-md px-3.5 py-3.25 text-body-lg font-semibold no-underline outline-none focus-visible:ring-3 focus-visible:ring-primary-100 [&_svg]:size-4.75',
                isActive
                  ? 'bg-primary-subtle text-primary-hover'
                  : 'text-default hover:bg-raised',
              )
            }
          >
            <LayoutGrid aria-hidden="true" /> Dashboard
          </NavLink>
          <div className="mx-1 my-2 h-px bg-border" />
          <div className="flex items-center gap-2.75 px-3.5 py-2.5">
            <div className="grid size-9 flex-none place-items-center rounded-full border border-border-strong bg-primary-100 text-body-sm font-bold text-primary-700">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-body-sm font-bold text-heading">
                {name}
              </div>
              <div className="truncate text-caption font-medium text-muted">
                {user.email}
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={signingOut}
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-2.75 rounded-md px-3.5 py-3.25 text-left text-body-lg font-semibold text-destructive outline-none hover:bg-destructive-bg focus-visible:ring-3 focus-visible:ring-destructive-bg disabled:opacity-45 [&_svg]:size-4.75"
          >
            <LogOut aria-hidden="true" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
          {signOutError && (
            <p role="alert" className="px-3.5 pt-2 text-caption text-destructive">
              We couldn't sign you out. Please try again.
            </p>
          )}
        </div>
      )}
    </nav>
  )
}
