'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui'
import { avalanchePayoff, calcTotalMinimumPayments, formatCurrency, formatMonthYear, formatMonthDuration } from '@finance-app/core'
import type { Debt } from '@finance-app/types'

interface ExtraPaymentSimulatorProps {
  debts: Debt[]
}

export function ExtraPaymentSimulator({ debts }: ExtraPaymentSimulatorProps) {
  const activeDebts = debts.filter((d) => d.isActive && d.balance > 0)
  const [extraPayment, setExtraPayment] = useState(0)

  const monthlyBudget = calcTotalMinimumPayments(activeDebts)

  const baseline = useMemo(() => {
    if (activeDebts.length === 0) return null
    const schedules = avalanchePayoff(activeDebts, monthlyBudget)
    const totalInterest = schedules.reduce((s, p) => s + p.totalInterest, 0)
    const maxMonths = Math.max(...schedules.map((p) => p.months.length))
    const lastPayoffDate = schedules.reduce(
      (latest, p) => (p.payoffDate > latest ? p.payoffDate : latest),
      ''
    )
    return { totalInterest, maxMonths, lastPayoffDate }
  }, [activeDebts, monthlyBudget])

  const withExtra = useMemo(() => {
    if (activeDebts.length === 0 || extraPayment === 0) return baseline
    const schedules = avalanchePayoff(activeDebts, monthlyBudget + extraPayment)
    const totalInterest = schedules.reduce((s, p) => s + p.totalInterest, 0)
    const maxMonths = Math.max(...schedules.map((p) => p.months.length))
    const lastPayoffDate = schedules.reduce(
      (latest, p) => (p.payoffDate > latest ? p.payoffDate : latest),
      ''
    )
    return { totalInterest, maxMonths, lastPayoffDate }
  }, [activeDebts, monthlyBudget, extraPayment])

  if (activeDebts.length === 0 || !baseline || !withExtra) return null

  const monthsSaved = baseline.maxMonths - withExtra.maxMonths
  const interestSaved = baseline.totalInterest - withExtra.totalInterest

  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Extra Payment Simulator</h2>
        <p className="text-sm text-text-muted mt-0.5">What if you paid more each month?</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Extra monthly payment</span>
          <span className="font-semibold text-brand">{formatCurrency(extraPayment)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={500}
          step={25}
          value={extraPayment}
          onChange={(e) => setExtraPayment(parseInt(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>$0</span>
          <span>$500</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-elevated rounded-xl p-4">
          <p className="text-xs text-text-muted mb-1">Months saved</p>
          <p className={`text-2xl font-bold ${monthsSaved > 0 ? 'text-success' : 'text-text-muted'}`}>
            {monthsSaved > 0 ? `−${formatMonthDuration(monthsSaved)}` : '—'}
          </p>
        </div>
        <div className="bg-surface-elevated rounded-xl p-4">
          <p className="text-xs text-text-muted mb-1">Interest saved</p>
          <p className={`text-2xl font-bold ${interestSaved > 0 ? 'text-success' : 'text-text-muted'}`}>
            {interestSaved > 0.01 ? formatCurrency(interestSaved) : '—'}
          </p>
        </div>
      </div>

      <div className="text-sm text-text-secondary bg-surface-elevated rounded-xl p-3">
        {extraPayment > 0 ? (
          <>
            With an extra <span className="font-semibold text-brand">{formatCurrency(extraPayment)}/mo</span>, you&apos;ll be
            debt-free by{' '}
            <span className="font-semibold text-text-primary">{formatMonthYear(withExtra.lastPayoffDate)}</span>
            {monthsSaved > 0 && (
              <> — that&apos;s <span className="font-semibold text-success">{formatMonthDuration(monthsSaved)} sooner</span></>
            )}.
          </>
        ) : (
          <>
            At minimum payments only, debt-free by{' '}
            <span className="font-semibold text-text-primary">{formatMonthYear(baseline.lastPayoffDate)}</span>.
            Drag the slider to see how extra payments help.
          </>
        )}
      </div>
    </Card>
  )
}
