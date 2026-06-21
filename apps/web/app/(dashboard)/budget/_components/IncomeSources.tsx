'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Button, Input, Badge } from '@/components/ui'
import { toMonthlyAmount, formatCurrency } from '@finance-app/core'
import { addIncomeSource, deleteIncomeSource, toggleIncomeSource } from '@/lib/actions/budget'
import { INCOME_FREQUENCY_LABELS } from '@/lib/constants/categories'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import type { IncomeSource } from '@finance-app/types'

interface IncomeSourcesProps {
  sources: IncomeSource[]
  onSourcesChange: (sources: IncomeSource[]) => void
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
  defaultOpen?: boolean
}

export function IncomeSources({ sources, onSourcesChange, onError, onSuccess, defaultOpen = false }: IncomeSourcesProps) {
  const [showForm, setShowForm] = useState(defaultOpen)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<IncomeSource['frequency']>('monthly')
  const [submitting, setSubmitting] = useState(false)

  const parsedAmount = parseFloat(amount) || 0
  const monthlyPreview = parsedAmount > 0 ? toMonthlyAmount(parsedAmount, frequency) : 0

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || parsedAmount <= 0) return
    setSubmitting(true)

    const tempId = `temp-${Date.now()}`
    const optimistic: IncomeSource = {
      id: tempId,
      userId: '',
      name: name.trim(),
      amount: parsedAmount,
      frequency,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSourcesChange([...sources, optimistic])
    setName('')
    setAmount('')
    setShowForm(false)

    const result = await addIncomeSource({ name: name.trim(), amount: parsedAmount, frequency })
    setSubmitting(false)

    if (result.error) {
      onSourcesChange(sources.filter(s => s.id !== tempId))
      onError(result.error)
    } else {
      onSuccess('Income source added')
    }
  }

  async function handleDelete(id: string) {
    const prev = sources
    onSourcesChange(sources.filter(s => s.id !== id))
    const result = await deleteIncomeSource(id)
    if (result.error) {
      onSourcesChange(prev)
      onError(result.error)
    }
  }

  async function handleToggle(source: IncomeSource) {
    const updated = sources.map(s => s.id === source.id ? { ...s, isActive: !s.isActive } : s)
    onSourcesChange(updated)
    const result = await toggleIncomeSource(source.id, !source.isActive)
    if (result.error) {
      onSourcesChange(sources)
      onError(result.error)
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-text-primary">Income Sources</h2>
        <Button size="sm" variant="secondary" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ Add income'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleAdd}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 pt-1 pb-3 border-b border-surface-border">
              <Input
                label="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Salary, Freelance"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  prefix="$"
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Frequency</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as IncomeSource['frequency'])}
                    className="w-full bg-surface-elevated border border-surface-border rounded-xl text-text-primary text-sm px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  >
                    {(Object.keys(INCOME_FREQUENCY_LABELS) as IncomeSource['frequency'][]).map(f => (
                      <option key={f} value={f}>{INCOME_FREQUENCY_LABELS[f]}</option>
                    ))}
                  </select>
                </div>
              </div>
              {monthlyPreview > 0 && (
                <p className="text-xs text-text-muted">
                  Monthly equivalent: <span className="text-brand font-semibold">{formatCurrency(monthlyPreview)}</span>
                </p>
              )}
              <Button type="submit" loading={submitting} size="sm">
                Add income source
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {sources.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-text-muted text-sm">No income sources yet.</p>
          <p className="text-text-muted text-xs mt-1">Add your salary or other income above.</p>
        </div>
      ) : (
        <motion.ul
          className="space-y-2"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {sources.map(source => (
            <motion.li
              key={source.id}
              variants={fadeInUp}
              className="flex items-center gap-3 py-2.5 px-1"
            >
              <button
                onClick={() => handleToggle(source)}
                className={[
                  'w-9 h-5 rounded-full transition-colors flex-shrink-0 relative',
                  source.isActive ? 'bg-brand' : 'bg-surface-border',
                ].join(' ')}
                aria-label={source.isActive ? 'Deactivate' : 'Activate'}
              >
                <span className={[
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  source.isActive ? 'translate-x-4' : 'translate-x-0.5',
                ].join(' ')} />
              </button>
              <div className="flex-1 min-w-0">
                <p className={['text-sm font-medium truncate', source.isActive ? 'text-text-primary' : 'text-text-muted line-through'].join(' ')}>
                  {source.name}
                </p>
                <p className="text-xs text-text-muted">
                  {formatCurrency(toMonthlyAmount(source.amount, source.frequency))}/mo
                </p>
              </div>
              <Badge variant="default" size="sm">{INCOME_FREQUENCY_LABELS[source.frequency]}</Badge>
              <button
                onClick={() => handleDelete(source.id)}
                className="p-1.5 text-text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10 flex-shrink-0"
                aria-label="Delete"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 5.5l.5 6M9 5.5l-.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                </svg>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </Card>
  )
}
