import { cn } from '@/src/lib/utils'

type LogoVariant = 'default' | 'reversed'

type LogoProps = {
  variant?: LogoVariant
  size?: number
  showWordmark?: boolean
  className?: string
}

const Logo = ({
  variant = 'default',
  size,
  showWordmark = true,
  className,
}: LogoProps) => {
  const markSize = size ?? (variant === 'reversed' ? 30 : 48)

  return (
    <span
      data-slot="logo"
      className={cn(
        'inline-flex items-center gap-3',
        variant === 'reversed' &&
          'rounded-md bg-linear-155 from-primary-600 to-primary-800 px-4 py-3.5',
        className,
      )}
    >
      <img
        src="/logo/building-control-logo.svg"
        alt={showWordmark ? '' : 'Building Control'}
        width={markSize}
        height={markSize}
        className="block"
      />
      {showWordmark && (
        /* 22px is the brand lockup size from the design system's logo
           card — deliberately between --text-h3 (19px) and --text-h2 (24px) */
        <span className="text-[22px] tracking-snug whitespace-nowrap">
          <span
            className={cn(
              'font-black text-heading',
              variant === 'reversed' && 'text-on-brand',
            )}
          >
            Building
          </span>
          {' '}
          <span
            className={cn(
              'font-semibold text-muted',
              variant === 'reversed' && 'text-on-brand opacity-72',
            )}
          >
            Control
          </span>
        </span>
      )}
    </span>
  )
}

export { Logo }
