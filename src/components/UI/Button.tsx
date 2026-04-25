import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size    = 'xs' | 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant
  size?:      Size
  loading?:   boolean
  children:   ReactNode
}

const VAR: Record<Variant, string> = {
  primary:   'bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-ink-900 border-transparent font-semibold',
  secondary: 'bg-transparent hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-200 border-ink-300 dark:border-ink-700',
  danger:    'bg-crimson-500 hover:bg-crimson-400 active:bg-crimson-600 text-white border-transparent',
  ghost:     'bg-transparent hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500 dark:text-ink-400 border-transparent',
}

const SZ: Record<Size, string> = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...rest }: Props) {
  return (
    <button
      className={`
        inline-flex items-center justify-center border rounded-md font-sans
        transition-all duration-150 select-none
        disabled:opacity-50 disabled:pointer-events-none
        ${VAR[variant]} ${SZ[size]} ${className}
      `}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner size="xs" />}
      {children}
    </button>
  )
}
