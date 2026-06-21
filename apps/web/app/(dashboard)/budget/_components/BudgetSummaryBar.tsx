'use client'

import { motion } from 'framer-motion'
import { StatCard } from '@/components/ui'
import { formatCurrency } from '@finance-app/core'
import { staggerContainer, fadeInUp } from '@/lib/animations'

interface BudgetSummaryBarProps {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
}

export function BudgetSummaryBar({ totalIncome, totalExpenses, netCashFlow }: BudgetSummaryBarProps) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp}>
        <StatCard
          label="Total Income"
          value={formatCurrency(totalIncome)}
          trend="up"
          animate
        />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          trend={totalExpenses > 0 ? 'down' : 'neutral'}
          animate
        />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <StatCard
          label="Net Cash Flow"
          value={formatCurrency(netCashFlow)}
          trend={netCashFlow > 0 ? 'up' : netCashFlow < 0 ? 'down' : 'neutral'}
          animate
        />
      </motion.div>
    </motion.div>
  )
}
