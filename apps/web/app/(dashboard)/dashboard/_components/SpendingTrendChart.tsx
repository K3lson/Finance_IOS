'use client'
import { Card } from '@/components/ui'
import { TrendChart } from '@/components/charts'

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface SpendingTrendChartProps {
  data: { month: number; year: number; totalExpenses: number; totalIncome: number }[]
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const hasData = data.some((d) => d.totalIncome > 0 || d.totalExpenses > 0)

  const chartData = data.map((d) => ({
    label: MONTH_ABBR[d.month - 1],
    income: d.totalIncome,
    expenses: d.totalExpenses,
  }))

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-text-primary">6-Month Trend</h2>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <span className="text-3xl">📈</span>
          <p className="text-text-secondary text-sm">No data yet — add expenses to see trends</p>
        </div>
      ) : (
        <TrendChart data={chartData} height={220} />
      )}
    </Card>
  )
}
