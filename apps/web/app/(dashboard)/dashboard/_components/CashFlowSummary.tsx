'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { StatCard, Card } from '@/components/ui'
import { formatCurrency, formatPercent } from '@finance-app/core'
import { staggerContainer, fadeInUp } from '@/lib/animations'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface CashFlowSummaryProps {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  month: number
  year: number
  totalMonthlyRecurring?: number
}

export function CashFlowSummary({
  totalIncome,
  totalExpenses,
  netCashFlow,
  month,
  year,
  totalMonthlyRecurring = 0,
}: CashFlowSummaryProps) {
  const isPositive = netCashFlow >= 0
  const savingsRate = totalIncome > 0 ? Math.max(0, netCashFlow) / totalIncome : 0
  const expensePct = totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome) * 100) : 0
  const isOverspending = totalExpenses > totalIncome && totalIncome > 0

  const savingsRateColor =
    savingsRate >= 0.2 ? 'text-success' : savingsRate >= 0.1 ? 'text-warning' : 'text-danger'

  const noData = totalIncome === 0 && totalExpenses === 0

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Cash Flow
          </h2>
          <p className="text-text-primary font-semibold mt-0.5">
            {MONTH_NAMES[month - 1]} {year}
          </p>
        </div>
        {!isPositive && !noData && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-danger-muted text-danger">
            Overspending
          </span>
        )}
      </div>

      {noData ? (
        <div className="flex flex-col items-center py-6 text-center gap-3">
          <span className="text-4xl">💸</span>
          <p className="text-text-secondary text-sm">
            No income or expenses yet this month.
          </p>
          <Link
            href="/budget"
            className="text-sm font-semibold text-brand hover:text-brand-light transition-colors"
          >
            Add your first entry →
          </Link>
        </div>
      ) : (
        <>
          <motion.div
            className="grid grid-cols-3 gap-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp}>
              <StatCard
                label="Income"
                value={formatCurrency(totalIncome)}
                trend="up"
                animate
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                label="Expenses"
                value={formatCurrency(totalExpenses)}
                trend="down"
                animate
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                label="Net"
                value={formatCurrency(netCashFlow)}
                trend={isPositive ? 'up' : 'down'}
                animate
              />
            </motion.div>
          </motion.div>

          {/* Income vs expenses bar */}
          <div>
            <div className="flex justify-between text-xs text-text-muted mb-1.5">
              <span>Expenses</span>
              <span>{expensePct.toFixed(0)}% of income</span>
            </div>
            <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isOverspending ? 'bg-danger' : 'bg-success'}`}
                initial={{ width: '0%' }}
                animate={{ width: `${expensePct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Savings rate */}
          {totalIncome > 0 && (
            <p className="text-sm text-text-secondary">
              You&apos;re saving{' '}
              <span className={`font-semibold ${savingsRateColor}`}>
                {formatPercent(savingsRate)}
              </span>{' '}
              of your income this month
              {savingsRate >= 0.2 && ' 🎉'}
            </p>
          )}

          {/* Recurring fixed costs */}
          {totalMonthlyRecurring > 0 && (
            <p className="text-xs text-text-muted">
              Fixed costs:{' '}
              <span className="font-medium text-text-secondary">
                {formatCurrency(totalMonthlyRecurring)}/month
              </span>{' '}
              recurring
            </p>
          )}
        </>
      )}
    </Card>
  )
}
