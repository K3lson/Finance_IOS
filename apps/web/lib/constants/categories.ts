import type { ExpenseCategory } from '@finance-app/types'

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  housing: '#6366f1',
  food: '#f59e0b',
  transport: '#3b82f6',
  utilities: '#8b5cf6',
  healthcare: '#ef4444',
  education: '#10b981',
  entertainment: '#f97316',
  clothing: '#ec4899',
  personal_care: '#14b8a6',
  debt_payments: '#ef4444',
  savings: '#10b981',
  subscriptions: '#6366f1',
  other: '#64748b',
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: 'Housing',
  food: 'Food & Dining',
  transport: 'Transport',
  utilities: 'Utilities',
  healthcare: 'Healthcare',
  education: 'Education',
  entertainment: 'Entertainment',
  clothing: 'Clothing',
  personal_care: 'Personal Care',
  debt_payments: 'Debt Payments',
  savings: 'Savings',
  subscriptions: 'Subscriptions',
  other: 'Other',
}

export const INCOME_FREQUENCY_LABELS = {
  monthly: 'Monthly',
  biweekly: 'Bi-weekly',
  weekly: 'Weekly',
  annual: 'Annual',
} as const

export const ALL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'housing', 'food', 'transport', 'utilities', 'healthcare',
  'education', 'entertainment', 'clothing', 'personal_care',
  'debt_payments', 'savings', 'subscriptions', 'other',
]
