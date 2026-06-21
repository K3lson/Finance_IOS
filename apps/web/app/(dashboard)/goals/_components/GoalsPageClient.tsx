'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { StatCard, Button } from '@/components/ui'
import { deleteGoal } from '@/lib/actions/goals'
import { calcTotalSavedAcrossGoals, formatCurrency } from '@finance-app/core'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import type { SavingsGoal } from '@finance-app/types'
import { GoalGrid } from './GoalGrid'
import { AddGoalModal } from './AddGoalModal'
import { ContributeModal } from './ContributeModal'
import { GoalDetailModal } from './GoalDetailModal'
import { GoalCompletionOverlay } from './GoalCompletionOverlay'

const DISMISSED_KEY = 'completedGoalsDismissed'

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? '[]')
  } catch {
    return []
  }
}

function markDismissed(id: string) {
  try {
    const current = getDismissed()
    const set = new Set(current)
    set.add(id)
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(set)))
  } catch {
    // ignore
  }
}

interface GoalsPageClientProps {
  initialGoals: SavingsGoal[]
}

export function GoalsPageClient({ initialGoals }: GoalsPageClientProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null)
  const [detailGoal, setDetailGoal] = useState<SavingsGoal | null>(null)
  const [celebrationGoal, setCelebrationGoal] = useState<string | null>(null)

  // On mount: check for already-completed goals that haven't been dismissed
  useEffect(() => {
    const dismissed = getDismissed()
    const undismissed = goals.find(g => g.isCompleted && !dismissed.includes(g.id))
    if (undismissed) {
      setCelebrationGoal(undismissed.name)
      markDismissed(undismissed.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalSaved = calcTotalSavedAcrossGoals(goals)
  const activeCount = goals.filter(g => !g.isCompleted).length
  const completedCount = goals.filter(g => g.isCompleted).length

  function handleCreated(goal: SavingsGoal) {
    setGoals(prev => [goal, ...prev])
  }

  function handleContributed(goalId: string, newAmount: number, isCompleted: boolean) {
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? {
              ...g,
              currentAmount: newAmount,
              isCompleted,
              completedAt: isCompleted ? new Date().toISOString() : g.completedAt,
            }
          : g
      )
    )
    if (isCompleted) {
      const goal = goals.find(g => g.id === goalId)
      if (goal) {
        markDismissed(goalId)
        setCelebrationGoal(goal.name)
      }
    }
  }

  async function handleDelete(id: string) {
    setGoals(prev => prev.filter(g => g.id !== id))
    await deleteGoal(id)
  }

  function handleGoalComplete(goalName: string) {
    const goal = goals.find(g => g.name === goalName)
    if (!goal) return
    const dismissed = getDismissed()
    if (!dismissed.includes(goal.id)) {
      markDismissed(goal.id)
      setCelebrationGoal(goalName)
    }
  }

  function handleUpdated(goalId: string, monthlyContribution: number) {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, monthlyContribution } : g))
  }

  return (
    <div className="space-y-6">
      {/* Completion overlay */}
      {celebrationGoal && (
        <GoalCompletionOverlay
          goalName={celebrationGoal}
          onDismiss={() => setCelebrationGoal(null)}
        />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Savings Goals</h1>
        <Button onClick={() => setAddModalOpen(true)}>+ Add Goal</Button>
      </div>

      {/* Summary stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={fadeInUp}>
          <StatCard label="Total Saved" value={formatCurrency(totalSaved)} animate />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard label="Active Goals" value={String(activeCount)} />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard label="Completed" value={String(completedCount)} />
        </motion.div>
      </motion.div>

      {/* Goal grid */}
      <GoalGrid
        goals={goals}
        onContribute={goal => setContributeGoal(goal)}
        onViewDetails={goal => setDetailGoal(goal)}
        onDelete={handleDelete}
        onAddGoal={() => setAddModalOpen(true)}
        onGoalComplete={handleGoalComplete}
      />

      {/* Modals */}
      <AddGoalModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={handleCreated}
      />

      <ContributeModal
        goal={contributeGoal}
        open={contributeGoal !== null}
        onClose={() => setContributeGoal(null)}
        onContributed={handleContributed}
      />

      <GoalDetailModal
        goal={detailGoal}
        open={detailGoal !== null}
        onClose={() => setDetailGoal(null)}
        onUpdated={handleUpdated}
      />
    </div>
  )
}
