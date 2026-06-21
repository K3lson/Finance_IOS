import { createClient } from '@/lib/supabase/server'
import type { SavingsGoal, SavingsContribution } from '@finance-app/types'

function mapGoal(row: Record<string, unknown>): SavingsGoal {
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

function mapContribution(row: Record<string, unknown>): SavingsContribution {
  return {
    id: row.id as string,
    goalId: row.goal_id as string,
    userId: row.user_id as string,
    amount: Number(row.amount),
    date: row.date as string,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  }
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('is_completed', { ascending: true })
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data.map(mapGoal)
}

export async function getContributions(goalId: string): Promise<SavingsContribution[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('savings_contributions')
    .select('*')
    .eq('goal_id', goalId)
    .order('date', { ascending: false })

  if (error || !data) return []
  return data.map(mapContribution)
}
