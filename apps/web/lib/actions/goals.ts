'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SavingsGoal } from '@finance-app/types'

export async function createGoal(data: {
  name: string
  goalCategory: SavingsGoal['goalCategory']
  targetAmount: number
  currentAmount: number
  targetDate?: string
  monthlyContribution: number
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('savings_goals').insert({
    user_id: user.id,
    name: data.name,
    goal_category: data.goalCategory,
    target_amount: data.targetAmount,
    current_amount: data.currentAmount,
    target_date: data.targetDate ?? null,
    monthly_contribution: data.monthlyContribution,
    is_completed: false,
  })

  if (error) return { error: error.message }
  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return {}
}

export async function addContribution(data: {
  goalId: string
  amount: number
  date: string
  notes?: string
}): Promise<{ error?: string; isCompleted?: boolean; newAmount?: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch current goal state
  const { data: goal, error: fetchError } = await supabase
    .from('savings_goals')
    .select('current_amount, target_amount, is_completed')
    .eq('id', data.goalId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !goal) return { error: 'Goal not found' }

  const newAmount = Number(goal.current_amount) + data.amount
  const isNowCompleted = !goal.is_completed && newAmount >= Number(goal.target_amount)

  // Insert contribution
  const { error: contribError } = await supabase.from('savings_contributions').insert({
    goal_id: data.goalId,
    user_id: user.id,
    amount: data.amount,
    date: data.date,
    notes: data.notes ?? null,
  })

  if (contribError) return { error: contribError.message }

  // Update goal amount (and mark complete if threshold crossed)
  const updatePayload: Record<string, unknown> = { current_amount: newAmount }
  if (isNowCompleted) {
    updatePayload.is_completed = true
    updatePayload.completed_at = new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from('savings_goals')
    .update(updatePayload)
    .eq('id', data.goalId)
    .eq('user_id', user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return { isCompleted: isNowCompleted, newAmount }
}

export async function deleteGoal(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return {}
}

export async function updateGoalContribution(
  id: string,
  monthlyContribution: number
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('savings_goals')
    .update({ monthly_contribution: monthlyContribution })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/goals')
  return {}
}
