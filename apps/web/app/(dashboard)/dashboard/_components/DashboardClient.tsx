'use client'
import { motion } from 'framer-motion'
import type { HealthScoreBreakdown, ExpenseCategory } from '@finance-app/types'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import { HealthScoreCard } from './HealthScoreCard'
import { CashFlowSummary } from './CashFlowSummary'
import { SpendingTrendChart } from './SpendingTrendChart'
import { ExpenseCategoryDonut } from './ExpenseCategoryDonut'
import { QuickActions } from './QuickActions'

interface TrendPoint {
  month: number
  year: number
  totalExpenses: number
  totalIncome: number
}

interface DashboardClientProps {
  healthScore: number
  breakdown: HealthScoreBreakdown
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  month: number
  year: number
  trendData: TrendPoint[]
  byCategory: Record<ExpenseCategory, number>
  greeting: string
  totalMonthlyRecurring: number
}

export function DashboardClient({
  healthScore,
  breakdown,
  totalIncome,
  totalExpenses,
  netCashFlow,
  month,
  year,
  trendData,
  byCategory,
  greeting,
  totalMonthlyRecurring,
}: DashboardClientProps) {
  return (
    <motion.div
      className="max-w-5xl mx-auto px-6 py-8 space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Greeting */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-text-primary">{greeting}</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Here&apos;s your financial snapshot
        </p>
      </motion.div>

      {/* Row 1: Health score + Cash flow */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <HealthScoreCard score={healthScore} breakdown={breakdown} />
        </div>
        <div className="lg:col-span-3">
          <CashFlowSummary
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netCashFlow={netCashFlow}
            month={month}
            year={year}
            totalMonthlyRecurring={totalMonthlyRecurring}
          />
        </div>
      </motion.div>

      {/* Row 2: Trend chart (full width) */}
      <motion.div variants={fadeInUp}>
        <SpendingTrendChart data={trendData} />
      </motion.div>

      {/* Row 3: Donut + Quick actions */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ExpenseCategoryDonut byCategory={byCategory} totalExpenses={totalExpenses} />
        <QuickActions />
      </motion.div>
    </motion.div>
  )
}
