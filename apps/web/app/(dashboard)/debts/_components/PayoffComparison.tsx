'use client'

import { Card, Badge } from '@/components/ui'
import { comparePayoffMethods, calcTotalMinimumPayments, formatCurrency, formatMonthYear } from '@finance-app/core'
import type { Debt } from '@finance-app/types'

interface PayoffComparisonProps {
  debts: Debt[]
}

export function PayoffComparison({ debts }: PayoffComparisonProps) {
  const activeDebts = debts.filter((d) => d.isActive && d.balance > 0)
  if (activeDebts.length < 2) return null

  const monthlyBudget = calcTotalMinimumPayments(activeDebts)
  const comparison = comparePayoffMethods(activeDebts, monthlyBudget)

  const avalancheSaves = comparison.snowball.totalInterest - comparison.avalanche.totalInterest
  const avalancheWins = avalancheSaves > 0

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Payoff Strategy Comparison</h2>
      <p className="text-sm text-text-muted">
        Comparing both strategies using your current minimum payments.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-elevated rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">Avalanche</span>
            <span className="text-xs text-text-muted">Highest rate first</span>
            {avalancheWins && <Badge variant="success">Saves more</Badge>}
          </div>
          <div>
            <p className="text-xs text-text-muted">Total interest paid</p>
            <p className="text-xl font-bold text-danger">{formatCurrency(comparison.avalanche.totalInterest)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Last payoff date</p>
            <p className="text-sm font-medium text-text-primary">{formatMonthYear(comparison.avalanche.lastPayoffDate)}</p>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">Snowball</span>
            <span className="text-xs text-text-muted">Lowest balance first</span>
            {!avalancheWins && <Badge variant="brand">Saves more</Badge>}
          </div>
          <div>
            <p className="text-xs text-text-muted">Total interest paid</p>
            <p className="text-xl font-bold text-danger">{formatCurrency(comparison.snowball.totalInterest)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Last payoff date</p>
            <p className="text-sm font-medium text-text-primary">{formatMonthYear(comparison.snowball.lastPayoffDate)}</p>
          </div>
        </div>
      </div>

      {avalancheWins && avalancheSaves > 0.01 ? (
        <p className="text-sm text-text-secondary bg-success-muted rounded-xl p-3">
          <span className="font-semibold text-success">Recommendation:</span> The Avalanche method saves you{' '}
          <span className="font-semibold text-success">{formatCurrency(avalancheSaves)}</span> in interest. Best if you want
          to minimize total cost.
        </p>
      ) : (
        <p className="text-sm text-text-secondary bg-brand-muted rounded-xl p-3">
          <span className="font-semibold text-brand-light">Recommendation:</span> Both strategies are similar here.
          The Snowball method pays off individual debts faster — good for motivation if you want early wins.
        </p>
      )}
    </Card>
  )
}
