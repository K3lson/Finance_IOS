'use client'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  animate?: boolean
}

export function Card({ children, className = '', hoverable = false, animate = false }: CardProps) {
  const base = `bg-surface-card border border-surface-border rounded-2xl p-6 ${className}`

  if (hoverable || animate) {
    return (
      <motion.div
        className={base}
        initial={animate ? { opacity: 0, y: 8 } : undefined}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={animate ? { duration: 0.2, ease: 'easeOut' } : undefined}
        whileHover={
          hoverable
            ? { y: -2, boxShadow: '0 8px 32px rgba(99,102,241,0.1)' }
            : undefined
        }
      >
        {children}
      </motion.div>
    )
  }

  return <div className={base}>{children}</div>
}
