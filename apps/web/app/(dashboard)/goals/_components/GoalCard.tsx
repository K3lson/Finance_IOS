'use client'

import { motion } from 'framer-motion'
import { CircularProgress, Button, Badge } from '@/components/ui'
import {
  goalProgress,
  projectedCompletionDate,
  formatCurrency,
  formatMonthYear,
} from '@finance-app/core'
import type { SavingsGoal, GoalCategory } from '@finance-app/types'

const GOAL_CATEGORY_EMOJIS: Record<GoalCategory, string> = {
  emergency_fund: '🚨',
  vacation: '✈️',
  home: '🏠',
  car: '🚗',
  education: '🎓',
  retirement: '💰',
  wedding: '💍',
  other: '⭐',
}

const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  emergency_fund: 'Emergency Fund',
  vacation: 'Vacation',
  home: 'Home',
  car: 'Car',
  education: 'Education',
  retirement: 'Retirement',
  wedding: 'Wedding',
  other: 'Other',
}

interface GoalCardProps {
  goal: SavingsGoal
  onContribute: (goal: SavingsGoal) => void
  onViewDetails: (goal: SavingsGoal) => void
  onDelete: (id: string) => void
  onComplete?: () => void
}

export function GoalCard({ goal, onContribute, onViewDetails, onDelete, onComplete }: GoalCardProps) {
  const progress = goalProgress(goal)
  const projected = projectedCompletionDate(goal)

  const isCompleted = goal.isCompleted || progress >= 100
  const progressColor = isCompleted ? '#10b981' : '#6366f1'

  const isBehind = goal.targetDate
    ? (() => {
        const target = new Date(goal.targetDate)
        const now = new Date()
        if (target <= now) return true
        const monthsLeft =
          (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
        const remaining = goal.targetAmount - goal.currentAmount
        const needed = monthsLeft > 0 ? remaining / monthsLeft : Infinity
        return goal.monthlyContribution < needed
      })()
    : false

  return (
    <motion.div
      className={[
        'bg-surface-card border border-surface-border rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden',
        isCompleted ? 'opacity-80' : '',
      ].join(' ')}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(99,102,241,0.08)' }}
      transition={{ duration: 0.15 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-2xl">{GOAL_CATEGORY_EMOJIS[goal.goalCategory]}</span>
          <p className="text-xs text-text-muted mt-0.5">{GOAL_CATEGORY_LABELS[goal.goalCategory]}</p>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-text-muted hover:text-danger transition-colors p-1 rounded"
          aria-label="Delete goal"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 3h12M5 3V2h4v1M3 3l1 9h6l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Goal name */}
      <h3 className="font-bold text-text-primary text-sm leading-tight line-clamp-2">{goal.name}</h3>

      {/* Circular progress */}
      <div className="flex justify-center relative">
        <CircularProgress
          value={progress}
          size={100}
          strokeWidth={7}
          color={progressColor}
          label={isCompleted ? '✓' : `${Math.round(progress)}%`}
          sublabel={isCompleted ? 'Done!' : undefined}
          animate
          onComplete={onComplete}
        />
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs text-success font-bold bg-surface-card px-2 py-0.5 rounded-full border border-success/30 mt-16">
              Completed! 🎉
            </span>
          </div>
        )}
      </div>

      {/* Amounts */}
      <div className="text-center">
        <p className="text-base font-bold text-text-primary">
          {formatCurrency(goal.currentAmount)}
          <span className="text-text-muted font-normal text-sm"> / {formatCurrency(goal.targetAmount)}</span>
        </p>
      </div>

      {/* Projection / status */}
      <div className="text-center min-h-[36px]">
        {isCompleted && goal.completedAt ? (
          <Badge variant="success" size="sm">
            Achieved {new Date(goal.completedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </Badge>
        ) : projected ? (
          <p className={`text-xs ${isBehind ? 'text-warning' : 'text-text-muted'}`}>
            {isBehind ? '⚠️ Behind — ' : 'On track for '}
            {formatMonthYear(projected)}
          </p>
        ) : goal.monthlyContribution <= 0 ? (
          <p className="text-xs text-text-muted">Set a monthly contribution</p>
        ) : null}
      </div>

      {/* Monthly contribution badge */}
      {goal.monthlyContribution > 0 && !isCompleted && (
        <div className="flex justify-center">
          <span className="text-xs bg-brand-muted text-brand-light px-2 py-1 rounded-full font-medium">
            {formatCurrency(goal.monthlyContribution)} / month
          </span>
        </div>
      )}

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onContribute(goal)}
            className="flex-1"
          >
            Add Funds
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(goal)}
            className="flex-1"
          >
            Details
          </Button>
        </div>
      )}
      {isCompleted && (
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(goal)} className="w-full">
          View History
        </Button>
      )}
    </motion.div>
  )
}
