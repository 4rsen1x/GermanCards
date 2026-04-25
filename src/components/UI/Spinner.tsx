interface Props { size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }

export function Spinner({ size = 'md', className = '' }: Props) {
  const sz = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' }
  return (
    <span
      className={`inline-block rounded-full border-2 border-current border-t-transparent animate-spin ${sz[size]} ${className}`}
      aria-label="Laden…"
    />
  )
}
