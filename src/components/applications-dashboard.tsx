import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock,
  Info,
  LayoutGrid,
  List,
  PencilLine,
  Plus,
  Search,
  SearchX,
} from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { StatusBadge } from '@/src/components/ui/status-badge'
import { cn } from '@/src/lib/utils'
import {
  APPLICATION_CATEGORIES,
  APPLICATION_TYPES,
  STATUS_LABELS,
} from '@/src/types/application'
import type {
  ApplicationCategory,
  ApplicationStatus,
  ApplicationSummary,
  ApplicationType,
} from '@/src/types/application'

const VIEW_STORAGE_KEY = 'bc_dash_view'
const PAGE_SIZE = 6

type DashboardView = 'list' | 'cards'
type DashboardFilter = 'all' | ApplicationStatus
type ProgressSegment = 'done' | 'warn' | 'bad' | 'empty'

type StatusDisplay = {
  label: string
  filterLabel: string
  progress: [
    ProgressSegment,
    ProgressSegment,
    ProgressSegment,
    ProgressSegment,
  ]
  next: {
    icon: typeof PencilLine
    iconClass: string
    lead: string
    rest: string
  }
  actionLabel: string
}

const STATUS_DISPLAY: Record<ApplicationStatus, StatusDisplay> = {
  draft: {
    label: STATUS_LABELS.draft,
    filterLabel: 'Drafts',
    progress: ['empty', 'empty', 'empty', 'empty'],
    next: {
      icon: PencilLine,
      iconClass: 'text-neutral-dot',
      lead: 'Not submitted yet',
      rest: ' — pick up where you left off',
    },
    actionLabel: 'Continue',
  },
  submitted: {
    label: STATUS_LABELS.submitted,
    filterLabel: 'Submitted',
    progress: ['done', 'done', 'empty', 'empty'],
    next: {
      icon: CircleCheckBig,
      iconClass: 'text-info-dot',
      lead: 'Received',
      rest: ' — a surveyor will be assigned shortly',
    },
    actionLabel: 'View',
  },
  review: {
    label: STATUS_LABELS.review,
    filterLabel: 'Under review',
    progress: ['done', 'done', 'warn', 'empty'],
    next: {
      icon: Clock,
      iconClass: 'text-action-needed-dot',
      lead: 'Under review',
      rest: " — we'll be in touch soon",
    },
    actionLabel: 'View',
  },
  approved: {
    label: STATUS_LABELS.approved,
    filterLabel: 'Approved',
    progress: ['done', 'done', 'done', 'done'],
    next: {
      icon: BadgeCheck,
      iconClass: 'text-success-dot',
      lead: 'Approved',
      rest: ' — view your application details',
    },
    actionLabel: 'View',
  },
  rejected: {
    label: STATUS_LABELS.rejected,
    filterLabel: 'Changes',
    progress: ['done', 'done', 'done', 'bad'],
    next: {
      icon: Info,
      iconClass: 'text-destructive-dot',
      lead: 'Changes needed',
      rest: ' — view your application details',
    },
    actionLabel: 'View',
  },
}

const PROGRESS_CLASS: Record<ProgressSegment, string> = {
  done: 'bg-success-dot',
  warn: 'bg-action-needed-dot',
  bad: 'bg-destructive-dot',
  empty: 'bg-border',
}

const FILTER_ORDER: DashboardFilter[] = [
  'all',
  'draft',
  'submitted',
  'review',
  'approved',
  'rejected',
]

const typeLabel = (type: ApplicationType) =>
  APPLICATION_TYPES.find((item) => item.id === type)?.title ?? type

const categoryLabel = (category: ApplicationCategory) =>
  APPLICATION_CATEGORIES.find((item) => item.id === category)?.name ?? category

const greetingFor = (date: Date) => {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const relativeTime = (iso: string) => {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

const pageItems = (current: number, total: number): (number | 'gap')[] => {
  const items: (number | 'gap')[] = []
  for (let page = 1; page <= total; page++) {
    if (page === 1 || page === total || Math.abs(page - current) <= 1) {
      items.push(page)
    } else if (items[items.length - 1] !== 'gap') {
      items.push('gap')
    }
  }
  return items
}

const initialView = (): DashboardView => {
  const saved = window.localStorage.getItem(VIEW_STORAGE_KEY)
  return saved === 'cards' ? 'cards' : 'list'
}

type ApplicationsDashboardProps = {
  applications: ApplicationSummary[]
  firstName: string
}

export const ApplicationsDashboard = ({
  applications,
  firstName,
}: ApplicationsDashboardProps) => {
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [view, setView] = useState<DashboardView>(initialView)

  const counts = useMemo(() => {
    const result: Record<DashboardFilter, number> = {
      all: applications.length,
      draft: 0,
      submitted: 0,
      review: 0,
      approved: 0,
      rejected: 0,
    }
    for (const application of applications) result[application.status]++
    return result
  }, [applications])

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return applications.filter((application) => {
      const matchesStatus =
        activeFilter === 'all' || application.status === activeFilter
      const searchable =
        `${application.name} ${application.address ?? ''} ${application.reference}`.toLowerCase()
      return matchesStatus &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [activeFilter, applications, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  const changeFilter = (filter: DashboardFilter) => {
    setActiveFilter(filter)
    setPage(1)
  }

  const changeQuery = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  const changeView = (nextView: DashboardView) => {
    setView(nextView)
    window.localStorage.setItem(VIEW_STORAGE_KEY, nextView)
  }

  return (
    <main className="mx-auto max-w-205 px-5 pt-9.5 pb-20 md:px-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-1.5 text-body-sm font-semibold text-muted">
            {greetingFor(new Date())}, {firstName}
          </p>
          <h1 className="text-display leading-tight font-black tracking-tight text-heading">
            Your applications
          </h1>
          <p className="mt-2 max-w-120 text-body-lg text-muted">
            Everything you've submitted, all in one place. We'll always tell
            you what happens next — no jargon.
          </p>
        </div>
        <Button asChild className="max-sm:w-full">
          <Link to="/applications/new">
            <Plus aria-hidden="true" /> Start new application
          </Link>
        </Button>
      </div>

      <div className="mb-4.5 flex flex-wrap items-center gap-3.5">
        <div
          role="group"
          aria-label="Filter applications by status"
          className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-card p-1"
        >
          {FILTER_ORDER.map((filter) => {
            const active = activeFilter === filter
            const label =
              filter === 'all' ? 'All' : STATUS_DISPLAY[filter].filterLabel
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={active}
                onClick={() => changeFilter(filter)}
                className={cn(
                  'inline-flex items-center gap-1.75 rounded-sm px-3.25 py-2 text-caption font-bold whitespace-nowrap outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-primary-100',
                  active
                    ? 'bg-primary text-on-primary'
                    : 'text-muted hover:bg-raised hover:text-heading',
                )}
              >
                {label}
                <span
                  className={cn(
                    'min-w-5 rounded-pill border px-1.5 text-center text-micro font-bold',
                    active
                      ? 'border-transparent bg-primary-600 text-on-primary'
                      : 'border-border bg-raised text-faint',
                  )}
                >
                  {counts[filter]}
                </span>
              </button>
            )
          })}
        </div>

        <div
          role="group"
          aria-label="Application view"
          className="ml-auto inline-flex rounded-md border border-border bg-card p-0.75 shadow-sm max-sm:ml-0"
        >
          {(['list', 'cards'] as const).map((mode) => {
            const Icon = mode === 'list' ? List : LayoutGrid
            return (
              <button
                key={mode}
                type="button"
                aria-label={mode === 'list' ? 'List view' : 'Card view'}
                aria-pressed={view === mode}
                onClick={() => changeView(mode)}
                className={cn(
                  'inline-flex items-center gap-1.75 rounded-sm px-3.25 py-2 text-caption font-bold capitalize outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-primary-100 [&_svg]:size-4',
                  view === mode
                    ? 'bg-ink-900 text-on-brand'
                    : 'text-muted hover:text-heading',
                )}
              >
                <Icon aria-hidden="true" /> {mode}
              </button>
            )
          })}
        </div>

        <div className="relative max-sm:order-first max-sm:w-full sm:w-75">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.25 size-4.25 -translate-y-1/2 text-faint"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            placeholder="Search address or reference…"
            aria-label="Search applications"
            className="pl-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div role="status" className="py-14 text-center text-muted">
          <SearchX aria-hidden="true" className="mx-auto mb-3 size-7.5 text-faint" />
          <p className="text-body font-semibold">
            No applications match your filter.
          </p>
        </div>
      ) : view === 'list' ? (
        <ApplicationList applications={visible} />
      ) : (
        <ApplicationCards applications={visible} />
      )}

      {filtered.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 max-sm:justify-center">
          <p className="text-caption font-semibold text-muted">
            Showing{' '}
            <strong className="font-bold text-heading">
              {start + 1}–{start + visible.length}
            </strong>{' '}
            of <strong className="font-bold text-heading">{filtered.length}</strong>{' '}
            applications
          </p>
          {totalPages > 1 && (
            <Pager
              current={currentPage}
              total={totalPages}
              onChange={setPage}
            />
          )}
        </div>
      )}
    </main>
  )
}

type ApplicationListProps = {
  applications: ApplicationSummary[]
}

const ApplicationList = ({ applications }: ApplicationListProps) => (
  <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm max-sm:border-0 max-sm:bg-transparent max-sm:shadow-none">
    <div
      aria-hidden="true"
      className="grid grid-cols-[150px_1fr_130px_168px_130px_28px] items-center gap-4 border-b border-border bg-raised px-5.5 py-3.25 text-micro font-bold tracking-wide text-faint uppercase max-sm:hidden"
    >
      <span>Reference</span>
      <span>Project</span>
      <span>Type</span>
      <span>Status</span>
      <span>Last updated</span>
      <span />
    </div>
    <div className="max-sm:flex max-sm:flex-col max-sm:gap-3">
      {applications.map((application) => {
        const display = STATUS_DISPLAY[application.status]
        return (
          <Link
            key={application.id}
            to={`/applications/${application.id}`}
            className={cn(
              'grid grid-cols-[150px_1fr_130px_168px_130px_28px] items-center gap-4 border-b border-border px-5.5 py-4 no-underline outline-none transition-colors duration-150 last:border-b-0 hover:bg-raised focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-primary-100',
              'max-sm:grid-cols-[1fr_auto] max-sm:gap-x-3 max-sm:gap-y-2.5 max-sm:rounded-lg max-sm:border max-sm:bg-card max-sm:px-4.5 max-sm:py-4 max-sm:shadow-sm',
            )}
          >
            <span className="text-caption font-bold text-muted tabular-nums max-sm:hidden">
              {application.reference}
            </span>
            <span className="min-w-0 max-sm:col-span-2 max-sm:row-start-2">
              <span className="block truncate text-body-sm font-bold text-heading">
                {application.address ?? application.name}
              </span>
              <span className="mt-0.5 block truncate text-caption text-muted">
                {application.name}
              </span>
            </span>
            <span className="text-body-sm font-semibold text-default max-sm:col-span-2 max-sm:row-start-3">
              {typeLabel(application.type)}
              <small className="mt-px block text-micro font-medium text-faint max-sm:inline max-sm:pl-2">
                {categoryLabel(application.category)}
              </small>
              <small className="hidden text-micro font-bold text-faint tabular-nums max-sm:float-right max-sm:block">
                {application.reference}
              </small>
            </span>
            <span className="max-sm:col-start-1 max-sm:row-start-1">
              <StatusBadge status={application.status}>
                {display.label}
              </StatusBadge>
            </span>
            <span className="text-body-sm font-medium text-muted max-sm:col-start-2 max-sm:row-start-1 max-sm:self-center max-sm:text-right">
              {application.status === 'draft' ? 'Started' : 'Updated'}{' '}
              {relativeTime(application.updatedAt)}
            </span>
            <ChevronRight aria-hidden="true" className="size-4.5 text-faint max-sm:hidden" />
          </Link>
        )
      })}
    </div>
  </div>
)

type ApplicationCardsProps = {
  applications: ApplicationSummary[]
}

const ApplicationCards = ({ applications }: ApplicationCardsProps) => (
  <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2">
    {applications.map((application) => {
      const display = STATUS_DISPLAY[application.status]
      const NextIcon = display.next.icon
      return (
        <Link
          key={application.id}
          to={`/applications/${application.id}`}
          className="group rounded-lg no-underline outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          <Card interactive className="h-full">
            <CardHeader>
              <StatusBadge status={application.status}>
                {display.label}
              </StatusBadge>
              <span className="text-caption font-medium whitespace-nowrap text-faint">
                {application.status === 'draft' ? 'Started' : 'Updated'}{' '}
                {relativeTime(application.updatedAt)}
              </span>
            </CardHeader>
            <CardTitle>{application.address ?? application.name}</CardTitle>
            <CardDescription>
              <span>{application.name}</span>
              <span className="rounded-xs border border-border bg-raised px-2 py-0.5 text-micro font-semibold text-muted tabular-nums">
                {application.reference}
              </span>
            </CardDescription>

            <div aria-hidden="true" className="mt-4.5 mb-3.5 flex gap-1.25">
              {display.progress.map((segment, index) => (
                <span
                  key={index}
                  className={cn(
                    'h-1.25 flex-1 rounded-xs',
                    PROGRESS_CLASS[segment],
                  )}
                />
              ))}
            </div>

            <CardFooter>
              <span className="flex items-center gap-2.25 text-body-sm font-medium text-default">
                <NextIcon
                  aria-hidden="true"
                  className={cn('size-4 flex-none', display.next.iconClass)}
                />
                <span>
                  <strong className="font-semibold text-heading">
                    {display.next.lead}
                  </strong>
                  {display.next.rest}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.25 text-body-sm font-bold whitespace-nowrap text-link group-hover:underline [&_svg]:size-3.75 [&_svg]:transition-transform group-hover:[&_svg]:translate-x-0.75">
                {display.actionLabel} <ArrowRight aria-hidden="true" />
              </span>
            </CardFooter>
          </Card>
        </Link>
      )
    })}
  </div>
)

type PagerProps = {
  current: number
  total: number
  onChange: (page: number) => void
}

const Pager = ({ current, total, onChange }: PagerProps) => {
  const buttonClass =
    'grid h-9.5 min-w-9.5 place-items-center rounded-md border border-border-strong bg-card px-2.5 text-body-sm font-bold text-default outline-none transition-colors duration-150 hover:border-neutral-400 hover:bg-raised focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-4.25'

  return (
    <nav aria-label="Application pages" className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Previous page"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className={buttonClass}
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      {pageItems(current, total).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-0.5 font-bold text-faint">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === current ? 'page' : undefined}
            onClick={() => onChange(item)}
            className={cn(
              buttonClass,
              item === current &&
                'border-primary bg-primary text-on-primary hover:border-primary hover:bg-primary',
            )}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className={buttonClass}
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </nav>
  )
}
