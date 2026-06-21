'use client'

import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/ui'
import { calcTotalMonthlyIncome, calcTotalExpenses, calcNetCashFlow, groupExpensesByCategory } from '@finance-app/core'
import { createClient } from '@/lib/supabase/client'
import { MonthPicker } from './MonthPicker'
import { BudgetSummaryBar } from './BudgetSummaryBar'
import { IncomeSources } from './IncomeSources'
import { ExpenseList } from './ExpenseList'
import { ExpensesByCategoryChart } from './ExpensesByCategoryChart'
import type { IncomeSource, Expense } from '@finance-app/types'

interface BudgetPageClientProps {
  initialIncomeSources: IncomeSource[]
  initialExpenses: Expense[]
  currentMonth: number
  currentYear: number
  initialExpenseModalOpen?: boolean
  initialIncomeFormOpen?: boolean
}

function mapExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    amount: Number(row.amount),
    category: row.category as Expense['category'],
    date: row.date as string,
    isRecurring: row.is_recurring as boolean,
    recurringFrequency: row.recurring_frequency as Expense['recurringFrequency'],
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function BudgetPageClient({
  initialIncomeSources,
  initialExpenses,
  currentMonth,
  currentYear,
  initialExpenseModalOpen = false,
  initialIncomeFormOpen = false,
}: BudgetPageClientProps) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [incomeSources, setIncomeSources] = useState(initialIncomeSources)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [loadingExpenses, setLoadingExpenses] = useState(false)
  const toast = useToast()
  const toastErrorRef = useRef(toast.error)
  toastErrorRef.current = toast.error

  useEffect(() => {
    if (selectedMonth === currentMonth && selectedYear === currentYear) return

    setLoadingExpenses(true)
    const supabase = createClient()
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1
    const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    supabase
      .from('expenses')
      .select('*')
      .gte('date', startDate)
      .lt('date', endDate)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        setLoadingExpenses(false)
        if (error) {
          toastErrorRef.current('Failed to load expenses')
          return
        }
        setExpenses((data ?? []).map(row => mapExpense(row as Record<string, unknown>)))
      })
  }, [selectedMonth, selectedYear, currentMonth, currentYear])

  const totalIncome = calcTotalMonthlyIncome(incomeSources)
  const totalExpenses = calcTotalExpenses(expenses)
  const netCashFlow = calcNetCashFlow(totalIncome, totalExpenses)
  const byCategory = groupExpensesByCategory(expenses)

  function handleMonthChange(month: number, year: number) {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Budget</h1>
          <p className="text-text-secondary text-sm mt-0.5">Track your income and spending</p>
        </div>
        <MonthPicker
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={handleMonthChange}
        />
      </div>

      <BudgetSummaryBar
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netCashFlow={netCashFlow}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeSources
          sources={incomeSources}
          onSourcesChange={setIncomeSources}
          onError={toast.error}
          onSuccess={toast.success}
          defaultOpen={initialIncomeFormOpen}
        />
        <div className={loadingExpenses ? 'opacity-60 pointer-events-none' : ''}>
          <ExpenseList
            expenses={expenses}
            onExpensesChange={setExpenses}
            onError={toast.error}
            onSuccess={toast.success}
            defaultOpen={initialExpenseModalOpen}
          />
        </div>
      </div>

      <ExpensesByCategoryChart
        byCategory={byCategory}
        month={selectedMonth}
        year={selectedYear}
      />
    </div>
  )
}
