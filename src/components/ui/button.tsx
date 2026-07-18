import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/src/lib/utils'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent font-sans text-body leading-none font-bold tracking-normal transition-[background-color,border-color,color,box-shadow,transform] duration-150 outline-none select-none focus-visible:ring-3 active:translate-y-px disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-45 disabled:shadow-none [&_svg]:size-4.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-on-primary shadow-primary hover:bg-primary-hover focus-visible:ring-primary-100 active:bg-primary-press',
        secondary:
          'border-border-strong bg-card text-heading shadow-sm hover:border-neutral-400 hover:bg-raised focus-visible:ring-primary-100 active:bg-sunken',
        ghost:
          'bg-transparent text-default hover:bg-sunken hover:text-heading focus-visible:ring-primary-100 active:bg-neutral-200',
        destructive:
          'bg-destructive text-on-brand shadow-destructive hover:bg-destructive-hover focus-visible:ring-destructive-bg active:bg-destructive-press',
      },
      size: {
        sm: 'rounded-sm px-3.25 py-2 text-body-sm [&_svg]:size-4',
        default: 'px-4.5 py-3',
        lg: 'px-5.5 py-3.5 text-body-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = ({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
