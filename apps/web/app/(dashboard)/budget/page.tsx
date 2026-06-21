import { getIncomeSources, getExpensesByMonth } from '@/lib/data/budget'
import { BudgetPageClient } from './_components/BudgetPageClient'

interface BudgetPageProps {
  searchParams: Promise<{ addExpense?: string; addIncome?: string }>
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const params = await searchParams
  const initialExpenseModalOpen = params.addExpense === 'true'
  const initialIncomeFormOpen = params.addIncome === 'true'

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
      initialExpenseModalOpen={initialExpenseModalOpen}
      initialIncomeFormOpen={initialIncomeFormOpen}
    />
  )
}
