import type { RecurringPayment, ExpenseCategory } from '@finance-app/types'

const ALL_CATEGORIES: ExpenseCategory[] = [
  'housing', 'food', 'transport', 'utilities', 'healthcare',
  'education', 'entertainment', 'clothing', 'personal_care',
  'debt_payments', 'savings', 'subscriptions', 'other',
]

export function toMonthlyRecurringCost(payment: RecurringPayment): number {
  switch (payment.frequency) {
    case 'daily': return payment.amount * 30.44
    case 'weekly': return (payment.amount * 52) / 12
    case 'biweekly': return (payment.amount * 26) / 12
    case 'monthly': return payment.amount
    case 'annual': return payment.amount / 12
  }
}

export function calcTotalMonthlyRecurringCost(payments: RecurringPayment[]): number {
  return Math.round(
    payments
      .filter(p => p.isActive)
      .reduce((s, p) => s + toMonthlyRecurringCost(p), 0) * 100
  ) / 100
}

export function groupRecurringByCategory(payments: RecurringPayment[]): Record<ExpenseCategory, number> {
  const result = Object.fromEntries(ALL_CATEGORIES.map(c => [c, 0])) as Record<ExpenseCategory, number>
  for (const p of payments.filter(p => p.isActive)) {
    result[p.category] = Math.round((result[p.category] + toMonthlyRecurringCost(p)) * 100) / 100
  }
  return result
}

export function upcomingPayments(
  payments: RecurringPayment[],
  withinDays: number,
  from: Date = new Date()
): RecurringPayment[] {
  const cutoff = new Date(from)
  cutoff.setDate(cutoff.getDate() + withinDays)
  return payments.filter(p => {
    if (!p.isActive) return false
    const due = new Date(p.nextDueDate)
    return due >= from && due <= cutoff
  })
}
