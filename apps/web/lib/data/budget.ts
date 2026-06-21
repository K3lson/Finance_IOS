import { createClient } from '@/lib/supabase/server'
import type { IncomeSource, Expense } from '@finance-app/types'

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

export async function getAllExpenses(): Promise<Expense[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })

  if (error || !data) return []
  return data.map(mapExpense)
}
