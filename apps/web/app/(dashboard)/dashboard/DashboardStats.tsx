'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { StatCard, Card } from '@/components/ui'
import { formatCurrency } from '@finance-app/core'
import { staggerContainer, fadeInUp } from '@/lib/animations'

interface DashboardStatsProps {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
}

export function DashboardStats({ totalIncome, totalExpenses, netCashFlow }: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp}>
          <StatCard
            label="Total Income"
            value={formatCurrency(totalIncome)}
            trend={totalIncome > 0 ? 'up' : 'neutral'}
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

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp}>
          <Link href="/budget">
            <Card hoverable className="cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-text-primary">Monthly Budget</h2>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-muted">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-text-muted text-sm">
                {totalExpenses > 0
                  ? `${formatCurrency(totalExpenses)} spent this month`
                  : 'Add your income and expenses to see your budget breakdown.'}
              </p>
            </Card>
          </Link>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Link href="/debts">
            <Card hoverable className="cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-text-primary">Debt Tracker</h2>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-muted">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-text-muted text-sm">Track your debts and see your payoff timeline — built next.</p>
            </Card>
          </Link>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Link href="/goals">
            <Card hoverable className="cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-text-primary">Savings Goals</h2>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-muted">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-text-muted text-sm">Set goals and watch your progress animate toward completion.</p>
            </Card>
          </Link>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <Link href="/recurring">
            <Card hoverable className="cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-text-primary">Recurring Payments</h2>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-muted">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-text-muted text-sm">See all your subscriptions and recurring bills at a glance.</p>
            </Card>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
