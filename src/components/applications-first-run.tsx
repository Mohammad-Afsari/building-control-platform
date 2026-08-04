import type { ReactNode } from 'react'
import { Check, Plus, Radar, SquarePen, UploadCloud } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/src/components/ui/button'
import { Logo } from '@/src/components/logo'

type ApplicationsFirstRunProps = {
  firstName: string
}

type HowCardProps = {
  icon: ReactNode
  step: string
  title: string
  children: ReactNode
}

const HowCard = ({ icon, step, title, children }: HowCardProps) => (
  <article className="rounded-lg border border-border bg-card px-5.5 pt-5.5 pb-5 shadow-sm">
    <div className="mb-3.25 flex items-center gap-3">
      <span className="grid size-11 flex-none place-items-center rounded-md border border-primary-100 bg-primary-50 text-primary-700 [&_svg]:size-5.25">
        {icon}
      </span>
      <span className="font-mono text-micro font-bold text-faint">{step}</span>
    </div>
    <h3 className="text-body-lg font-bold tracking-snug text-heading">
      {title}
    </h3>
    <p className="mt-1.25 text-caption leading-normal text-muted">{children}</p>
  </article>
)

export const ApplicationsFirstRun = ({
  firstName,
}: ApplicationsFirstRunProps) => {
  return (
    <main className="mx-auto max-w-205 px-5 pt-9.5 pb-20 md:px-7">
      <section className="relative overflow-hidden rounded-xl border border-border bg-card shadow-md before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-55 before:bg-primary-50 before:opacity-55">
        <div className="relative px-7 pt-16 pb-14 text-center">
          <div
            aria-hidden="true"
            className="relative mx-auto mb-7.5 size-33"
          >
            <div className="absolute inset-0 rounded-full border border-border bg-card shadow-md ring-8 ring-primary-50" />
            <div className="absolute inset-0 grid place-items-center">
              <Logo size={62} showWordmark={false} />
            </div>
            <div className="absolute right-1 bottom-1.5 grid size-10 place-items-center rounded-full border-3 border-card bg-primary text-on-primary shadow-md [&_svg]:size-5.25">
              <Check />
            </div>
          </div>

          <p className="mb-3.5 text-caption font-bold tracking-wide text-primary-700 uppercase">
            Welcome, {firstName}
          </p>
          <h1 className="text-display leading-tight font-black tracking-tight text-balance text-heading">
            Let's get your first application started
          </h1>
          <p className="mx-auto mt-3.5 max-w-110 text-body-lg leading-normal text-muted">
            There's nothing here yet — and that's fine. No jargon, no
            guesswork. We'll guide you through it one step at a time.
          </p>
          <div className="mt-7.5 flex justify-center">
            <Button asChild size="lg">
              <Link to="/applications/new">
                <Plus aria-hidden="true" /> Start your first application
              </Link>
            </Button>
          </div>
          <div className="mt-5.5 flex flex-wrap items-center justify-center gap-4.5 text-caption text-muted">
            {[
              'Free to start',
              'Save and return any time',
              "We tell you what's next",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.75">
                <Check aria-hidden="true" className="size-3.75 text-success" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="how-it-works" className="mt-6.5">
        <div className="mb-4 flex items-center gap-2.75 pl-0.5">
          <h2
            id="how-it-works"
            className="text-caption font-bold tracking-wide text-faint uppercase"
          >
            Here's how it works
          </h2>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <HowCard
            icon={<SquarePen aria-hidden="true" />}
            step="Step 1"
            title="Tell us about the work"
          >
            Name your application and the site, then choose the type of work.
          </HowCard>
          <HowCard
            icon={<UploadCloud aria-hidden="true" />}
            step="Step 2"
            title="Add your details & plans"
          >
            Upload documents and pay the fee — we'll show you exactly what's
            needed.
          </HowCard>
          <HowCard
            icon={<Radar aria-hidden="true" />}
            step="Step 3"
            title="Submit & track"
          >
            Follow every step here, and we'll always tell you what happens
            next.
          </HowCard>
        </div>
      </section>
    </main>
  )
}
