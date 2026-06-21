import { createClient } from '@/lib/supabase/server'
import type { Debt, DebtPayment } from '@finance-app/types'

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

function mapDebtPayment(row: Record<string, unknown>): DebtPayment {
  return {
    id: row.id as string,
    debtId: row.debt_id as string,
    userId: row.user_id as string,
    amount: Number(row.amount),
    date: row.date as string,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  }
}

export async function getDebts(): Promise<Debt[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data.map(mapDebt)
}

export async function getDebtPayments(debtId: string): Promise<DebtPayment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('debt_payments')
    .select('*')
    .eq('debt_id', debtId)
    .order('date', { ascending: false })

  if (error || !data) return []
  return data.map(mapDebtPayment)
}
