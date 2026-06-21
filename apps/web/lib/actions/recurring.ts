'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RecurringPayment } from '@finance-app/types'

export async function addRecurringPayment(data: {
  name: string
  amount: number
  frequency: RecurringPayment['frequency']
  category: RecurringPayment['category']
  nextDueDate: string
  notes?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('recurring_payments').insert({
    user_id: user.id,
    name: data.name,
    amount: data.amount,
    frequency: data.frequency,
    category: data.category,
    next_due_date: data.nextDueDate,
    is_active: true,
    notes: data.notes ?? null,
  })

  if (error) return { error: error.message }
  revalidatePath('/recurring')
  revalidatePath('/dashboard')
  return {}
}

export async function toggleRecurringPayment(id: string, isActive: boolean): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('recurring_payments')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/recurring')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteRecurringPayment(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('recurring_payments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/recurring')
  revalidatePath('/dashboard')
  return {}
}
