'use client'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  color?: 'brand' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animate?: boolean
}

const colorClasses: Record<string, string> = {
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  color = 'brand',
  size = 'md',
  showLabel = false,
  animate: shouldAnimate = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <div className="flex justify-between text-xs text-text-muted">
          <span>Progress</span>
          <span>{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className={['w-full bg-surface-elevated rounded-full overflow-hidden', sizeClasses[size]].join(' ')}>
        <motion.div
          className={['h-full rounded-full', colorClasses[color]].join(' ')}
          initial={{ width: shouldAnimate ? '0%' : `${clamped}%` }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
