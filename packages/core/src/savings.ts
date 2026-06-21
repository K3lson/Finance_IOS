import type { SavingsGoal } from '@finance-app/types'

export function calcMonthsToGoal(goal: SavingsGoal): number {
  if (goal.monthlyContribution <= 0) return Infinity
  const remaining = goal.targetAmount - goal.currentAmount
  if (remaining <= 0) return 0
  return Math.ceil(remaining / goal.monthlyContribution)
}

export function projectedCompletionDate(goal: SavingsGoal): Date | null {
  if (goal.monthlyContribution <= 0) return null
  const months = calcMonthsToGoal(goal)
  if (!isFinite(months)) return null
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date
}

export function goalProgress(goal: SavingsGoal): number {
  if (goal.targetAmount <= 0) return 100
  const pct = (goal.currentAmount / goal.targetAmount) * 100
  return Math.min(100, Math.max(0, pct))
}

export function requiredMonthlyContribution(goal: SavingsGoal): number | null {
  if (!goal.targetDate) return null
  const target = new Date(goal.targetDate)
  const now = new Date()
  if (target <= now) return null
  const monthsRemaining =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth())
  if (monthsRemaining <= 0) return null
  const remaining = goal.targetAmount - goal.currentAmount
  if (remaining <= 0) return 0
  return Math.round((remaining / monthsRemaining) * 100) / 100
}

export function calcTotalSavedAcrossGoals(goals: SavingsGoal[]): number {
  return Math.round(
    goals.filter(g => !g.isCompleted).reduce((s, g) => s + g.currentAmount, 0) * 100
  ) / 100
}

export function findEmergencyFund(goals: SavingsGoal[]): SavingsGoal | null {
  return goals.find(g => g.goalCategory === 'emergency_fund') ?? null
}
