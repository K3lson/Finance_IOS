'use client'

import type { RecurringPayment } from '@finance-app/types'
import { groupRecurringByCategory, calcTotalMonthlyRecurringCost, formatCurrency } from '@finance-app/core'
import { Card } from '@/components/ui'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants/categories'

interface MonthlyCostBreakdownProps {
  payments: RecurringPayment[]
}

export function MonthlyCostBreakdown({ payments }: MonthlyCostBreakdownProps) {
  const activePayments = payments.filter(p => p.isActive)
  const byCategory = groupRecurringByCategory(activePayments)
  const totalMonthly = calcTotalMonthlyRecurringCost(activePayments)
  const annualTotal = totalMonthly * 12

  const entries = Object.entries(byCategory)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a) as [keyof typeof byCategory, number][]

  return (
    <Card className="p-5">
      <h3 className="text-text-primary font-semibold text-sm mb-4">Monthly Breakdown</h3>

      {entries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">No active recurring payments.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {entries.map(([category, amount]) => {
            const pct = totalMonthly > 0 ? Math.round((amount / totalMonthly) * 100) : 0
            return (
              <div key={category} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <span className="text-text-secondary text-sm flex-1 truncate">
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-text-muted text-xs w-8 text-right">{pct}%</span>
                <span className="text-text-primary text-sm font-medium w-20 text-right">
                  {formatCurrency(amount)}
                </span>
              </div>
            )
          })}

          <div className="border-t border-surface-border pt-3 mt-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm font-medium">Total / month</span>
              <span className="text-text-primary font-semibold">{formatCurrency(totalMonthly)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted text-xs">Annual total</span>
              <span className="text-text-muted text-xs">{formatCurrency(annualTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
