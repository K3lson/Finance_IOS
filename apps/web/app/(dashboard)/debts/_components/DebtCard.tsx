'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, ProgressBar, Button, Input } from '@/components/ui'
import { generatePayoffSchedule, calcMonthlyInterest, formatCurrency, formatMonthYear, formatMonthDuration } from '@finance-app/core'
import { recordDebtPayment, deleteDebt } from '@/lib/actions/debts'
import { useToast } from '@/components/ui'
import type { Debt } from '@finance-app/types'

const DEBT_TYPE_LABELS: Record<Debt['debtType'], string> = {
  credit_card: 'Credit Card',
  student_loan: 'Student Loan',
  car_loan: 'Car Loan',
  mortgage: 'Mortgage',
  personal_loan: 'Personal Loan',
  medical: 'Medical',
  other: 'Other',
}

interface DebtCardProps {
  debt: Debt
  onViewSchedule: (debt: Debt) => void
  onDeleted: (id: string) => void
  onPaymentRecorded: (id: string, newBalance: number) => void
}

export function DebtCard({ debt, onViewSchedule, onDeleted, onPaymentRecorded }: DebtCardProps) {
  const toast = useToast()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(debt.minimumPayment.toString())
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const paidOff = debt.originalBalance > 0
    ? Math.max(0, Math.min(100, ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100))
    : 0

  const monthlyInterest = calcMonthlyInterest(debt.balance, debt.interestRate)
  const schedule = generatePayoffSchedule(debt)
  const monthsToPayoff = schedule.months.length

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) return
    setSubmitting(true)
    const result = await recordDebtPayment({
      debtId: debt.id,
      amount,
      date: paymentDate,
    })
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Payment recorded')
      onPaymentRecorded(debt.id, Math.max(0, debt.balance - amount))
      setShowPaymentForm(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${debt.name}"? This cannot be undone.`)) return
    setDeleting(true)
    const result = await deleteDebt(debt.id)
    setDeleting(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Debt removed')
      onDeleted(debt.id)
    }
  }

  return (
    <motion.div whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(239,68,68,0.08)' }} transition={{ duration: 0.15 }}>
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-text-primary">{debt.name}</h3>
            <Badge variant="danger">{DEBT_TYPE_LABELS[debt.debtType]}</Badge>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-text-muted hover:text-danger transition-colors flex-shrink-0 p-1"
            aria-label="Delete debt"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div>
          <p className="text-3xl font-bold text-danger">{formatCurrency(debt.balance)}</p>
          <p className="text-xs text-text-muted mt-0.5">remaining balance</p>
        </div>

        <ProgressBar value={paidOff} color="success" size="sm" showLabel />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-text-muted text-xs">Interest rate</span>
            <p className="text-text-primary font-medium">{(debt.interestRate * 100).toFixed(2)}% APR</p>
          </div>
          <div>
            <span className="text-text-muted text-xs">Monthly minimum</span>
            <p className="text-text-primary font-medium">{formatCurrency(debt.minimumPayment)}</p>
          </div>
          <div>
            <span className="text-text-muted text-xs">Monthly interest cost</span>
            <p className="text-danger font-medium">{formatCurrency(monthlyInterest)}</p>
          </div>
          <div>
            <span className="text-text-muted text-xs">Payoff in</span>
            <p className="text-text-primary font-medium">
              {monthsToPayoff > 0
                ? `${formatMonthDuration(monthsToPayoff)} (${formatMonthYear(schedule.payoffDate)})`
                : 'Paid off!'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={() => onViewSchedule(debt)}>
            View Schedule
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPaymentForm(!showPaymentForm)}
          >
            {showPaymentForm ? 'Cancel' : 'Record Payment'}
          </Button>
        </div>

        {showPaymentForm && (
          <motion.form
            onSubmit={handlePayment}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-surface-border pt-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amount"
                type="number"
                min="0.01"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                prefix="$"
                required
              />
              <Input
                label="Date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="sm" loading={submitting} className="w-full">
              Record Payment
            </Button>
          </motion.form>
        )}
      </Card>
    </motion.div>
  )
}
