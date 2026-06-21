// User & Profile
export interface Profile {
  id: string
  userId: string
  displayName: string
  householdType: 'individual' | 'couple' | 'family'
  currency: string
  createdAt: string
  updatedAt: string
}

// Income
export type IncomeFrequency = 'monthly' | 'biweekly' | 'weekly' | 'annual'

export interface IncomeSource {
  id: string
  userId: string
  name: string
  amount: number
  frequency: IncomeFrequency
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Expenses & Categories
export type ExpenseCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'healthcare'
  | 'education'
  | 'entertainment'
  | 'clothing'
  | 'personal_care'
  | 'debt_payments'
  | 'savings'
  | 'subscriptions'
  | 'other'

export interface Expense {
  id: string
  userId: string
  name: string
  amount: number
  category: ExpenseCategory
  date: string
  isRecurring: boolean
  recurringFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'annual'
  notes?: string
  createdAt: string
  updatedAt: string
}

// Budget
export interface Budget {
  id: string
  userId: string
  month: number
  year: number
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  healthScore: number
  createdAt: string
  updatedAt: string
}

export interface BudgetCategoryAllocation {
  id: string
  budgetId: string
  category: ExpenseCategory
  allocatedAmount: number
  actualAmount: number
}

// Debts
export type DebtType =
  | 'credit_card'
  | 'student_loan'
  | 'car_loan'
  | 'mortgage'
  | 'personal_loan'
  | 'medical'
  | 'other'

export interface Debt {
  id: string
  userId: string
  name: string
  debtType: DebtType
  balance: number
  originalBalance: number
  interestRate: number
  minimumPayment: number
  dueDate?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DebtPayment {
  id: string
  debtId: string
  userId: string
  amount: number
  date: string
  notes?: string
  createdAt: string
}

// Savings Goals
export type GoalCategory =
  | 'emergency_fund'
  | 'vacation'
  | 'home'
  | 'car'
  | 'education'
  | 'retirement'
  | 'wedding'
  | 'other'

export interface SavingsGoal {
  id: string
  userId: string
  name: string
  goalCategory: GoalCategory
  targetAmount: number
  currentAmount: number
  targetDate?: string
  monthlyContribution: number
  isCompleted: boolean
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SavingsContribution {
  id: string
  goalId: string
  userId: string
  amount: number
  date: string
  notes?: string
  createdAt: string
}

// Recurring Payments
export interface RecurringPayment {
  id: string
  userId: string
  name: string
  amount: number
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'annual'
  category: ExpenseCategory
  nextDueDate: string
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

// Financial Health Score breakdown
export interface HealthScoreBreakdown {
  total: number
  savingsRate: number
  debtRatio: number
  cashFlow: number
  emergencyFund: number
}

// Dashboard / Summary
export interface MonthlySummary {
  month: number
  year: number
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  healthScore: number
  topExpenseCategory: ExpenseCategory
  expensesByCategory: Record<ExpenseCategory, number>
}
