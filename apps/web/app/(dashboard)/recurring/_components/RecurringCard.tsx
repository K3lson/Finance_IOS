'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { RecurringPayment } from '@finance-app/types'
import { toMonthlyRecurringCost, formatCurrency } from '@finance-app/core'
import { Badge } from '@/components/ui'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants/categories'
import { toggleRecurringPayment, deleteRecurringPayment } from '@/lib/actions/recurring'

const FREQUENCY_LABELS: Record<RecurringPayment['frequency'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  annual: 'Annual',
}

function getDaysUntilDue(nextDueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(nextDueDate)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDueDate(nextDueDate: string): string {
  const date = new Date(nextDueDate)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDueDateColor(days: number): string {
  if (days < 0) return 'text-danger'
  if (days <= 7) return 'text-danger'
  if (days <= 14) return 'text-warning'
  return 'text-text-muted'
}

interface RecurringCardProps {
  payment: RecurringPayment
  onToggle: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
  onError: (msg: string) => void
}

export function RecurringCard({ payment, onToggle, onDelete, onError }: RecurringCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const monthlyCost = toMonthlyRecurringCost(payment)
  const daysUntil = getDaysUntilDue(payment.nextDueDate)
  const dueDateColor = getDueDateColor(daysUntil)
  const categoryColor = CATEGORY_COLORS[payment.category]

  async function handleToggle() {
    setToggling(true)
    onToggle(payment.id, !payment.isActive)
    const result = await toggleRecurringPayment(payment.id, !payment.isActive)
    if (result.error) {
      onToggle(payment.id, payment.isActive)
      onError(result.error)
    }
    setToggling(false)
  }

  async function handleDelete() {
    setDeleting(true)
    onDelete(payment.id)
    const result = await deleteRecurringPayment(payment.id)
    if (result.error) {
      onError(result.error)
      setDeleting(false)
    }
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={[
        'bg-surface-card border border-surface-border rounded-2xl p-4 flex items-center gap-4 transition-opacity',
        !payment.isActive ? 'opacity-50' : '',
      ].join(' ')}
    >
      {/* Category dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: categoryColor }}
      />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-primary font-semibold text-sm truncate">{payment.name}</span>
          {!payment.isActive && (
            <Badge variant="warning" size="sm">Paused</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-xs text-text-muted">{CATEGORY_LABELS[payment.category]}</span>
          <span className="text-xs text-text-muted">·</span>
          <span className="text-xs text-text-muted">{FREQUENCY_LABELS[payment.frequency]}</span>
          <span className="text-xs text-text-muted">·</span>
          <span className={`text-xs font-medium ${dueDateColor}`}>
            Due {formatDueDate(payment.nextDueDate)}
            {daysUntil < 0 ? ' (Overdue)' : daysUntil === 0 ? ' (Today)' : ` (in ${daysUntil}d)`}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-text-primary font-semibold text-sm">{formatCurrency(payment.amount)}</p>
        {payment.frequency !== 'monthly' && (
          <p className="text-xs text-text-muted">{formatCurrency(monthlyCost)}/mo</p>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        aria-label={payment.isActive ? 'Pause payment' : 'Resume payment'}
        className={[
          'relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
          payment.isActive ? 'bg-brand' : 'bg-surface-border',
          toggling ? 'opacity-50' : '',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
            payment.isActive ? 'translate-x-4' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>

      {/* Delete */}
      {confirmDelete ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-danger font-medium hover:underline disabled:opacity-50"
          >
            {deleting ? '...' : 'Yes'}
          </button>
          <span className="text-text-muted text-xs">/</span>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-xs text-text-muted hover:underline"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-text-muted hover:text-danger transition-colors flex-shrink-0"
          aria-label="Delete payment"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M1 3.5h13M5 3.5V2h5v1.5M6 6.5v5M9 6.5v5M2.5 3.5l.8 9.5a1 1 0 0 0 1 .5h6.4a1 1 0 0 0 1-.5l.8-9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </motion.div>
  )
}
