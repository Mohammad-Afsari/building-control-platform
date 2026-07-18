'use client'

import { cn } from '@/src/lib/utils'
import { fieldDescribedBy, useField } from '@/src/components/ui/field'

type InputProps = React.ComponentProps<'input'>

const Input = ({
  className,
  type,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: InputProps) => {
  const field = useField()

  return (
    <input
      type={type}
      data-slot="input"
      id={id ?? field?.controlId}
      aria-describedby={fieldDescribedBy({
        field,
        userDescribedBy: ariaDescribedBy,
      })}
      aria-invalid={ariaInvalid ?? (field?.hasError ? true : undefined)}
      className={cn(
        'w-full rounded-sm border border-border-strong bg-card px-3.25 py-2.75 font-sans text-body text-heading shadow-sm transition-[border-color,box-shadow] duration-150 outline-none',
        'placeholder:text-faint',
        'not-disabled:hover:border-neutral-400',
        'focus:border-border-focus focus:ring-3 focus:ring-primary-50',
        'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-faint',
        'aria-invalid:border-destructive aria-invalid:focus:ring-destructive-bg',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
