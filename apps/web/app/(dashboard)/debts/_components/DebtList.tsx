'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, Modal, Input } from '@/components/ui'
import { addDebt } from '@/lib/actions/debts'
import { useToast } from '@/components/ui'
import { DebtCard } from './DebtCard'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import type { Debt } from '@finance-app/types'

const DEBT_TYPE_OPTIONS: { value: Debt['debtType']; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
]

interface DebtListProps {
  debts: Debt[]
  onDebtAdded: (debt: Debt) => void
  onDebtDeleted: (id: string) => void
  onPaymentRecorded: (id: string, newBalance: number) => void
  onViewSchedule: (debt: Debt) => void
}

const initialForm = {
  name: '',
  debtType: 'credit_card' as Debt['debtType'],
  balance: '',
  originalBalance: '',
  interestRate: '',
  minimumPayment: '',
  dueDate: '',
}

export function DebtList({ debts, onDebtAdded, onDebtDeleted, onPaymentRecorded, onViewSchedule }: DebtListProps) {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  function set(field: keyof typeof initialForm, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'balance' && !prev.originalBalance) {
        next.originalBalance = value
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const result = await addDebt({
      name: form.name,
      debtType: form.debtType,
      balance: parseFloat(form.balance),
      originalBalance: parseFloat(form.originalBalance || form.balance),
      interestRate: parseFloat(form.interestRate),
      minimumPayment: parseFloat(form.minimumPayment),
      dueDate: form.dueDate ? parseInt(form.dueDate) : undefined,
    })
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`"${form.name}" added`)
      setModalOpen(false)
      setForm(initialForm)
      // Optimistic: parent will refetch via revalidation, but we can add a placeholder
      // The server action calls revalidatePath so the page refreshes automatically
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Your Debts</h2>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          + Add Debt
        </Button>
      </div>

      {debts.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-4xl mb-3">💳</p>
          <p className="font-medium text-text-secondary mb-1">No debts tracked yet</p>
          <p className="text-sm">Add your first debt to see your payoff plan.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => setModalOpen(true)}>
            Add your first debt
          </Button>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {debts.map((debt) => (
            <motion.div key={debt.id} variants={fadeInUp}>
              <DebtCard
                debt={debt}
                onViewSchedule={onViewSchedule}
                onDeleted={onDebtDeleted}
                onPaymentRecorded={onPaymentRecorded}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Debt" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Debt name"
            placeholder="e.g. Visa Credit Card"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Type</label>
            <select
              value={form.debtType}
              onChange={(e) => set('debtType', e.target.value)}
              className="w-full bg-surface-elevated border border-surface-border rounded-xl text-text-primary text-sm px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {DEBT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Current balance"
              type="number"
              min="0"
              step="0.01"
              value={form.balance}
              onChange={(e) => set('balance', e.target.value)}
              prefix="$"
              required
            />
            <Input
              label="Original balance"
              type="number"
              min="0"
              step="0.01"
              value={form.originalBalance}
              onChange={(e) => set('originalBalance', e.target.value)}
              prefix="$"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Interest rate (APR)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.interestRate}
              onChange={(e) => set('interestRate', e.target.value)}
              suffix="%"
              required
            />
            <Input
              label="Minimum payment"
              type="number"
              min="0"
              step="0.01"
              value={form.minimumPayment}
              onChange={(e) => set('minimumPayment', e.target.value)}
              prefix="$"
              required
            />
          </div>

          <Input
            label="Due date (day of month, optional)"
            type="number"
            min="1"
            max="31"
            placeholder="e.g. 15"
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
          />

          <Button type="submit" loading={submitting} className="w-full">
            Add Debt
          </Button>
        </form>
      </Modal>
    </div>
  )
}
