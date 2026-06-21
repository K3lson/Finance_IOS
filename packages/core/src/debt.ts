import type { Debt } from '@finance-app/types'

export interface PayoffMonth {
  month: number
  date: string
  payment: number
  principal: number
  interest: number
  balance: number
}

export interface PayoffSchedule {
  debt: Debt
  months: PayoffMonth[]
  totalPaid: number
  totalInterest: number
  payoffDate: string
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function addMonths(from: Date, n: number): Date {
  const d = new Date(from)
  d.setMonth(d.getMonth() + n)
  return d
}

export function calcMonthlyInterest(balance: number, annualRate: number): number {
  return round2(balance * (annualRate / 12))
}

export function generatePayoffSchedule(debt: Debt, extraPayment = 0): PayoffSchedule {
  const months: PayoffMonth[] = []
  let balance = debt.balance
  const monthlyPayment = debt.minimumPayment + extraPayment
  const startDate = new Date()
  let totalPaid = 0
  let totalInterest = 0
  let monthNum = 0

  while (balance > 0.01 && monthNum < 600) {
    monthNum++
    const interest = calcMonthlyInterest(balance, debt.interestRate)
    balance = round2(balance + interest)
    const payment = round2(Math.min(monthlyPayment, balance))
    const principal = round2(payment - interest)
    balance = round2(balance - payment)
    if (balance < 0) balance = 0

    totalPaid = round2(totalPaid + payment)
    totalInterest = round2(totalInterest + interest)

    months.push({
      month: monthNum,
      date: addMonths(startDate, monthNum).toISOString(),
      payment,
      principal: round2(principal),
      interest: round2(interest),
      balance,
    })
  }

  return {
    debt,
    months,
    totalPaid,
    totalInterest,
    payoffDate: months.length > 0 ? months[months.length - 1].date : new Date().toISOString(),
  }
}

function multiDebtPayoff(
  debts: Debt[],
  monthlyBudget: number,
  prioritize: (a: Debt, b: Debt) => number
): PayoffSchedule[] {
  // Work with copies so we don't mutate originals
  const active = debts
    .filter(d => d.isActive && d.balance > 0.01)
    .map(d => ({ ...d, balance: d.balance }))

  const scheduleMap: Map<string, PayoffMonth[]> = new Map(active.map(d => [d.id, []]))
  const startDate = new Date()
  let month = 0
  const MAX_MONTHS = 600

  while (active.length > 0 && month < MAX_MONTHS) {
    month++
    active.sort(prioritize)

    const totalMinimums = active.reduce((s, d) => s + d.minimumPayment, 0)
    let extraBudget = round2(Math.max(0, monthlyBudget - totalMinimums))

    for (let i = 0; i < active.length; i++) {
      const debt = active[i]
      const interest = calcMonthlyInterest(debt.balance, debt.interestRate)
      debt.balance = round2(debt.balance + interest)

      let payment = debt.minimumPayment
      // Apply extra budget to the priority debt (first after sort)
      if (i === 0 && extraBudget > 0) {
        payment = round2(payment + extraBudget)
      }
      payment = round2(Math.min(payment, debt.balance))
      const principal = round2(payment - interest)
      debt.balance = round2(debt.balance - payment)
      if (debt.balance < 0) debt.balance = 0

      scheduleMap.get(debt.id)!.push({
        month,
        date: addMonths(startDate, month).toISOString(),
        payment,
        principal,
        interest,
        balance: debt.balance,
      })
    }

    // Remove paid-off debts and roll their minimums into extraBudget for next month
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].balance <= 0.01) {
        active.splice(i, 1)
      }
    }
  }

  return debts
    .filter(d => d.isActive)
    .map(debt => {
      const months = scheduleMap.get(debt.id) ?? []
      const totalPaid = round2(months.reduce((s, m) => s + m.payment, 0))
      const totalInterest = round2(months.reduce((s, m) => s + m.interest, 0))
      return {
        debt,
        months,
        totalPaid,
        totalInterest,
        payoffDate: months.length > 0 ? months[months.length - 1].date : new Date().toISOString(),
      }
    })
}

export function avalanchePayoff(debts: Debt[], monthlyBudget: number): PayoffSchedule[] {
  // Highest interest rate first
  return multiDebtPayoff(debts, monthlyBudget, (a, b) => b.interestRate - a.interestRate)
}

export function snowballPayoff(debts: Debt[], monthlyBudget: number): PayoffSchedule[] {
  // Lowest balance first
  return multiDebtPayoff(debts, monthlyBudget, (a, b) => a.balance - b.balance)
}

export function comparePayoffMethods(
  debts: Debt[],
  monthlyBudget: number
): {
  avalanche: { totalInterest: number; lastPayoffDate: string }
  snowball: { totalInterest: number; lastPayoffDate: string }
} {
  const av = avalanchePayoff(debts, monthlyBudget)
  const sn = snowballPayoff(debts, monthlyBudget)

  const sumInterest = (schedules: PayoffSchedule[]) =>
    round2(schedules.reduce((s, p) => s + p.totalInterest, 0))

  const lastDate = (schedules: PayoffSchedule[]) =>
    schedules.reduce((latest, p) => (p.payoffDate > latest ? p.payoffDate : latest), '')

  return {
    avalanche: { totalInterest: sumInterest(av), lastPayoffDate: lastDate(av) },
    snowball: { totalInterest: sumInterest(sn), lastPayoffDate: lastDate(sn) },
  }
}

export function calcTotalDebtBalance(debts: Debt[]): number {
  return round2(debts.filter(d => d.isActive).reduce((s, d) => s + d.balance, 0))
}

export function calcTotalMinimumPayments(debts: Debt[]): number {
  return round2(debts.filter(d => d.isActive).reduce((s, d) => s + d.minimumPayment, 0))
}
