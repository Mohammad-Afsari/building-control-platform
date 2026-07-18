import { Check } from 'lucide-react'
import { cn } from '@/src/lib/utils'

type CheckboxProps = React.ComponentProps<'input'>

const Checkbox = ({
  className,
  'aria-invalid': ariaInvalid,
  ...props
}: CheckboxProps) => {
  return (
    <span className={cn('relative inline-grid', className)}>
      <input
        type="checkbox"
        data-slot="checkbox"
        aria-invalid={ariaInvalid}
        className="peer absolute inset-0 size-full cursor-pointer opacity-0"
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          'grid size-5 place-items-center rounded-xs border-[1.5px] border-border-strong bg-card text-on-primary transition-[background-color,border-color] duration-150',
          'peer-checked:border-primary peer-checked:bg-primary',
          'peer-focus-visible:border-border-focus peer-focus-visible:ring-3 peer-focus-visible:ring-primary-50',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-45',
          '[&>svg]:size-3.25 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100',
          ariaInvalid ? 'border-destructive' : undefined,
        )}
      >
        <Check strokeWidth={3.2} />
      </span>
    </span>
  )
}

export { Checkbox }
