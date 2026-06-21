'use client'

import { useState } from 'react'
import { Modal, Input, Button } from '@/components/ui'
import { CircularProgress } from '@/components/ui'
import { addContribution } from '@/lib/actions/goals'
import { goalProgress, formatCurrency } from '@finance-app/core'
import type { SavingsGoal } from '@finance-app/types'

interface ContributeModalProps {
  goal: SavingsGoal | null
  open: boolean
  onClose: () => void
  onContributed: (goalId: string, newAmount: number, isCompleted: boolean) => void
}

export function ContributeModal({ goal, open, onClose, onContributed }: ContributeModalProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!goal) return null

  const progress = goalProgress(goal)
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!goal) return
    setError(null)
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    setLoading(true)
    const result = await addContribution({
      goalId: goal.id,
      amount: amt,
      date,
      notes: notes || undefined,
    })
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onContributed(goal.id, result.newAmount ?? goal.currentAmount + amt, result.isCompleted ?? false)
    setAmount('')
    setNotes('')
    setDate(new Date().toISOString().split('T')[0])
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Add funds — ${goal.name}`} size="sm">
      <div className="flex items-center gap-4 mb-5 p-3 bg-surface-elevated rounded-xl">
        <CircularProgress
          value={progress}
          size={64}
          strokeWidth={6}
          color={progress >= 100 ? '#10b981' : '#6366f1'}
          label={`${Math.round(progress)}%`}
          animate={false}
        />
        <div>
          <p className="text-sm text-text-muted">Saved so far</p>
          <p className="text-lg font-bold text-text-primary">{formatCurrency(goal.currentAmount)}</p>
          <p className="text-xs text-text-muted">of {formatCurrency(goal.targetAmount)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          prefix="$"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder={goal.monthlyContribution > 0 ? String(goal.monthlyContribution) : '0.00'}
          required
          autoFocus
        />

        {remaining > 0 && (
          <p className="text-xs text-text-muted">
            {formatCurrency(remaining)} remaining to reach your goal.
          </p>
        )}

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Monthly transfer"
            rows={2}
            className="w-full bg-surface-elevated border border-surface-border rounded-xl text-text-primary text-sm py-3 px-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none placeholder:text-text-muted"
          />
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Add Funds
          </Button>
        </div>
      </form>
    </Modal>
  )
}
