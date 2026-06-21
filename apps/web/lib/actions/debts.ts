'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Debt } from '@finance-app/types'

export async function addDebt(data: {
  name: string
  debtType: Debt['debtType']
  balance: number
  originalBalance: number
  interestRate: number
  minimumPayment: number
  dueDate?: number
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('debts').insert({
    user_id: user.id,
    name: data.name,
    debt_type: data.debtType,
    balance: data.balance,
    original_balance: data.originalBalance,
    interest_rate: data.interestRate / 100,
    minimum_payment: data.minimumPayment,
    due_date: data.dueDate ?? null,
    is_active: true,
  })

  if (error) return { error: error.message }
  revalidatePath('/debts')
  revalidatePath('/dashboard')
  return {}
}

export async function updateDebtBalance(id: string, newBalance: number): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('debts')
    .update({ balance: Math.max(0, newBalance) })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/debts')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteDebt(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/debts')
  revalidatePath('/dashboard')
  return {}
}

export async function recordDebtPayment(data: {
  debtId: string
  amount: number
  date: string
  notes?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: debtData, error: fetchError } = await supabase
    .from('debts')
    .select('balance')
    .eq('id', data.debtId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !debtData) return { error: 'Debt not found' }

  const newBalance = Math.max(0, Number(debtData.balance) - data.amount)

  const { error: paymentError } = await supabase.from('debt_payments').insert({
    debt_id: data.debtId,
    user_id: user.id,
    amount: data.amount,
    date: data.date,
    notes: data.notes ?? null,
  })

  if (paymentError) return { error: paymentError.message }

  const { error: updateError } = await supabase
    .from('debts')
    .update({ balance: newBalance })
    .eq('id', data.debtId)
    .eq('user_id', user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/debts')
  revalidatePath('/dashboard')
  return {}
}
