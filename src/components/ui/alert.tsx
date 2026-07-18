import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/src/lib/utils'

const alertVariants = cva(
  'flex items-start gap-3.25 rounded-lg border border-border bg-card px-4.5 py-3.75 shadow-sm',
  {
    variants: {
      variant: {
        info: '[&_[data-slot=alert-icon]]:bg-info-bg [&_[data-slot=alert-icon]]:text-info',
        success:
          '[&_[data-slot=alert-icon]]:bg-success-bg [&_[data-slot=alert-icon]]:text-success',
        warning:
          '[&_[data-slot=alert-icon]]:bg-action-needed-bg [&_[data-slot=alert-icon]]:text-action-needed',
        danger:
          '[&_[data-slot=alert-icon]]:bg-destructive-bg [&_[data-slot=alert-icon]]:text-destructive',
        neutral:
          '[&_[data-slot=alert-icon]]:bg-neutral-bg [&_[data-slot=alert-icon]]:text-neutral',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
)

type AlertProps = React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants>

const Alert = ({ className, variant, ...props }: AlertProps) => {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant, className }))}
      {...props}
    />
  )
}

type AlertIconProps = React.ComponentProps<'div'>

const AlertIcon = ({ className, ...props }: AlertIconProps) => {
  return (
    <div
      data-slot="alert-icon"
      className={cn(
        'grid size-9.5 flex-none place-items-center rounded-sm [&_svg]:size-4.75',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

type AlertContentProps = React.ComponentProps<'div'>

const AlertContent = ({ className, ...props }: AlertContentProps) => {
  return (
    <div
      data-slot="alert-content"
      className={cn('min-w-0 flex-1 pt-px', className)}
      {...props}
    />
  )
}

type AlertTitleProps = React.ComponentProps<'div'>

const AlertTitle = ({ className, ...props }: AlertTitleProps) => {
  return (
    <div
      data-slot="alert-title"
      className={cn('text-body font-bold text-heading', className)}
      {...props}
    />
  )
}

type AlertDescriptionProps = React.ComponentProps<'div'>

const AlertDescription = ({ className, ...props }: AlertDescriptionProps) => {
  return (
    <div
      data-slot="alert-description"
      className={cn('mt-0.5 text-body-sm text-default', className)}
      {...props}
    />
  )
}

type AlertActionProps = React.ComponentProps<'a'>

const AlertAction = ({ className, ...props }: AlertActionProps) => {
  return (
    <a
      data-slot="alert-action"
      className={cn(
        'ml-auto inline-flex items-center gap-1.25 self-center text-body-sm font-bold whitespace-nowrap text-link hover:underline [&_svg]:size-3.75 [&_svg]:flex-none',
        className,
      )}
      {...props}
    />
  )
}

export {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
  AlertAction,
  alertVariants,
}
