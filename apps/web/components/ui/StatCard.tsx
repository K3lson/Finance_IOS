'use client'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface StatCardProps {
  label: string
  value: string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  animate?: boolean
}

function AnimatedValue({ raw, formatted }: { raw: number; formatted: string }) {
  const motionVal = useMotionValue(0)
  const display = useTransform(motionVal, (v) => {
    const prefix = formatted.match(/^[^0-9-]*/)?.[0] ?? ''
    const suffix = formatted.match(/[^0-9.]+$/)?.[0] ?? ''
    return `${prefix}${v.toFixed(2)}${suffix}`
  })
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    const controls = animate(motionVal, raw, { duration: 0.8, ease: 'easeOut' })
    return controls.stop
  }, [motionVal, raw])

  return <motion.span>{display}</motion.span>
}

export function StatCard({ label, value, change, trend, icon, animate: shouldAnimate = false }: StatCardProps) {
  const numeric = parseFloat(value.replace(/[^0-9.-]/g, ''))
  const isNumeric = !isNaN(numeric)

  const changeColor =
    change === undefined
      ? ''
      : change > 0
      ? 'text-success bg-success-muted'
      : change < 0
      ? 'text-danger bg-danger-muted'
      : 'text-text-muted bg-surface-elevated'

  const arrow =
    trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''

  return (
    <motion.div
      className="bg-surface-card border border-surface-border rounded-2xl p-6 flex flex-col gap-3"
      initial={shouldAnimate ? { opacity: 0, y: 8 } : undefined}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-text-primary">
        {shouldAnimate && isNumeric ? (
          <AnimatedValue raw={numeric} formatted={value} />
        ) : (
          value
        )}
      </div>
      {change !== undefined && (
        <span
          className={[
            'self-start text-xs font-semibold px-2 py-0.5 rounded-full',
            changeColor,
          ].join(' ')}
        >
          {arrow} {Math.abs(change).toFixed(1)}%
        </span>
      )}
    </motion.div>
  )
}
