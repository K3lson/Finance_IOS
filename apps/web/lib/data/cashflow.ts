import { createClient } from '@/lib/supabase/server'
import type { IncomeSource, Expense, Debt, SavingsGoal } from '@finance-app/types'

function mapIncomeSource(row: Record<string, unknown>): IncomeSource {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    amount: Number(row.amount),
    frequency: row.frequency as IncomeSource['frequency'],
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    amount: Number(row.amount),
    category: row.category as Expense['category'],
    date: row.date as string,
    isRecurring: row.is_recurring as boolean,
    recurringFrequency: row.recurring_frequency as Expense['recurringFrequency'],
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapDebt(row: Record<string, unknown>): Debt {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    debtType: row.debt_type as Debt['debtType'],
    balance: Number(row.balance),
    originalBalance: Number(row.original_balance),
    interestRate: Number(row.interest_rate),
    minimumPayment: Number(row.minimum_payment),
    dueDate: row.due_date as number | undefined,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapSavingsGoal(row: Record<string, unknown>): SavingsGoal {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    goalCategory: row.goal_category as SavingsGoal['goalCategory'],
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: row.target_date as string | undefined,
    monthlyContribution: Number(row.monthly_contribution),
    isCompleted: row.is_completed as boolean,
    completedAt: row.completed_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function getExpensesByMonth(month: number, year: number): Promise<Expense[]> {
  const supabase = await createClient()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date', { ascending: false })

  if (error || !data) return []
  return data.map(mapExpense)
}

export async function getExpensesByMonthRange(
  months: number
): Promise<{ month: number; year: number; expenses: Expense[] }[]> {
  const supabase = await createClient()
  const now = new Date()
  const results: { month: number; year: number; expenses: Expense[] }[] = []

  // Build date range: N months back from current month
  const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-01`
  const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', startStr)
    .lt('date', endStr)
    .order('date', { ascending: true })

  if (error || !data) {
    // Return empty buckets for each month
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      results.push({ month: d.getMonth() + 1, year: d.getFullYear(), expenses: [] })
    }
    return results
  }

  const allExpenses = data.map(mapExpense)

  // Bucket expenses by month/year
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const bucket = allExpenses.filter((e) => {
      const ed = new Date(e.date)
      return ed.getMonth() + 1 === m && ed.getFullYear() === y
    })
    results.push({ month: m, year: y, expenses: bucket })
  }

  return results
}

export async function getIncomeSources(): Promise<IncomeSource[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data.map(mapIncomeSource)
}

export async function getActiveDebts(): Promise<Debt[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data.map(mapDebt)
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data.map(mapSavingsGoal)
}
