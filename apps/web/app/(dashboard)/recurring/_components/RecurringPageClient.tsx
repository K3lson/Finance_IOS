'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { RecurringPayment } from '@finance-app/types'
import { calcTotalMonthlyRecurringCost, formatCurrency } from '@finance-app/core'
import { StatCard, ToastProvider, useToast } from '@/components/ui'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import { RecurringList } from './RecurringList'
import { UpcomingTimeline } from './UpcomingTimeline'
import { MonthlyCostBreakdown } from './MonthlyCostBreakdown'

interface RecurringPageClientProps {
  initialPayments: RecurringPayment[]
}

function RecurringPageInner({ initialPayments }: RecurringPageClientProps) {
  const [payments, setPayments] = useState(initialPayments)
  const { error: showError } = useToast()

  const activePayments = payments.filter(p => p.isActive)
  const totalMonthly = calcTotalMonthlyRecurringCost(activePayments)
  const annualTotal = totalMonthly * 12

  function handleAdd(payment: RecurringPayment) {
    setPayments(prev => [payment, ...prev])
  }

  function handleToggle(id: string, isActive: boolean) {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, isActive } : p))
  }

  function handleDelete(id: string) {
    setPayments(prev => prev.filter(p => p.id !== id))
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto px-6 py-8 space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-text-primary">Recurring Payments</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Track subscriptions, bills, and other regular expenses
        </p>
      </motion.div>

      {/* Summary stat cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Monthly Cost"
          value={formatCurrency(totalMonthly)}
          animate
        />
        <StatCard
          label="Active Payments"
          value={String(activePayments.length)}
          animate
        />
        <StatCard
          label="Annual Total"
          value={formatCurrency(annualTotal)}
          animate
        />
      </motion.div>

      {/* Timeline + Breakdown */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UpcomingTimeline payments={payments} />
        <MonthlyCostBreakdown payments={payments} />
      </motion.div>

      {/* Full list */}
      <motion.div variants={fadeInUp}>
        <RecurringList
          payments={payments}
          onAdd={handleAdd}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onError={showError}
        />
      </motion.div>
    </motion.div>
  )
}

export function RecurringPageClient(props: RecurringPageClientProps) {
  return (
    <ToastProvider>
      <RecurringPageInner {...props} />
    </ToastProvider>
  )
}
