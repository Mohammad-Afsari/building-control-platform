import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'
import { ArrowRight, MapPinOff } from 'lucide-react'
import { Logo } from '@/src/components/logo'
import { Button } from '@/src/components/ui/button'

/* Rendered by the catch-all route in App.tsx. Public on purpose — a
   signed-out visitor mistyping a URL is the main case, and sending
   them to login would be the dead end this page exists to remove.

   The mockup also offers "Go to dashboard" and "Contact support";
   both are deliberately absent while their destinations do not
   usefully exist. See specs/changes/archive for the reasoning. */
export const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Page not found · Building Control</title>
      </Helmet>
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(120%_80%_at_50%_-10%,var(--primary-50)_0%,transparent_55%)] px-5 py-8">
        <div className="w-full max-w-133 text-center">
          <Logo className="mb-9" />

          <div
            aria-hidden="true"
            className="mx-auto mb-5.5 grid size-16 place-items-center rounded-full bg-info-bg text-info [&_svg]:size-7.5"
          >
            <MapPinOff />
          </div>

          <p className="text-micro font-bold tracking-wide uppercase text-muted">
            Error 404
          </p>

          <h1 className="mt-2.5 text-h2 font-black tracking-snug text-heading">
            We can&apos;t find that page
          </h1>

          <p className="mx-auto mt-3.5 max-w-[46ch] text-body leading-normal text-muted">
            The page you&apos;re looking for may have moved, or the link might
            be out of date. It&apos;s not something you did wrong.
          </p>

          <div className="mt-7 flex justify-center">
            <Button asChild size="lg">
              <Link to="/">
                Go to the home page <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
