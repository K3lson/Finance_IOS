import { createClient } from '@/lib/supabase/server'
import type { RecurringPayment } from '@finance-app/types'

function mapRecurringPayment(row: Record<string, unknown>): RecurringPayment {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    amount: Number(row.amount),
    frequency: row.frequency as RecurringPayment['frequency'],
    category: row.category as RecurringPayment['category'],
    nextDueDate: row.next_due_date as string,
    isActive: row.is_active as boolean,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function getRecurringPayments(): Promise<RecurringPayment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recurring_payments')
    .select('*')
    .order('next_due_date', { ascending: true })

  if (error || !data) return []
  return data.map(mapRecurringPayment)
}
