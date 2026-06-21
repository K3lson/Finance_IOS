import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  calcTotalMonthlyIncome,
  calcTotalExpenses,
  calcNetCashFlow,
  calcHealthScore,
  groupExpensesByCategory,
  calcTotalMonthlyRecurringCost,
} from '@finance-app/core'
import {
  getIncomeSources,
  getActiveDebts,
  getSavingsGoals,
  getExpensesByMonth,
  getExpensesByMonthRange,
} from '@/lib/data/cashflow'
import { getRecurringPayments } from '@/lib/data/recurring'
import { DashboardClient } from './_components/DashboardClient'

function getGreeting(name: string): string {
  const hour = new Date().getHours()
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return `${timeGreeting}, ${name}!`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [incomeSources, currentExpenses, debts, savingsGoals, monthRange, recurringPayments] = await Promise.all([
    getIncomeSources(),
    getExpensesByMonth(month, year),
    getActiveDebts(),
    getSavingsGoals(),
    getExpensesByMonthRange(6),
    getRecurringPayments(),
  ])

  const totalMonthlyRecurring = calcTotalMonthlyRecurringCost(recurringPayments)

  const totalIncome = calcTotalMonthlyIncome(incomeSources)
  const totalExpenses = calcTotalExpenses(currentExpenses)
  const netCashFlow = calcNetCashFlow(totalIncome, totalExpenses)
  const byCategory = groupExpensesByCategory(currentExpenses)

  const totalDebtBalance = debts.reduce((sum, d) => sum + d.balance, 0)
  const emergencyGoal = savingsGoals.find((g) => g.goalCategory === 'emergency_fund')
  const emergencyFundBalance = emergencyGoal?.currentAmount ?? 0
  const monthlySavings = savingsGoals
    .filter((g) => !g.isCompleted)
    .reduce((sum, g) => sum + g.monthlyContribution, 0)

  const breakdown = calcHealthScore({
    monthlyIncome: totalIncome,
    monthlyExpenses: totalExpenses,
    monthlySavings,
    netCashFlow,
    totalDebtBalance,
    emergencyFundBalance,
  })

  const trendData = monthRange.map((bucket) => ({
    month: bucket.month,
    year: bucket.year,
    totalExpenses: calcTotalExpenses(bucket.expenses),
    totalIncome: totalIncome, // use current income as proxy for all months
  }))

  const displayName = user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'there'

  return (
    <DashboardClient
      healthScore={breakdown.total}
      breakdown={breakdown}
      totalIncome={totalIncome}
      totalExpenses={totalExpenses}
      netCashFlow={netCashFlow}
      month={month}
      year={year}
      trendData={trendData}
      byCategory={byCategory}
      greeting={getGreeting(displayName)}
      totalMonthlyRecurring={totalMonthlyRecurring}
    />
  )
}
