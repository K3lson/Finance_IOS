'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { GoalCard } from './GoalCard'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import type { SavingsGoal } from '@finance-app/types'

interface GoalGridProps {
  goals: SavingsGoal[]
  onContribute: (goal: SavingsGoal) => void
  onViewDetails: (goal: SavingsGoal) => void
  onDelete: (id: string) => void
  onAddGoal: () => void
  onGoalComplete: (goalName: string) => void
}

export function GoalGrid({
  goals,
  onContribute,
  onViewDetails,
  onDelete,
  onAddGoal,
  onGoalComplete,
}: GoalGridProps) {
  const activeGoals = goals.filter(g => !g.isCompleted)
  const completedGoals = goals.filter(g => g.isCompleted)

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-5xl">💰</div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-text-primary mb-1">No savings goals yet</h3>
          <p className="text-text-muted text-sm max-w-xs">
            Create your first savings goal to start tracking your progress toward what matters most.
          </p>
        </div>
        <Button onClick={onAddGoal} size="md">
          + Add Your First Goal
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {activeGoals.length > 0 && (
        <div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {activeGoals.map(goal => (
              <motion.div key={goal.id} variants={fadeInUp}>
                <GoalCard
                  goal={goal}
                  onContribute={onContribute}
                  onViewDetails={onViewDetails}
                  onDelete={onDelete}
                  onComplete={() => onGoalComplete(goal.name)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Completed Goals
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {completedGoals.map(goal => (
              <motion.div key={goal.id} variants={fadeInUp}>
                <GoalCard
                  goal={goal}
                  onContribute={onContribute}
                  onViewDetails={onViewDetails}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  )
}
