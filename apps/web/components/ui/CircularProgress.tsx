'use client'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
  animate?: boolean
  onComplete?: () => void
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  color = '#6366f1',
  label,
  sublabel,
  animate: shouldAnimate = true,
  onComplete,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const motionPct = useMotionValue(shouldAnimate ? 0 : clamped)
  const dashOffset = useTransform(motionPct, (v) => circumference * (1 - v / 100))
  const hasRun = useRef(false)
  const hasCompleted = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    if (!shouldAnimate) return
    const controls = animate(motionPct, clamped, {
      duration: 0.9,
      ease: 'easeOut',
      onComplete: () => {
        if (clamped >= 100 && !hasCompleted.current) {
          hasCompleted.current = true
          onComplete?.()
        }
      },
    })
    return controls.stop
  }, [motionPct, clamped, shouldAnimate, onComplete])

  const isComplete = clamped >= 100

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2a2a3a"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      {isComplete && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />
      )}
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label && (
            <span className="text-text-primary font-bold" style={{ fontSize: size * 0.18 }}>
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-text-muted" style={{ fontSize: size * 0.12 }}>
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
