import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router'
import {
  Activity,
  BadgeCheck,
  Check,
  Compass,
  CreditCard,
  HardHat,
  Home as HomeIcon,
  Info,
  LogIn,
  Menu,
  MessageCircle,
  PenTool,
  Plus,
  Route as RouteIcon,
  Search,
  ShieldCheck,
  SquarePen,
  UploadCloud,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { Logo } from '@/src/components/logo'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'

type Step = {
  icon: typeof SquarePen
  label: string
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    icon: SquarePen,
    label: 'Step 1',
    title: 'Start your application',
    description: 'Give it a name and tell us where the work is taking place.',
  },
  {
    icon: UploadCloud,
    label: 'Step 2',
    title: 'Add details & documents',
    description: "Describe the work and upload your plans — we'll guide you.",
  },
  {
    icon: CreditCard,
    label: 'Step 3',
    title: 'Pay your fee',
    description: 'See a clear quote up front, then pay securely online.',
  },
  {
    icon: RouteIcon,
    label: 'Step 4',
    title: 'Submit & track',
    description: "Follow progress in real time and always know what's next.",
  },
]

type Audience = {
  icon: typeof HomeIcon
  title: string
  description: string
  points: string[]
}

const AUDIENCES: Audience[] = [
  {
    icon: HomeIcon,
    title: 'Homeowners',
    description:
      'Extending, converting or altering your home — and doing it by the book.',
    points: [
      'Apply yourself, with guidance at every step',
      'Plain-English help on what you need',
    ],
  },
  {
    icon: HardHat,
    title: 'Builders & contractors',
    description:
      'Managing work across multiple sites and clients, all in one view.',
    points: [
      'Submit on behalf of your clients',
      'Keep every job moving without the paperwork',
    ],
  },
  {
    icon: PenTool,
    title: 'Agents & architects',
    description: 'Acting for applicants and handling the technical detail.',
    points: [
      'Manage submissions and documents in one place',
      "Respond to the surveyor without the back-and-forth",
    ],
  },
]

type Reassurance = {
  icon: typeof Activity
  title: string
  description: string
}

const REASSURANCES: Reassurance[] = [
  {
    icon: Activity,
    title: 'Track progress in real time',
    description:
      "See exactly where your application is and what's happened so far — no chasing, no guessing.",
  },
  {
    icon: MessageCircle,
    title: 'No jargon, ever',
    description:
      "Everything is written in plain English, so you don't need to be an expert to understand it.",
  },
  {
    icon: Compass,
    title: "We tell you what's next",
    description:
      "Every step ends with a clear next action, so you're never left wondering what to do.",
  },
]

export const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <Helmet>
        <title>Building Control — Building regulations, in plain English</title>
      </Helmet>

      <SiteHeader
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
      />

      <main>
        <Hero />
        <HowItWorks />
        <WhoItsFor />
        <Reassurance />
        <CtaStrip />
      </main>

      <SiteFooter />
    </>
  )
}

/* ───────────────── Header ───────────────── */

type SiteHeaderProps = {
  mobileMenuOpen: boolean
  onToggleMobileMenu: () => void
}

const SiteHeader = ({ mobileMenuOpen, onToggleMobileMenu }: SiteHeaderProps) => (
  <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-md backdrop-saturate-150">
    <div className="mx-auto flex h-17 max-w-320 items-center gap-7.5 px-7 max-sm:h-15 max-sm:gap-3.5 max-sm:px-4.5">
      <Link to="/" className="flex items-center">
        <Logo size={36} />
      </Link>

      <nav className="ml-auto flex items-center gap-1 max-sm:hidden">
        <a
          href="#how"
          className="rounded-sm px-3.25 py-2 text-body-sm font-semibold whitespace-nowrap text-muted transition-colors duration-150 hover:bg-raised hover:text-heading"
        >
          How it works
        </a>
        <a
          href="#who"
          className="rounded-sm px-3.25 py-2 text-body-sm font-semibold whitespace-nowrap text-muted transition-colors duration-150 hover:bg-raised hover:text-heading"
        >
          Who it's for
        </a>
      </nav>

      <div className="flex items-center gap-2 max-sm:hidden">
        <Button asChild variant="ghost">
          <Link to="/login">
            <LogIn aria-hidden="true" /> Log in
          </Link>
        </Button>
        <Button asChild variant="primary">
          <Link to="/signup">Sign up</Link>
        </Button>
      </div>

      <button
        type="button"
        onClick={onToggleMobileMenu}
        aria-label="Menu"
        aria-controls="mobile-menu"
        aria-expanded={mobileMenuOpen}
        className="ml-auto grid size-10.5 flex-none place-items-center rounded-sm border border-border bg-card text-heading sm:hidden [&_svg]:size-5.25"
      >
        {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
    </div>

    {mobileMenuOpen && (
      <nav
        id="mobile-menu"
        className="flex flex-col gap-0.75 border-t border-border bg-card px-7 pt-3 pb-5 sm:hidden"
      >
        <a
          href="#how"
          onClick={onToggleMobileMenu}
          className="flex items-center gap-2.75 rounded-md px-3.5 py-3.25 text-body-lg font-semibold text-default [&_svg]:size-4.75 [&_svg]:text-faint"
        >
          <RouteIcon aria-hidden="true" /> How it works
        </a>
        <a
          href="#who"
          onClick={onToggleMobileMenu}
          className="flex items-center gap-2.75 rounded-md px-3.5 py-3.25 text-body-lg font-semibold text-default [&_svg]:size-4.75 [&_svg]:text-faint"
        >
          <Users aria-hidden="true" /> Who it's for
        </a>
        <div className="my-2 h-px bg-border" />
        <Button asChild variant="secondary" className="w-full py-3.5 text-body-lg">
          <Link to="/login">
            <LogIn aria-hidden="true" /> Log in
          </Link>
        </Button>
        <Button asChild variant="primary" className="w-full py-3.5 text-body-lg">
          <Link to="/signup">Sign up</Link>
        </Button>
      </nav>
    )}
  </header>
)

/* ───────────────── Hero ───────────────── */

const Hero = () => (
  <section className="border-b border-border bg-card">
    <div className="mx-auto grid max-w-320 grid-cols-[1.05fr_0.95fr] items-center gap-14 px-7 pt-19 pb-21 max-lg:grid-cols-1 max-lg:gap-11 max-lg:pt-13 max-lg:pb-15 max-sm:px-4.5">
      <div>
        <span className="mb-5.5 inline-flex items-center gap-2 rounded-pill border border-primary-100 bg-primary-50 px-3.25 py-1.5 text-caption font-bold tracking-wide text-primary-700 uppercase [&_svg]:size-3.5">
          <ShieldCheck aria-hidden="true" /> Official building control
        </span>
        <h1 className="text-hero leading-[1.04] font-black tracking-tight text-heading text-balance">
          Building regulations, in{' '}
          <em className="text-primary-600 not-italic">plain English</em>.
        </h1>
        <p className="mt-5 max-w-[46ch] text-body-lg leading-normal text-muted">
          Apply for approval, add your plans and documents, and follow every
          step in one calm place — built for homeowners, builders and agents.
        </p>
        <div className="mt-7.5 flex flex-wrap items-center gap-3.5">
          <Button asChild variant="primary" size="lg">
            <Link to="/applications/new">
              <Plus aria-hidden="true" /> Start an application
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/applications">
              <Search aria-hidden="true" /> Track an application
            </Link>
          </Button>
        </div>
        <div className="mt-5.5 flex flex-wrap items-center gap-4 text-caption text-muted">
          <span className="inline-flex items-center gap-1.75 [&_svg]:size-3.75 [&_svg]:text-success">
            <Check aria-hidden="true" /> Free to start
          </span>
          <span className="inline-flex items-center gap-1.75 [&_svg]:size-3.75 [&_svg]:text-success">
            <Check aria-hidden="true" /> Save and return any time
          </span>
          <span className="inline-flex items-center gap-1.75 [&_svg]:size-3.75 [&_svg]:text-success">
            <Check aria-hidden="true" /> No jargon
          </span>
        </div>
      </div>

      <div className="relative min-h-90 max-lg:min-h-80">
        <div className="absolute top-4.5 right-0 w-[88%] rounded-lg border border-border bg-card p-5 shadow-lg">
          <div className="mb-3.5 flex items-center justify-between gap-2.5">
            <span className="inline-flex items-center gap-1.75 rounded-pill bg-action-needed-bg py-1.25 pr-2.75 pl-2.25 text-caption font-bold text-action-needed">
              <span className="size-1.75 rounded-full bg-action-needed-dot" />
              Under review
            </span>
            <span className="text-caption font-medium text-faint">
              Updated yesterday
            </span>
          </div>
          <div className="text-h3 font-bold tracking-snug text-heading">
            8 Maple Court
          </div>
          <div className="mt-0.75 text-caption text-muted">
            Single-storey rear extension · BC-2026-04821
          </div>
          <div className="my-4 flex gap-1.25">
            <span className="h-1.25 flex-1 rounded-full bg-success-dot" />
            <span className="h-1.25 flex-1 rounded-full bg-success-dot" />
            <span className="h-1.25 flex-1 rounded-full bg-action-needed-dot" />
            <span className="h-1.25 flex-1 rounded-full bg-border" />
          </div>
          <div className="flex items-center gap-2 text-caption text-default [&_svg]:size-3.75 [&_svg]:flex-none [&_svg]:text-info-dot">
            <Info aria-hidden="true" /> A surveyor is reviewing your plans —
            we'll tell you what's next.
          </div>
        </div>

        <div className="absolute bottom-1.5 left-0 flex w-[64%] items-center gap-3 rounded-lg border border-border bg-card p-4.25 shadow-lg">
          <span className="grid size-9.5 flex-none place-items-center rounded-sm bg-success-bg text-success [&_svg]:size-4.75">
            <BadgeCheck aria-hidden="true" />
          </span>
          <span>
            <span className="block text-body-sm font-bold text-heading">
              Plans approved
            </span>
            <span className="mt-0.25 block text-caption text-muted">
              5 Oakwood Close · certificate ready
            </span>
          </span>
        </div>
      </div>
    </div>
  </section>
)

/* ───────────────── How it works ───────────────── */

const SectionHead = ({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string
  title: string
  lead: string
}) => (
  <div className="mb-13">
    <div className="mb-3 text-center text-micro font-bold tracking-wide text-primary-600 uppercase">
      {eyebrow}
    </div>
    <h2 className="text-section text-center leading-tight font-black tracking-tight text-heading text-balance">
      {title}
    </h2>
    <p className="mx-auto mt-3.5 max-w-[52ch] text-center text-body-lg text-muted">
      {lead}
    </p>
  </div>
)

const HowItWorks = () => (
  <section id="how" className="px-7 py-21 max-lg:py-14 max-sm:px-4.5">
    <div className="mx-auto max-w-320">
      <SectionHead
        eyebrow="How it works"
        title="Four simple steps, start to finish"
        lead="No forms to print, no jargon to decode. Everything happens online, and you can stop and pick up where you left off."
      />
      <div className="grid grid-cols-4 gap-5.5 max-lg:grid-cols-2 max-lg:gap-7 max-sm:grid-cols-1">
        {STEPS.map((step) => (
          <div key={step.title}>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-12 flex-none place-items-center rounded-md border border-primary-100 bg-primary-50 text-primary-700 [&_svg]:size-5.75">
                <step.icon aria-hidden="true" />
              </span>
              <span className="font-mono text-caption font-bold text-faint">
                {step.label}
              </span>
            </div>
            <h3 className="text-body-lg font-bold tracking-snug text-heading">
              {step.title}
            </h3>
            <p className="mt-1.5 text-body-sm leading-normal text-muted">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/* ───────────────── Who it's for ───────────────── */

const WhoItsFor = () => (
  <section
    id="who"
    className="border-y border-border bg-card px-7 py-21 max-lg:py-14 max-sm:px-4.5"
  >
    <div className="mx-auto max-w-320">
      <SectionHead
        eyebrow="Who it's for"
        title="Built for everyone on the project"
        lead="Whether it's your own home or your hundredth job, the process is the same calm, clear flow."
      />
      <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-1 max-lg:mx-auto max-lg:max-w-120">
        {AUDIENCES.map((audience) => (
          <Card key={audience.title} interactive className="p-7 pb-6.5">
            <span className="mb-4.5 grid size-13 place-items-center rounded-md bg-linear-155 from-primary-600 to-primary-800 text-on-brand shadow-sm [&_svg]:size-6.25">
              <audience.icon aria-hidden="true" />
            </span>
            <h3 className="text-h3 font-bold tracking-snug text-heading">
              {audience.title}
            </h3>
            <p className="mt-2 text-body-sm leading-normal text-muted">
              {audience.description}
            </p>
            <ul className="mt-4 flex flex-col gap-2.25">
              {audience.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-2.25 text-body-sm text-default [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:flex-none [&_svg]:text-success"
                >
                  <Check aria-hidden="true" /> {point}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  </section>
)

/* ───────────────── Reassurance band ───────────────── */

const Reassurance = () => (
  <section className="bg-linear-160 from-primary-700 to-primary-900 px-7 py-21 max-lg:py-14 max-sm:px-4.5">
    <div className="mx-auto max-w-320">
      <div className="mb-13">
        <div className="mb-3 text-center text-micro font-bold tracking-wide text-primary-200 uppercase">
          Designed to reassure
        </div>
        <h2 className="text-section text-center leading-tight font-black tracking-tight text-on-brand text-balance">
          Calm, clear and never bureaucratic
        </h2>
        <p className="mx-auto mt-3.5 max-w-[52ch] text-center text-body-lg text-on-brand/78">
          Building work is stressful enough. We made the admin the easy part.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-5 max-lg:mx-auto max-lg:max-w-115 max-lg:grid-cols-1">
        {REASSURANCES.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-on-brand/14 bg-on-brand/6 p-6.5"
          >
            <span className="mb-4 grid size-11.5 place-items-center rounded-md bg-on-brand/12 text-on-brand [&_svg]:size-5.5">
              <item.icon aria-hidden="true" />
            </span>
            <h3 className="text-body-lg font-bold tracking-snug text-on-brand">
              {item.title}
            </h3>
            <p className="mt-1.75 text-body-sm leading-normal text-on-brand/74">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/* ───────────────── CTA strip ───────────────── */

const CtaStrip = () => (
  <section className="px-7 py-21 text-center max-lg:py-14 max-sm:px-4.5">
    <div className="mx-auto max-w-320">
      <h2 className="text-section leading-tight font-black tracking-tight text-heading">
        Ready when you are
      </h2>
      <p className="mx-auto mt-3 mb-7 max-w-[46ch] text-body-lg text-muted">
        Start an application in minutes. It's free to begin, and your
        progress saves as you go.
      </p>
      <Button asChild variant="primary" size="lg">
        <Link to="/applications/new">
          <Plus aria-hidden="true" /> Start an application
        </Link>
      </Button>
    </div>
  </section>
)

/* ───────────────── Footer ───────────────── */

const SiteFooter = () => (
  <footer className="bg-ink-900 text-on-brand/66">
    <div className="mx-auto max-w-320 px-7 max-sm:px-4.5">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 py-16 pb-10 max-md:grid-cols-2 max-md:gap-8 max-xs:grid-cols-1">
        <div>
          <Logo variant="reversed" size={30} />
          <p className="mt-3.5 max-w-[32ch] text-body-sm leading-normal text-on-brand/55">
            The simple way to apply for building regulations approval and
            track every step.
          </p>
        </div>

        <FooterColumn
          heading="Guidance"
          links={[
            { label: 'When you need approval', to: '#' },
            { label: 'Types of application', to: '#' },
            { label: 'Fees & charges', to: '#' },
            { label: 'Help centre', to: '#' },
          ]}
        />
        <FooterColumn
          heading="Contact"
          links={[
            { label: 'Email us', to: '#' },
            { label: 'Call 0800 000 0000', to: '#' },
            { label: 'Find your local authority', to: '#' },
          ]}
        />
        <FooterColumn
          heading="Account"
          links={[
            { label: 'Log in', to: '/login' },
            { label: 'Start an application', to: '/applications/new' },
            { label: 'Track an application', to: '/applications' },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-on-brand/10 py-5.5">
        <p className="text-caption text-on-brand/50">
          © 2026 Building Control. A demonstration portal.
        </p>
        <div className="flex flex-wrap gap-5">
          {['Privacy', 'Terms', 'Accessibility', 'Cookies'].map((label) => (
            <a
              key={label}
              href="#"
              className="text-caption text-on-brand/60 transition-colors duration-150 hover:text-on-brand"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
)

type FooterLink = { label: string; to: string }

const FooterColumn = ({
  heading,
  links,
}: {
  heading: string
  links: FooterLink[]
}) => (
  <div>
    <h4 className="mb-4 text-micro font-bold tracking-wide text-on-brand/45 uppercase">
      {heading}
    </h4>
    <ul className="flex flex-col gap-2.75">
      {links.map((link) => (
        <li key={link.label}>
          {link.to.startsWith('/') ? (
            <Link
              to={link.to}
              className={cn(
                'text-body-sm text-on-brand/72 transition-colors duration-150 hover:text-on-brand',
              )}
            >
              {link.label}
            </Link>
          ) : (
            <a
              href={link.to}
              className="text-body-sm text-on-brand/72 transition-colors duration-150 hover:text-on-brand"
            >
              {link.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  </div>
)
