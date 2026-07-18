'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { Input } from '@/src/components/ui/input'

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'>

/** Input with a show/hide visibility toggle, per the auth designs. */
const PasswordInput = ({ className, ...props }: PasswordInputProps) => {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        className={cn('pr-11', className)}
        {...props}
      />
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow((current) => !current)}
        className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-xs text-faint transition-[background-color,color] duration-150 hover:bg-sunken hover:text-default [&_svg]:size-4.25"
      >
        {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </button>
    </div>
  )
}

export { PasswordInput }
