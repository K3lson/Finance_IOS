'use client'

import { Card } from '@/components/ui'
import { BarChart } from '@/components/charts'
import { CATEGORY_LABELS } from '@/lib/constants/categories'
import type { ExpenseCategory } from '@finance-app/types'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface ExpensesByCategoryChartProps {
  byCategory: Record<ExpenseCategory, number>
  month: number
  year: number
}

export function ExpensesByCategoryChart({ byCategory, month, year }: ExpensesByCategoryChartProps) {
  const chartData = (Object.entries(byCategory) as [ExpenseCategory, number][])
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amount]) => ({
      label: CATEGORY_LABELS[cat],
      actual: amount,
    }))

  if (chartData.length === 0) {
    return (
      <Card>
        <h2 className="font-semibold text-text-primary mb-1">Spending by Category</h2>
        <p className="text-text-muted text-xs mb-6">{MONTH_NAMES[month - 1]} {year}</p>
        <div className="py-10 text-center">
          <p className="text-text-muted text-sm">No spending data for this month yet.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="font-semibold text-text-primary mb-1">Spending by Category</h2>
      <p className="text-text-muted text-xs mb-6">{MONTH_NAMES[month - 1]} {year}</p>
      <BarChart data={chartData} height={260} />
    </Card>
  )
}
