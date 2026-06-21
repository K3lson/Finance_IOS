'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RecurringPayment, ExpenseCategory } from '@finance-app/types'
import { toMonthlyRecurringCost, formatCurrency } from '@finance-app/core'
import { Card, Button, Modal, Input } from '@/components/ui'
import { CATEGORY_LABELS, CATEGORY_COLORS, ALL_EXPENSE_CATEGORIES } from '@/lib/constants/categories'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import { addRecurringPayment } from '@/lib/actions/recurring'
import { RecurringCard } from './RecurringCard'

const FREQUENCY_OPTIONS: { value: RecurringPayment['frequency']; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

interface RecurringListProps {
  payments: RecurringPayment[]
  onAdd: (payment: RecurringPayment) => void
  onToggle: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
  onError: (msg: string) => void
}

export function RecurringList({ payments, onAdd, onToggle, onDelete, onError }: RecurringListProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    amount: '',
    frequency: 'monthly' as RecurringPayment['frequency'],
    category: 'subscriptions' as ExpenseCategory,
    nextDueDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  // Group by category
  const grouped = new Map<ExpenseCategory, RecurringPayment[]>()
  for (const p of payments) {
    const list = grouped.get(p.category) ?? []
    list.push(p)
    grouped.set(p.category, list)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.amount) return
    setSubmitting(true)

    const optimistic: RecurringPayment = {
      id: `temp-${Date.now()}`,
      userId: '',
      name: form.name,
      amount: Number(form.amount),
      frequency: form.frequency,
      category: form.category,
      nextDueDate: form.nextDueDate,
      isActive: true,
      notes: form.notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onAdd(optimistic)
    setModalOpen(false)
    setForm({ name: '', amount: '', frequency: 'monthly', category: 'subscriptions', nextDueDate: new Date().toISOString().split('T')[0], notes: '' })

    const result = await addRecurringPayment({
      name: optimistic.name,
      amount: optimistic.amount,
      frequency: optimistic.frequency,
      category: optimistic.category,
      nextDueDate: optimistic.nextDueDate,
      notes: optimistic.notes,
    })

    if (result.error) {
      onDelete(optimistic.id)
      onError(result.error)
    }
    setSubmitting(false)
  }

  const selectClass = 'w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-indigo-500 text-sm'

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-text-primary font-semibold">All Payments</h2>
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            + Add Payment
          </Button>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔄</p>
            <p className="text-text-secondary font-medium">No recurring payments tracked.</p>
            <p className="text-text-muted text-sm mt-1">Add your subscriptions and bills to see where your money goes each month.</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => setModalOpen(true)}>
              Add your first payment
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([category, items]) => {
              const categoryMonthly = items.filter(p => p.isActive).reduce((s, p) => s + toMonthlyRecurringCost(p), 0)
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[category] }}
                      />
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        {CATEGORY_LABELS[category]}
                      </span>
                    </div>
                    {categoryMonthly > 0 && (
                      <span className="text-xs text-text-muted">{formatCurrency(categoryMonthly)}/mo</span>
                    )}
                  </div>
                  <AnimatePresence>
                    <motion.div
                      className="space-y-2"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {items.map(p => (
                        <motion.div key={p.id} variants={fadeInUp}>
                          <RecurringCard
                            payment={p}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onError={onError}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Recurring Payment" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Payment Name"
            placeholder="e.g. Netflix, Rent, Car Insurance"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            prefix="$"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Frequency</label>
              <select
                className={selectClass}
                value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value as RecurringPayment['frequency'] }))}
              >
                {FREQUENCY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Category</label>
              <select
                className={selectClass}
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
              >
                {ALL_EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Next Due Date"
            type="date"
            value={form.nextDueDate}
            onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))}
            required
          />
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Notes (optional)</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-indigo-500 text-sm resize-none"
              rows={2}
              placeholder="Any notes..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="flex-1">
              Add Payment
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
