'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '@/src/lib/utils'

type FieldContextValue = {
  controlId: string
  hintId: string
  errorId: string
  hasHint: boolean
  hasError: boolean
  registerHint: () => () => void
  registerError: () => () => void
}

const FieldContext = createContext<FieldContextValue | null>(null)

/** Form controls (Input, SelectTrigger) call this to pick up the
    surrounding Field's id, aria-describedby and aria-invalid wiring. */
const useField = () => useContext(FieldContext)

type FieldDescribedByParams = {
  field: FieldContextValue | null
  userDescribedBy?: string
}

const fieldDescribedBy = ({
  field,
  userDescribedBy,
}: FieldDescribedByParams) => {
  const ids = [
    userDescribedBy,
    field?.hasHint ? field.hintId : undefined,
    field?.hasError ? field.errorId : undefined,
  ].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}

type FieldProps = React.ComponentProps<'div'>

const Field = ({ className, ...props }: FieldProps) => {
  const baseId = useId()
  /* counted (not boolean) so one of two same-type children
     unmounting doesn't clobber the other's registration */
  const [hintCount, setHintCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)

  const registerHint = useCallback(() => {
    setHintCount((count) => count + 1)
    return () => setHintCount((count) => count - 1)
  }, [])

  const registerError = useCallback(() => {
    setErrorCount((count) => count + 1)
    return () => setErrorCount((count) => count - 1)
  }, [])

  const value = useMemo(
    () => ({
      controlId: `${baseId}-control`,
      hintId: `${baseId}-hint`,
      errorId: `${baseId}-error`,
      hasHint: hintCount > 0,
      hasError: errorCount > 0,
      registerHint,
      registerError,
    }),
    [baseId, hintCount, errorCount, registerHint, registerError],
  )

  return (
    <FieldContext.Provider value={value}>
      <div
        data-slot="field"
        className={cn('flex flex-col gap-1.75', className)}
        {...props}
      />
    </FieldContext.Provider>
  )
}

type FieldLabelProps = React.ComponentProps<'label'>

const FieldLabel = ({ className, htmlFor, ...props }: FieldLabelProps) => {
  const field = useField()
  return (
    <label
      data-slot="field-label"
      htmlFor={htmlFor ?? field?.controlId}
      className={cn('text-body-sm font-semibold text-heading', className)}
      {...props}
    />
  )
}

type FieldLabelHintProps = React.ComponentProps<'span'>

const FieldLabelHint = ({ className, ...props }: FieldLabelHintProps) => {
  return (
    <span
      data-slot="field-label-hint"
      className={cn('font-medium text-faint', className)}
      {...props}
    />
  )
}

type FieldHintProps = React.ComponentProps<'span'>

const FieldHint = ({ className, id, ...props }: FieldHintProps) => {
  const field = useField()
  const registerHint = field?.registerHint

  useEffect(() => registerHint?.(), [registerHint])

  return (
    <span
      data-slot="field-hint"
      id={id ?? field?.hintId}
      className={cn('text-caption text-muted', className)}
      {...props}
    />
  )
}

type FieldErrorProps = React.ComponentProps<'span'>

const FieldError = ({ className, id, children, ...props }: FieldErrorProps) => {
  const field = useField()
  const registerError = field?.registerError

  useEffect(() => registerError?.(), [registerError])

  return (
    <span
      data-slot="field-error"
      id={id ?? field?.errorId}
      role="alert"
      className={cn(
        'flex items-center gap-1.5 text-caption font-semibold text-destructive [&_svg]:size-3.5 [&_svg]:flex-none',
        className,
      )}
      {...props}
    >
      <CircleAlert aria-hidden="true" />
      {children}
    </span>
  )
}

export {
  Field,
  FieldLabel,
  FieldLabelHint,
  FieldHint,
  FieldError,
  useField,
  fieldDescribedBy,
}
