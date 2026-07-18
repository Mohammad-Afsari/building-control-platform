import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/src/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex flex-none items-center gap-1.75 whitespace-nowrap rounded-pill py-1.25 pr-2.75 pl-2.25 font-sans text-caption font-bold tracking-normal',
  {
    variants: {
      status: {
        draft: 'bg-neutral-bg text-neutral [&>[data-slot=badge-dot]]:bg-neutral-dot',
        submitted: 'bg-info-bg text-info [&>[data-slot=badge-dot]]:bg-info-dot',
        review:
          'bg-action-needed-bg text-action-needed [&>[data-slot=badge-dot]]:bg-action-needed-dot',
        approved:
          'bg-success-bg text-success [&>[data-slot=badge-dot]]:bg-success-dot',
        rejected:
          'bg-destructive-bg text-destructive [&>[data-slot=badge-dot]]:bg-destructive-dot',
      },
    },
    defaultVariants: {
      status: 'draft',
    },
  },
)

type StatusBadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof statusBadgeVariants>

const StatusBadge = ({
  className,
  status,
  children,
  ...props
}: StatusBadgeProps) => {
  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ status, className }))}
      {...props}
    >
      <span
        data-slot="badge-dot"
        className="size-1.75 flex-none rounded-full"
        aria-hidden="true"
      />
      {children}
    </span>
  )
}

export { StatusBadge, statusBadgeVariants }
