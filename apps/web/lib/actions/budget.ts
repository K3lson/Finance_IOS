'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { IncomeSource, Expense } from '@finance-app/types'

export async function addIncomeSource(data: {
  name: string
  amount: number
  frequency: IncomeSource['frequency']
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('income_sources').insert({
    user_id: user.id,
    name: data.name,
    amount: data.amount,
    frequency: data.frequency,
    is_active: true,
  })

  if (error) return { error: error.message }
  revalidatePath('/budget')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteIncomeSource(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('income_sources')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/budget')
  revalidatePath('/dashboard')
  return {}
}

export async function toggleIncomeSource(id: string, isActive: boolean): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('income_sources')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/budget')
  revalidatePath('/dashboard')
  return {}
}

export async function addExpense(data: {
  name: string
  amount: number
  category: Expense['category']
  date: string
  isRecurring: boolean
  notes?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    name: data.name,
    amount: data.amount,
    category: data.category,
    date: data.date,
    is_recurring: data.isRecurring,
    notes: data.notes ?? null,
  })

  if (error) return { error: error.message }
  revalidatePath('/budget')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteExpense(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/budget')
  revalidatePath('/dashboard')
  return {}
}
