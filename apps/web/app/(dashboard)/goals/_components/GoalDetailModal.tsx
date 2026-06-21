'use client'

import { useState, useEffect } from 'react'
import { Modal, Button, CircularProgress, Badge } from '@/components/ui'
import { getContributions } from '@/lib/data/goals'
import { updateGoalContribution } from '@/lib/actions/goals'
import {
  goalProgress,
  projectedCompletionDate,
  requiredMonthlyContribution,
  calcMonthsToGoal,
  formatCurrency,
  formatMonthYear,
  formatMonthDuration,
} from '@finance-app/core'
import type { SavingsGoal, SavingsContribution } from '@finance-app/types'

interface GoalDetailModalProps {
  goal: SavingsGoal | null
  open: boolean
  onClose: () => void
  onUpdated: (goalId: string, monthlyContribution: number) => void
}

export function GoalDetailModal({ goal, open, onClose, onUpdated }: GoalDetailModalProps) {
  const [contributions, setContributions] = useState<SavingsContribution[]>([])
  const [loadingContribs, setLoadingContribs] = useState(false)
  const [editingContrib, setEditingContrib] = useState(false)
  const [newContrib, setNewContrib] = useState('')
  const [savingContrib, setSavingContrib] = useState(false)

  useEffect(() => {
    if (!goal || !open) return
    setLoadingContribs(true)
    setNewContrib(String(goal.monthlyContribution))

    // Client-side fetch using server data function won't work here — use supabase client directly
    // We rely on server action pattern: use the data fetcher but call it via a route or pass data from parent
    // For simplicity: fetch via the goals data function (this is a server function, can't call from client)
    // We instead fetch using a fetch() call to avoid the server/client boundary issue
    // Since getContributions is a server function, we expose data via a route or accept contributions as props
    // For now: fetch contributions directly from supabase in client using dynamic import
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase
        .from('savings_contributions')
        .select('*')
        .eq('goal_id', goal.id)
        .order('date', { ascending: false })
        .then(({ data }) => {
          if (data) {
            setContributions(data.map(row => ({
              id: row.id as string,
              goalId: row.goal_id as string,
              userId: row.user_id as string,
              amount: Number(row.amount),
              date: row.date as string,
              notes: row.notes as string | undefined,
              createdAt: row.created_at as string,
            })))
          }
          setLoadingContribs(false)
        })
    })
  }, [goal, open])

  if (!goal) return null

  const progress = goalProgress(goal)
  const projected = projectedCompletionDate(goal)
  const required = requiredMonthlyContribution(goal)
  const months = calcMonthsToGoal(goal)
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

  const isOnTrack = required !== null && goal.monthlyContribution >= required

  async function handleSaveContrib() {
    if (!goal) return
    const val = parseFloat(newContrib)
    if (isNaN(val) || val < 0) return
    setSavingContrib(true)
    await updateGoalContribution(goal.id, val)
    setSavingContrib(false)
    setEditingContrib(false)
    onUpdated(goal.id, val)
  }

  return (
    <Modal open={open} onClose={onClose} title={goal.name} size="lg">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Header: progress + stats */}
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <CircularProgress
            value={progress}
            size={140}
            strokeWidth={10}
            color={progress >= 100 ? '#10b981' : '#6366f1'}
            label={`${Math.round(progress)}%`}
            sublabel="complete"
            animate
          />
          <div className="grid grid-cols-2 gap-3 flex-1 w-full">
            <div className="bg-surface-elevated rounded-xl p-3">
              <p className="text-xs text-text-muted mb-0.5">Target</p>
              <p className="text-base font-bold text-text-primary">{formatCurrency(goal.targetAmount)}</p>
            </div>
            <div className="bg-surface-elevated rounded-xl p-3">
              <p className="text-xs text-text-muted mb-0.5">Saved</p>
              <p className="text-base font-bold text-success">{formatCurrency(goal.currentAmount)}</p>
            </div>
            <div className="bg-surface-elevated rounded-xl p-3">
              <p className="text-xs text-text-muted mb-0.5">Remaining</p>
              <p className="text-base font-bold text-text-primary">{formatCurrency(remaining)}</p>
            </div>
            <div className="bg-surface-elevated rounded-xl p-3">
              <p className="text-xs text-text-muted mb-0.5">Monthly</p>
              {editingContrib ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={newContrib}
                    onChange={e => setNewContrib(e.target.value)}
                    className="w-full bg-transparent text-text-primary text-sm border-b border-brand outline-none"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveContrib() }}
                  />
                  <button
                    onClick={handleSaveContrib}
                    disabled={savingContrib}
                    className="text-xs text-brand hover:text-brand-light"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingContrib(true)}
                  className="text-base font-bold text-text-primary hover:text-brand transition-colors text-left"
                >
                  {formatCurrency(goal.monthlyContribution)}/mo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Projection / deadline */}
        {!goal.isCompleted && (
          <div className="bg-surface-elevated rounded-xl p-4 space-y-2">
            {projected && isFinite(months) && (
              <p className="text-sm text-text-secondary">
                Projected completion:{' '}
                <span className="text-text-primary font-semibold">{formatMonthYear(projected)}</span>
                {' '}({formatMonthDuration(months)} from now)
              </p>
            )}
            {!projected && goal.monthlyContribution <= 0 && (
              <p className="text-sm text-text-muted">Set a monthly contribution to see your projection.</p>
            )}
            {goal.targetDate && (
              <div className="flex items-center gap-2">
                <Badge variant={isOnTrack ? 'success' : 'warning'}>
                  {isOnTrack ? 'On track' : 'Behind target'}
                </Badge>
                {!isOnTrack && required !== null && (
                  <span className="text-xs text-warning">
                    Need {formatCurrency(required)}/month to hit {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            )}
            {goal.isCompleted && goal.completedAt && (
              <p className="text-sm text-success font-semibold">
                Completed on {new Date(goal.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        )}

        {/* Contribution history */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Contribution History</h3>
          {loadingContribs ? (
            <p className="text-sm text-text-muted">Loading...</p>
          ) : contributions.length === 0 ? (
            <p className="text-sm text-text-muted">No contributions yet.</p>
          ) : (
            <div className="space-y-2">
              {contributions.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-surface-elevated rounded-xl px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{formatCurrency(c.amount)}</p>
                    {c.notes && <p className="text-xs text-text-muted">{c.notes}</p>}
                  </div>
                  <p className="text-xs text-text-muted">
                    {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button variant="ghost" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </Modal>
  )
}
