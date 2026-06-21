'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { StatCard } from '@/components/ui'
import { calcTotalDebtBalance, calcTotalMinimumPayments, formatCurrency } from '@finance-app/core'
import { DebtList } from './DebtList'
import { PayoffComparison } from './PayoffComparison'
import { PayoffScheduleModal } from './PayoffScheduleModal'
import { ExtraPaymentSimulator } from './ExtraPaymentSimulator'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import type { Debt } from '@finance-app/types'

interface DebtsPageClientProps {
  initialDebts: Debt[]
}

export function DebtsPageClient({ initialDebts }: DebtsPageClientProps) {
  const [debts, setDebts] = useState<Debt[]>(initialDebts)
  const [scheduleDebt, setScheduleDebt] = useState<Debt | null>(null)

  const activeDebts = debts.filter((d) => d.isActive && d.balance > 0)
  const totalBalance = calcTotalDebtBalance(activeDebts)
  const totalMinimums = calcTotalMinimumPayments(activeDebts)
  const highestRate = activeDebts.length > 0
    ? Math.max(...activeDebts.map((d) => d.interestRate))
    : 0

  function handleDebtAdded(_debt: Debt) {
    // Server revalidatePath handles the refresh; no client state needed here
    // but if we want instant feedback, we'd push the debt. For now rely on revalidation.
  }

  function handleDebtDeleted(id: string) {
    setDebts((prev) => prev.filter((d) => d.id !== id))
  }

  function handlePaymentRecorded(id: string, newBalance: number) {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, balance: newBalance } : d))
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Debt Tracker</h1>
        <p className="text-text-muted text-sm mt-1">Track balances, plan payoff, and see the path to debt freedom.</p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={fadeInUp}>
          <StatCard
            label="Total Debt"
            value={formatCurrency(totalBalance)}
            animate
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard
            label="Monthly Minimums"
            value={formatCurrency(totalMinimums)}
            animate
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard
            label="Highest Rate"
            value={`${(highestRate * 100).toFixed(2)}%`}
            animate
          />
        </motion.div>
      </motion.div>

      {activeDebts.length >= 2 && <PayoffComparison debts={activeDebts} />}

      <DebtList
        debts={activeDebts}
        onDebtAdded={handleDebtAdded}
        onDebtDeleted={handleDebtDeleted}
        onPaymentRecorded={handlePaymentRecorded}
        onViewSchedule={(debt) => setScheduleDebt(debt)}
      />

      {activeDebts.length >= 1 && <ExtraPaymentSimulator debts={activeDebts} />}

      <PayoffScheduleModal
        debt={scheduleDebt}
        onClose={() => setScheduleDebt(null)}
      />
    </div>
  )
}
