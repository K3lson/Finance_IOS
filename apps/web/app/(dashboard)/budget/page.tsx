import { getIncomeSources, getExpensesByMonth } from '@/lib/data/budget'
import { BudgetPageClient } from './_components/BudgetPageClient'

export default async function BudgetPage() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [incomeSources, expenses] = await Promise.all([
    getIncomeSources(),
    getExpensesByMonth(month, year),
  ])

  return (
    <BudgetPageClient
      initialIncomeSources={incomeSources}
      initialExpenses={expenses}
      currentMonth={month}
      currentYear={year}
    />
  )
}
