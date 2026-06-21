'use client'
import type { ExpenseCategory } from '@finance-app/types'
import { Card } from '@/components/ui'
import { DonutChart } from '@/components/charts'
import { formatCurrency } from '@finance-app/core'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants/categories'

interface ExpenseCategoryDonutProps {
  byCategory: Record<ExpenseCategory, number>
  totalExpenses: number
}

export function ExpenseCategoryDonut({ byCategory, totalExpenses }: ExpenseCategoryDonutProps) {
  const entries = (Object.entries(byCategory) as [ExpenseCategory, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)

  const chartData = entries.map(([cat, val]) => ({
    label: CATEGORY_LABELS[cat],
    value: val,
    color: CATEGORY_COLORS[cat],
  }))

  const top3 = entries.slice(0, 3)

  return (
    <Card>
      <h2 className="font-semibold text-text-primary mb-4">Spending Breakdown</h2>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <span className="text-3xl">🍩</span>
          <p className="text-text-secondary text-sm">Add expenses to see your spending breakdown</p>
        </div>
      ) : (
        <>
          <DonutChart
            data={chartData}
            total={totalExpenses}
            centerLabel="This Month"
            height={200}
          />

          <div className="mt-4 space-y-2">
            {top3.map(([cat, amount], i) => {
              const pct = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(0) : '0'
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-text-muted text-xs w-4">{i + 1}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                  <span className="text-text-secondary text-sm flex-1">{CATEGORY_LABELS[cat]}</span>
                  <span className="text-text-primary text-sm font-semibold">
                    {formatCurrency(amount)}
                  </span>
                  <span className="text-text-muted text-xs w-10 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Card>
  )
}
