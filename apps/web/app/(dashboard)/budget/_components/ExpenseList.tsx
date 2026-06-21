'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Button, Input, Modal, Badge } from '@/components/ui'
import { formatCurrency } from '@finance-app/core'
import { addExpense, deleteExpense } from '@/lib/actions/budget'
import { CATEGORY_COLORS, CATEGORY_LABELS, ALL_EXPENSE_CATEGORIES } from '@/lib/constants/categories'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import type { Expense } from '@finance-app/types'

interface ExpenseListProps {
  expenses: Expense[]
  onExpensesChange: (expenses: Expense[]) => void
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
  defaultOpen?: boolean
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ExpenseList({ expenses, onExpensesChange, onError, onSuccess, defaultOpen = false }: ExpenseListProps) {
  const [modalOpen, setModalOpen] = useState(defaultOpen)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Expense['category']>('food')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  function resetForm() {
    setName('')
    setAmount('')
    setCategory('food')
    setDate(new Date().toISOString().split('T')[0])
    setIsRecurring(false)
    setNotes('')
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return
    setSubmitting(true)

    const tempId = `temp-${Date.now()}`
    const optimistic: Expense = {
      id: tempId,
      userId: '',
      name: name.trim(),
      amount: parsedAmount,
      category,
      date,
      isRecurring,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onExpensesChange([optimistic, ...expenses])
    setModalOpen(false)
    resetForm()

    const result = await addExpense({
      name: name.trim(),
      amount: parsedAmount,
      category,
      date,
      isRecurring,
      notes: notes || undefined,
    })
    setSubmitting(false)

    if (result.error) {
      onExpensesChange(expenses)
      onError(result.error)
      setModalOpen(true)
    } else {
      onSuccess('Expense added')
    }
  }

  async function handleDelete(id: string) {
    const prev = expenses
    onExpensesChange(expenses.filter(e => e.id !== id))
    const result = await deleteExpense(id)
    if (result.error) {
      onExpensesChange(prev)
      onError(result.error)
    }
  }

  return (
    <>
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Expenses</h2>
          <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
            + Add expense
          </Button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-text-secondary text-sm font-medium">No expenses this month</p>
            <p className="text-text-muted text-xs mt-1">Add your first expense to start tracking</p>
          </div>
        ) : (
          <>
            <motion.ul
              className="space-y-1 -mx-2"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {expenses.map(expense => (
                  <motion.li
                    key={expense.id}
                    variants={fadeInUp}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-hover transition-colors group"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{expense.name}</p>
                      <p className="text-xs text-text-muted">{CATEGORY_LABELS[expense.category]} · {formatDate(expense.date)}</p>
                    </div>
                    {expense.isRecurring && (
                      <Badge variant="default" size="sm">Recurring</Badge>
                    )}
                    <span className="text-sm font-semibold text-text-primary flex-shrink-0">
                      {formatCurrency(expense.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-1 text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100 rounded-lg flex-shrink-0"
                      aria-label="Delete expense"
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 5.5l.5 6M9 5.5l-.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
            <div className="pt-2 border-t border-surface-border flex justify-between items-center">
              <span className="text-sm text-text-secondary">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</span>
              <span className="text-sm font-bold text-text-primary">{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title="Add Expense" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Rent, Groceries, Netflix"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              prefix="$"
              required
            />
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Expense['category'])}
              className="w-full bg-surface-elevated border border-surface-border rounded-xl text-text-primary text-sm px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
            >
              {ALL_EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full bg-surface-elevated border border-surface-border rounded-xl text-text-primary text-sm px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none placeholder:text-text-muted"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={e => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded accent-brand"
            />
            <span className="text-sm text-text-secondary">Recurring payment</span>
          </label>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => { setModalOpen(false); resetForm() }}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={submitting}>
              Add expense
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
