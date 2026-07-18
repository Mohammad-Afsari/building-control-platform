import { cn } from '@/src/lib/utils'

type CardProps = React.ComponentProps<'div'> & {
  interactive?: boolean
}

const Card = ({ className, interactive = false, ...props }: CardProps) => {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col rounded-lg border border-border bg-card p-5.5 pb-5 shadow-sm',
        interactive &&
          'transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg',
        className,
      )}
      {...props}
    />
  )
}

type CardHeaderProps = React.ComponentProps<'div'>

const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'mb-4 flex flex-wrap items-center justify-between gap-3',
        className,
      )}
      {...props}
    />
  )
}

type CardTitleProps = React.ComponentProps<'div'>

const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'text-h3 leading-snug font-bold tracking-snug text-heading',
        className,
      )}
      {...props}
    />
  )
}

type CardDescriptionProps = React.ComponentProps<'div'>

const CardDescription = ({ className, ...props }: CardDescriptionProps) => {
  return (
    <div
      data-slot="card-description"
      className={cn(
        'mt-1.75 flex flex-wrap items-center gap-2.5 text-body-sm font-medium text-muted',
        className,
      )}
      {...props}
    />
  )
}

type CardContentProps = React.ComponentProps<'div'>

const CardContent = ({ className, ...props }: CardContentProps) => {
  return (
    <div data-slot="card-content" className={cn(className)} {...props} />
  )
}

type CardFooterProps = React.ComponentProps<'div'>

const CardFooter = ({ className, ...props }: CardFooterProps) => {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'mt-auto flex items-center justify-between gap-3 pt-1',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
}
