import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { Check, TriangleAlert } from 'lucide-react'
import { cn } from '@/src/lib/utils'

type StepperProps = React.ComponentProps<'div'>

const Stepper = ({ className, ...props }: StepperProps) => {
  return (
    <div
      data-slot="stepper"
      className={cn('flex items-start', className)}
      {...props}
    />
  )
}

const stepVariants = cva(
  'relative flex flex-1 flex-col items-center text-center before:absolute before:top-3.75 before:left-0 before:h-0.5 before:w-1/2 before:bg-border-strong after:absolute after:top-3.75 after:right-0 after:h-0.5 after:w-1/2 after:bg-border-strong first:before:hidden last:after:hidden',
  {
    variants: {
      status: {
        upcoming: '',
        done: 'before:bg-success after:bg-success [&_[data-slot=step-dot]]:border-success [&_[data-slot=step-dot]]:bg-success [&_[data-slot=step-dot]]:text-on-brand [&_[data-slot=step-label]]:text-default',
        current:
          'before:bg-success [&_[data-slot=step-dot]]:border-primary [&_[data-slot=step-dot]]:bg-primary-50 [&_[data-slot=step-dot]]:text-primary [&_[data-slot=step-label]]:font-bold [&_[data-slot=step-label]]:text-heading',
        warn: 'before:bg-success [&_[data-slot=step-dot]]:border-action-needed-dot [&_[data-slot=step-dot]]:bg-action-needed-bg [&_[data-slot=step-dot]]:text-action-needed [&_[data-slot=step-label]]:font-bold [&_[data-slot=step-label]]:text-action-needed',
      },
    },
    defaultVariants: {
      status: 'upcoming',
    },
  },
)

type StepProps = React.ComponentProps<'div'> &
  VariantProps<typeof stepVariants> & {
    label: React.ReactNode
  }

const Step = ({ className, status, label, children, ...props }: StepProps) => {
  return (
    <div
      data-slot="step"
      className={cn(stepVariants({ status, className }))}
      {...props}
    >
      <div
        data-slot="step-dot"
        className="relative z-1 grid size-8 place-items-center rounded-full border-2 border-border-strong bg-card text-caption font-bold text-faint [&_svg]:size-4"
      >
        {status === 'done' ? (
          <Check aria-hidden="true" />
        ) : status === 'warn' ? (
          <TriangleAlert aria-hidden="true" />
        ) : (
          children
        )}
      </div>
      <div
        data-slot="step-label"
        className="mt-2.25 max-w-[12ch] text-caption font-semibold text-muted"
      >
        {label}
      </div>
    </div>
  )
}

export { Stepper, Step, stepVariants }
