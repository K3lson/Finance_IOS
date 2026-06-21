import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getIncomeSources, getExpensesByMonth } from '@/lib/data/budget'
import { calcTotalMonthlyIncome, calcTotalExpenses, calcNetCashFlow } from '@finance-app/core'
import { DashboardStats } from './DashboardStats'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [incomeSources, expenses] = await Promise.all([
    getIncomeSources(),
    getExpensesByMonth(month, year),
  ])

  const totalIncome = calcTotalMonthlyIncome(incomeSources)
  const totalExpenses = calcTotalExpenses(expenses)
  const netCashFlow = calcNetCashFlow(totalIncome, totalExpenses)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}
        </p>
      </div>

      <DashboardStats
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netCashFlow={netCashFlow}
      />
    </div>
  )
}
