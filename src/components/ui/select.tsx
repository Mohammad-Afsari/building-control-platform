'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { fieldDescribedBy, useField } from '@/src/components/ui/field'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger>

const SelectTrigger = ({
  className,
  children,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: SelectTriggerProps) => {
  const field = useField()

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      id={id ?? field?.controlId}
      aria-describedby={fieldDescribedBy({
        field,
        userDescribedBy: ariaDescribedBy,
      })}
      aria-invalid={ariaInvalid ?? (field?.hasError ? true : undefined)}
      className={cn(
        'flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm border border-border-strong bg-card px-3.25 py-2.75 font-sans text-body text-heading shadow-sm transition-[border-color,box-shadow] duration-150 outline-none',
        'not-disabled:hover:border-neutral-400',
        'focus:border-border-focus focus:ring-3 focus:ring-primary-50',
        'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-faint',
        'aria-invalid:border-destructive aria-invalid:focus:ring-destructive-bg',
        'data-[placeholder]:text-faint',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className="size-4.25 flex-none text-muted"
          aria-hidden="true"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Content>

const SelectContent = ({
  className,
  children,
  position = 'popper',
  ...props
}: SelectContentProps) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'relative z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-x-hidden overflow-y-auto rounded-md border border-border bg-card text-heading shadow-lg',
          position === 'popper' && 'translate-y-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex cursor-pointer items-center justify-center py-1 text-muted">
          <ChevronUp className="size-4" aria-hidden="true" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1.25">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex cursor-pointer items-center justify-center py-1 text-muted">
          <ChevronDown className="size-4" aria-hidden="true" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

type SelectLabelProps = React.ComponentProps<typeof SelectPrimitive.Label>

const SelectLabel = ({ className, ...props }: SelectLabelProps) => {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        'px-2.25 py-1.5 text-caption font-bold tracking-wide text-faint uppercase',
        className,
      )}
      {...props}
    />
  )
}

type SelectItemProps = React.ComponentProps<typeof SelectPrimitive.Item>

const SelectItem = ({ className, children, ...props }: SelectItemProps) => {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex w-full cursor-pointer items-center gap-2 rounded-xs py-2 pr-8 pl-2.25 font-sans text-body text-heading outline-none select-none',
        'focus:bg-raised focus:text-heading',
        'data-[state=checked]:font-semibold',
        'data-disabled:pointer-events-none data-disabled:text-faint',
        className,
      )}
      {...props}
    >
      <span className="absolute right-2.25 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4 text-primary" aria-hidden="true" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

type SelectSeparatorProps = React.ComponentProps<
  typeof SelectPrimitive.Separator
>

const SelectSeparator = ({ className, ...props }: SelectSeparatorProps) => {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('-mx-1.25 my-1.25 h-px bg-border', className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
