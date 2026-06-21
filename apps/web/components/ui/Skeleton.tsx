interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className = '', lines }: SkeletonProps) {
  const shimmerClasses =
    'bg-gradient-to-r from-surface-card via-surface-hover to-surface-card bg-[length:200%_100%] animate-shimmer rounded-lg'

  if (lines && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={[
              shimmerClasses,
              'h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full',
            ].join(' ')}
          />
        ))}
      </div>
    )
  }

  return <div className={[shimmerClasses, 'h-4 w-full', className].join(' ')} />
}
