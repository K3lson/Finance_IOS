'use client'

import { useState, useMemo } from 'react'
import { Modal, Input, Button } from '@/components/ui'
import { createGoal } from '@/lib/actions/goals'
import {
  calcMonthsToGoal,
  requiredMonthlyContribution,
  formatCurrency,
  formatMonthDuration,
} from '@finance-app/core'
import type { SavingsGoal, GoalCategory } from '@finance-app/types'

const GOAL_CATEGORIES: { value: GoalCategory; label: string; emoji: string }[] = [
  { value: 'emergency_fund', label: 'Emergency Fund', emoji: '🚨' },
  { value: 'vacation', label: 'Vacation', emoji: '✈️' },
  { value: 'home', label: 'Home', emoji: '🏠' },
  { value: 'car', label: 'Car', emoji: '🚗' },
  { value: 'education', label: 'Education', emoji: '🎓' },
  { value: 'retirement', label: 'Retirement', emoji: '💰' },
  { value: 'wedding', label: 'Wedding', emoji: '💍' },
  { value: 'other', label: 'Other', emoji: '⭐' },
]

interface AddGoalModalProps {
  open: boolean
  onClose: () => void
  onCreated: (goal: SavingsGoal) => void
}

export function AddGoalModal({ open, onClose, onCreated }: AddGoalModalProps) {
  const [name, setName] = useState('')
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('other')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [monthlyContribution, setMonthlyContribution] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preview = useMemo(() => {
    const target = parseFloat(targetAmount) || 0
    const current = parseFloat(currentAmount) || 0
    const contribution = parseFloat(monthlyContribution) || 0
    if (target <= 0 || contribution <= 0) return null

    const mockGoal: SavingsGoal = {
      id: '',
      userId: '',
      name,
      goalCategory,
      targetAmount: target,
      currentAmount: current,
      targetDate: targetDate || undefined,
      monthlyContribution: contribution,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const months = calcMonthsToGoal(mockGoal)
    const required = requiredMonthlyContribution(mockGoal)

    return { months, required }
  }, [targetAmount, currentAmount, monthlyContribution, targetDate, name, goalCategory])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const target = parseFloat(targetAmount)
    if (!name || isNaN(target) || target <= 0) {
      setError('Name and target amount are required.')
      return
    }
    setLoading(true)
    const result = await createGoal({
      name,
      goalCategory,
      targetAmount: target,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || undefined,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
    })
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    // Optimistic: create a local goal object to pass back
    const optimisticGoal: SavingsGoal = {
      id: crypto.randomUUID(),
      userId: '',
      name,
      goalCategory,
      targetAmount: target,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || undefined,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onCreated(optimisticGoal)
    // Reset
    setName('')
    setGoalCategory('other')
    setTargetAmount('')
    setCurrentAmount('')
    setTargetDate('')
    setMonthlyContribution('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Create a savings goal" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Goal name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Emergency Fund"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">Category</label>
          <select
            value={goalCategory}
            onChange={e => setGoalCategory(e.target.value as GoalCategory)}
            className="w-full bg-surface-elevated border border-surface-border rounded-xl text-text-primary text-sm py-3 px-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
          >
            {GOAL_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Target amount"
            type="number"
            min="0"
            step="0.01"
            prefix="$"
            value={targetAmount}
            onChange={e => setTargetAmount(e.target.value)}
            placeholder="5000"
            required
          />
          <Input
            label="Already saved (optional)"
            type="number"
            min="0"
            step="0.01"
            prefix="$"
            value={currentAmount}
            onChange={e => setCurrentAmount(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Monthly contribution"
            type="number"
            min="0"
            step="0.01"
            prefix="$"
            value={monthlyContribution}
            onChange={e => setMonthlyContribution(e.target.value)}
            placeholder="200"
          />
          <Input
            label="Target date (optional)"
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
          />
        </div>

        {preview && (
          <div className="bg-surface-elevated border border-surface-border rounded-xl p-3 space-y-1">
            {isFinite(preview.months) && (
              <p className="text-sm text-text-secondary">
                At {formatCurrency(parseFloat(monthlyContribution) || 0)}/month, you&apos;ll reach your goal in{' '}
                <span className="text-brand font-semibold">{formatMonthDuration(preview.months)}</span>.
              </p>
            )}
            {preview.required !== null && targetDate && (
              <p className="text-sm text-warning">
                To hit your target date, you need{' '}
                <span className="font-semibold">{formatCurrency(preview.required)}/month</span>.
              </p>
            )}
          </div>
        )}

        {error && <p className="text-danger text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Create Goal
          </Button>
        </div>
      </form>
    </Modal>
  )
}
