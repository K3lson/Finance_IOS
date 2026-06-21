'use client'

import { useState } from 'react'
import { Modal, Button } from '@/components/ui'
import { generatePayoffSchedule } from '@finance-app/core'
import { formatCurrency, formatMonthYear } from '@finance-app/core'
import type { Debt } from '@finance-app/types'

interface PayoffScheduleModalProps {
  debt: Debt | null
  onClose: () => void
}

export function PayoffScheduleModal({ debt, onClose }: PayoffScheduleModalProps) {
  const [showAll, setShowAll] = useState(false)

  if (!debt) return null

  const schedule = generatePayoffSchedule(debt)
  const visibleMonths = showAll ? schedule.months : schedule.months.slice(0, 24)

  return (
    <Modal open={!!debt} onClose={onClose} title={`Payoff Schedule — ${debt.name}`} size="lg">
      <div className="space-y-4">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-text-muted">Total paid</span>
            <p className="font-bold text-text-primary">{formatCurrency(schedule.totalPaid)}</p>
          </div>
          <div>
            <span className="text-text-muted">Total interest</span>
            <p className="font-bold text-danger">{formatCurrency(schedule.totalInterest)}</p>
          </div>
          <div>
            <span className="text-text-muted">Payoff date</span>
            <p className="font-bold text-text-primary">{formatMonthYear(schedule.payoffDate)}</p>
          </div>
        </div>

        <div className="overflow-auto max-h-96 rounded-xl border border-surface-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-elevated">
              <tr className="text-text-muted text-xs uppercase tracking-wider">
                <th className="px-3 py-2 text-left">Month</th>
                <th className="px-3 py-2 text-right">Payment</th>
                <th className="px-3 py-2 text-right">Principal</th>
                <th className="px-3 py-2 text-right">Interest</th>
                <th className="px-3 py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {visibleMonths.map((m) => (
                <tr
                  key={m.month}
                  className="border-t border-surface-border hover:bg-surface-hover transition-colors"
                >
                  <td className="px-3 py-2 text-text-secondary">{formatMonthYear(m.date)}</td>
                  <td className="px-3 py-2 text-right text-text-primary font-medium">{formatCurrency(m.payment)}</td>
                  <td className="px-3 py-2 text-right text-success">{formatCurrency(m.principal)}</td>
                  <td className="px-3 py-2 text-right text-danger">{formatCurrency(m.interest)}</td>
                  <td className="px-3 py-2 text-right text-text-secondary">{formatCurrency(m.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {schedule.months.length > 24 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll
              ? 'Show fewer months'
              : `Show all ${schedule.months.length} months`}
          </Button>
        )}
      </div>
    </Modal>
  )
}
