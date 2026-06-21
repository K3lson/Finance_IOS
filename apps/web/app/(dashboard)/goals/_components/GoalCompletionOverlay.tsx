'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo } from 'react'

interface GoalCompletionOverlayProps {
  goalName: string
  onDismiss: () => void
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#8b5cf6', '#f97316']

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function GoalCompletionOverlay({ goalName, onDismiss }: GoalCompletionOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const particles = useMemo(() =>
    Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * 2 * Math.PI + randomBetween(-0.3, 0.3)
      const distance = randomBetween(80, 220)
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: COLORS[i % COLORS.length],
        size: randomBetween(6, 12),
        delay: randomBetween(0, 0.3),
      }
    }), [])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onDismiss}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <div className="relative flex flex-col items-center gap-4">
          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.7, delay: p.delay, ease: 'easeOut' }}
            />
          ))}

          {/* Checkmark circle */}
          <motion.div
            className="w-24 h-24 rounded-full bg-success flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <motion.path
                d="M8 20l8 8 16-16"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              />
            </svg>
          </motion.div>

          {/* Text */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <div className="text-3xl font-bold text-white mb-1">Goal Achieved! 🎉</div>
            <div className="text-text-secondary text-lg">{goalName}</div>
            <div className="text-text-muted text-sm mt-3">Tap anywhere to continue</div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
