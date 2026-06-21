import { describe, it, expect } from 'vitest'
import {
  toMonthlyAmount,
  calcNetCashFlow,
  calcHealthScore,
  groupExpensesByCategory,
  calcTotalExpenses,
} from '../budget'
import {
  calcMonthlyInterest,
  generatePayoffSchedule,
  comparePayoffMethods,
  calcTotalDebtBalance,
} from '../debt'
import {
  goalProgress,
  calcMonthsToGoal,
  projectedCompletionDate,
} from '../savings'
import {
  formatCurrency,
  formatPercent,
  formatMonthDuration,
  clamp,
} from '../formatters'
import type { Debt, SavingsGoal, IncomeSource, Expense } from '@finance-app/types'

// ─── Budget ────────────────────────────────────────────────────────────────

describe('toMonthlyAmount', () => {
  it('converts annual to monthly', () => {
    expect(toMonthlyAmount(60000, 'annual')).toBe(5000)
  })

  it('converts biweekly to monthly', () => {
    expect(toMonthlyAmount(2000, 'biweekly')).toBeCloseTo(4333.33, 1)
  })

  it('passes monthly through unchanged', () => {
    expect(toMonthlyAmount(3000, 'monthly')).toBe(3000)
  })

  it('converts weekly to monthly', () => {
    expect(toMonthlyAmount(1000, 'weekly')).toBeCloseTo(4333.33, 1)
  })
})

describe('calcNetCashFlow', () => {
  it('returns positive when income > expenses', () => {
    expect(calcNetCashFlow(5000, 3000)).toBe(2000)
  })

  it('returns negative when expenses > income', () => {
    expect(calcNetCashFlow(3000, 5000)).toBe(-2000)
  })
})

describe('calcHealthScore', () => {
  it('returns 100 for perfect finances', () => {
    const result = calcHealthScore({
      monthlyIncome: 10000,
      monthlyExpenses: 5000,
      monthlySavings: 3000, // 30% savings rate → full 25
      netCashFlow: 5000,
      totalDebtBalance: 0, // no debt → full 25
      emergencyFundBalance: 30000, // 6 months at 5000/mo → full 25
    })
    expect(result.total).toBe(100)
    expect(result.cashFlow).toBe(25)
    expect(result.debtRatio).toBe(25)
    expect(result.savingsRate).toBe(25)
    expect(result.emergencyFund).toBe(25)
  })

  it('returns 0 for dire finances (zero income, huge debt, no savings)', () => {
    const result = calcHealthScore({
      monthlyIncome: 0,
      monthlyExpenses: 3000,
      monthlySavings: 0,
      netCashFlow: -3000,
      totalDebtBalance: 500000,
      emergencyFundBalance: 0,
    })
    expect(result.total).toBeLessThanOrEqual(5)
    expect(result.cashFlow).toBe(0)
  })
})

describe('groupExpensesByCategory', () => {
  it('groups and sums expenses by category', () => {
    const expenses: Expense[] = [
      { id: '1', userId: 'u', name: 'Rent', amount: 1500, category: 'housing', date: '2024-01-01', isRecurring: true, createdAt: '', updatedAt: '' },
      { id: '2', userId: 'u', name: 'Groceries', amount: 300, category: 'food', date: '2024-01-05', isRecurring: false, createdAt: '', updatedAt: '' },
      { id: '3', userId: 'u', name: 'Dining', amount: 200, category: 'food', date: '2024-01-10', isRecurring: false, createdAt: '', updatedAt: '' },
    ]
    const result = groupExpensesByCategory(expenses)
    expect(result.housing).toBe(1500)
    expect(result.food).toBe(500)
    expect(result.transport).toBe(0)
  })
})

describe('calcTotalExpenses', () => {
  it('sums all expense amounts', () => {
    const expenses: Expense[] = [
      { id: '1', userId: 'u', name: 'A', amount: 100, category: 'food', date: '2024-01-01', isRecurring: false, createdAt: '', updatedAt: '' },
      { id: '2', userId: 'u', name: 'B', amount: 250, category: 'transport', date: '2024-01-01', isRecurring: false, createdAt: '', updatedAt: '' },
    ]
    expect(calcTotalExpenses(expenses)).toBe(350)
  })
})

// ─── Debt ──────────────────────────────────────────────────────────────────

const makeDebt = (overrides: Partial<Debt> = {}): Debt => ({
  id: 'd1',
  userId: 'u',
  name: 'Test Debt',
  debtType: 'credit_card',
  balance: 1000,
  originalBalance: 1000,
  interestRate: 0.12,
  minimumPayment: 100,
  isActive: true,
  createdAt: '',
  updatedAt: '',
  ...overrides,
})

describe('calcMonthlyInterest', () => {
  it('calculates monthly interest correctly', () => {
    expect(calcMonthlyInterest(10000, 0.12)).toBeCloseTo(100, 1)
  })

  it('returns 0 for zero balance', () => {
    expect(calcMonthlyInterest(0, 0.12)).toBe(0)
  })
})

describe('generatePayoffSchedule', () => {
  it('pays off $1000 at 12% APR with $100/month in ~11 months', () => {
    const debt = makeDebt({ balance: 1000, interestRate: 0.12, minimumPayment: 100 })
    const schedule = generatePayoffSchedule(debt)
    expect(schedule.months.length).toBeGreaterThanOrEqual(10)
    expect(schedule.months.length).toBeLessThanOrEqual(12)
    expect(schedule.months[schedule.months.length - 1].balance).toBe(0)
  })

  it('pays off faster with extra payment', () => {
    const debt = makeDebt({ balance: 5000, interestRate: 0.18, minimumPayment: 100 })
    const normal = generatePayoffSchedule(debt, 0)
    const extra = generatePayoffSchedule(debt, 200)
    expect(extra.months.length).toBeLessThan(normal.months.length)
    expect(extra.totalInterest).toBeLessThan(normal.totalInterest)
  })

  it('records final balance as 0', () => {
    const debt = makeDebt()
    const schedule = generatePayoffSchedule(debt)
    const last = schedule.months[schedule.months.length - 1]
    expect(last.balance).toBe(0)
  })
})

describe('comparePayoffMethods', () => {
  it('avalanche has equal or less total interest than snowball', () => {
    const debts: Debt[] = [
      makeDebt({ id: 'd1', balance: 3000, interestRate: 0.20, minimumPayment: 60 }),
      makeDebt({ id: 'd2', balance: 1000, interestRate: 0.10, minimumPayment: 25 }),
    ]
    const result = comparePayoffMethods(debts, 300)
    expect(result.avalanche.totalInterest).toBeLessThanOrEqual(result.snowball.totalInterest)
  })
})

describe('calcTotalDebtBalance', () => {
  it('sums active debt balances', () => {
    const debts: Debt[] = [
      makeDebt({ id: 'd1', balance: 1000, isActive: true }),
      makeDebt({ id: 'd2', balance: 2000, isActive: true }),
      makeDebt({ id: 'd3', balance: 500, isActive: false }),
    ]
    expect(calcTotalDebtBalance(debts)).toBe(3000)
  })
})

// ─── Savings ───────────────────────────────────────────────────────────────

const makeGoal = (overrides: Partial<SavingsGoal> = {}): SavingsGoal => ({
  id: 'g1',
  userId: 'u',
  name: 'Test Goal',
  goalCategory: 'vacation',
  targetAmount: 1000,
  currentAmount: 500,
  monthlyContribution: 100,
  isCompleted: false,
  createdAt: '',
  updatedAt: '',
  ...overrides,
})

describe('goalProgress', () => {
  it('returns 50 when halfway', () => {
    expect(goalProgress(makeGoal({ currentAmount: 500, targetAmount: 1000 }))).toBe(50)
  })

  it('clamps to 100 when over target', () => {
    expect(goalProgress(makeGoal({ currentAmount: 1200, targetAmount: 1000 }))).toBe(100)
  })

  it('returns 0 when nothing saved', () => {
    expect(goalProgress(makeGoal({ currentAmount: 0, targetAmount: 1000 }))).toBe(0)
  })
})

describe('calcMonthsToGoal', () => {
  it('returns 5 for $500 remaining at $100/month', () => {
    const goal = makeGoal({ targetAmount: 1000, currentAmount: 500, monthlyContribution: 100 })
    expect(calcMonthsToGoal(goal)).toBe(5)
  })

  it('returns 0 when already at target', () => {
    const goal = makeGoal({ targetAmount: 500, currentAmount: 600, monthlyContribution: 100 })
    expect(calcMonthsToGoal(goal)).toBe(0)
  })

  it('returns Infinity when no contribution', () => {
    const goal = makeGoal({ monthlyContribution: 0 })
    expect(calcMonthsToGoal(goal)).toBe(Infinity)
  })
})

describe('projectedCompletionDate', () => {
  it('returns a future date when contribution is positive', () => {
    const goal = makeGoal({ targetAmount: 1000, currentAmount: 500, monthlyContribution: 100 })
    const date = projectedCompletionDate(goal)
    expect(date).not.toBeNull()
    expect(date!.getTime()).toBeGreaterThan(Date.now())
  })

  it('returns null when no contribution', () => {
    const goal = makeGoal({ monthlyContribution: 0 })
    expect(projectedCompletionDate(goal)).toBeNull()
  })
})

// ─── Formatters ────────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
})

describe('formatPercent', () => {
  it('converts decimal to percent string', () => {
    expect(formatPercent(0.1567)).toBe('15.7%')
  })

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0.0%')
  })
})

describe('formatMonthDuration', () => {
  it('formats 1 month', () => {
    expect(formatMonthDuration(1)).toBe('1 month')
  })

  it('formats 13 months as 1 year 1 month', () => {
    expect(formatMonthDuration(13)).toBe('1 year 1 month')
  })

  it('formats 24 months as 2 years', () => {
    expect(formatMonthDuration(24)).toBe('2 years')
  })

  it('formats 0 months', () => {
    expect(formatMonthDuration(0)).toBe('0 months')
  })
})

describe('clamp', () => {
  it('clamps above max', () => {
    expect(clamp(150, 0, 100)).toBe(100)
  })

  it('clamps below min', () => {
    expect(clamp(-10, 0, 100)).toBe(0)
  })

  it('passes through values within range', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })
})
