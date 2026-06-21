import type {
  IncomeSource,
  Expense,
  ExpenseCategory,
  HealthScoreBreakdown,
  MonthlySummary,
} from '@finance-app/types'

const ALL_CATEGORIES: ExpenseCategory[] = [
  'housing', 'food', 'transport', 'utilities', 'healthcare',
  'education', 'entertainment', 'clothing', 'personal_care',
  'debt_payments', 'savings', 'subscriptions', 'other',
]

export function toMonthlyAmount(amount: number, frequency: IncomeSource['frequency']): number {
  switch (frequency) {
    case 'monthly': return amount
    case 'annual': return amount / 12
    case 'biweekly': return (amount * 26) / 12
    case 'weekly': return (amount * 52) / 12
  }
}

export function calcTotalMonthlyIncome(sources: IncomeSource[]): number {
  return sources
    .filter(s => s.isActive)
    .reduce((sum, s) => sum + toMonthlyAmount(s.amount, s.frequency), 0)
}

export function groupExpensesByCategory(expenses: Expense[]): Record<ExpenseCategory, number> {
  const result = Object.fromEntries(ALL_CATEGORIES.map(c => [c, 0])) as Record<ExpenseCategory, number>
  for (const e of expenses) {
    result[e.category] = (result[e.category] ?? 0) + e.amount
  }
  return result
}

export function calcTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

export function calcNetCashFlow(totalIncome: number, totalExpenses: number): number {
  return totalIncome - totalExpenses
}

export function calcHealthScore(params: {
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  netCashFlow: number
  totalDebtBalance: number
  emergencyFundBalance: number
}): HealthScoreBreakdown {
  const { monthlyIncome, monthlyExpenses, monthlySavings, netCashFlow, totalDebtBalance, emergencyFundBalance } = params

  // 1. Savings rate component (0–25)
  let savingsRate = 0
  if (monthlyIncome > 0) {
    const rate = monthlySavings / monthlyIncome
    savingsRate = Math.min(25, (rate / 0.20) * 25)
  }

  // 2. Debt ratio component (0–25)
  let debtRatio = 25
  if (totalDebtBalance > 0) {
    const annualIncome = monthlyIncome * 12
    if (annualIncome <= 0) {
      debtRatio = 0
    } else {
      const ratio = totalDebtBalance / annualIncome
      if (ratio <= 0.15) {
        debtRatio = 25
      } else if (ratio >= 3.0) {
        debtRatio = 0
      } else {
        // linear from 25 at 0.15 down to 0 at 3.0
        debtRatio = 25 * (1 - (ratio - 0.15) / (3.0 - 0.15))
      }
    }
  }

  // 3. Cash flow component (0–25, binary)
  const cashFlow = netCashFlow > 0 ? 25 : 0

  // 4. Emergency fund component (0–25)
  let emergencyFund = 25
  if (monthlyExpenses > 0) {
    const months = emergencyFundBalance / monthlyExpenses
    emergencyFund = Math.min(25, (months / 6) * 25)
  }

  const total = Math.round(Math.min(100, Math.max(0, savingsRate + debtRatio + cashFlow + emergencyFund)))

  return {
    total,
    savingsRate: Math.round(Math.max(0, Math.min(25, savingsRate))),
    debtRatio: Math.round(Math.max(0, Math.min(25, debtRatio))),
    cashFlow,
    emergencyFund: Math.round(Math.max(0, Math.min(25, emergencyFund))),
  }
}

export function topExpenseCategory(byCategory: Record<ExpenseCategory, number>): ExpenseCategory {
  let top: ExpenseCategory = 'other'
  let max = -1
  for (const [cat, amt] of Object.entries(byCategory) as [ExpenseCategory, number][]) {
    if (amt > max) {
      max = amt
      top = cat
    }
  }
  return top
}

export function buildMonthlySummary(params: {
  month: number
  year: number
  incomeSources: IncomeSource[]
  expenses: Expense[]
  healthScore: number
}): MonthlySummary {
  const { month, year, incomeSources, expenses, healthScore } = params
  const totalIncome = calcTotalMonthlyIncome(incomeSources)
  const totalExpenses = calcTotalExpenses(expenses)
  const netCashFlow = calcNetCashFlow(totalIncome, totalExpenses)
  const expensesByCategory = groupExpensesByCategory(expenses)

  return {
    month,
    year,
    totalIncome,
    totalExpenses,
    netCashFlow,
    healthScore,
    topExpenseCategory: topExpenseCategory(expensesByCategory),
    expensesByCategory,
  }
}
