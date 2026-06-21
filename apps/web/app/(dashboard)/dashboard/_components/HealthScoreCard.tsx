'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { HealthScoreBreakdown } from '@finance-app/types'
import { Card, CircularProgress, ProgressBar } from '@/components/ui'
import { staggerContainer, fadeInUp } from '@/lib/animations'

interface HealthScoreCardProps {
  score: number
  breakdown: HealthScoreBreakdown
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Work'
}

function scoreColor(score: number): string {
  if (score >= 75) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function scoreProgressColor(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 75) return 'success'
  if (score >= 50) return 'warning'
  return 'danger'
}

const breakdownRows = [
  { key: 'savingsRate' as const, label: 'Savings Rate', description: 'Save ≥ 20% of income' },
  { key: 'debtRatio' as const, label: 'Debt Ratio', description: 'Keep debt below 15% of annual income' },
  { key: 'cashFlow' as const, label: 'Cash Flow', description: 'Spend less than you earn' },
  { key: 'emergencyFund' as const, label: 'Emergency Fund', description: '6+ months of expenses saved' },
]

export function HealthScoreCard({ score, breakdown }: HealthScoreCardProps) {
  const color = scoreColor(score)
  const progressColor = scoreProgressColor(score)
  const noData = score === 0 && breakdown.savingsRate === 0 && breakdown.debtRatio === 25

  return (
    <Card className="flex flex-col items-center">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-5 self-start">
        Financial Health Score
      </h2>

      {noData ? (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
          <div className="w-20 h-20 rounded-full bg-surface-elevated flex items-center justify-center">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-text-secondary text-sm max-w-[200px]">
            Add income and expenses to see your health score
          </p>
          <Link
            href="/budget"
            className="text-brand text-sm font-semibold hover:text-brand-light transition-colors"
          >
            Set up your budget →
          </Link>
        </div>
      ) : (
        <>
          <CircularProgress
            value={score}
            size={140}
            strokeWidth={10}
            color={color}
            label={String(score)}
            sublabel="/ 100"
            animate
          />
          <p className="mt-3 text-sm font-semibold" style={{ color }}>
            {scoreLabel(score)}
          </p>

          <motion.div
            className="w-full mt-6 space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {breakdownRows.map((row) => {
              const componentScore = breakdown[row.key]
              const pct = (componentScore / 25) * 100
              return (
                <motion.div key={row.key} variants={fadeInUp}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-text-secondary">{row.label}</span>
                    <span className="text-xs font-semibold text-text-primary">
                      {componentScore}<span className="text-text-muted font-normal">/25</span>
                    </span>
                  </div>
                  <ProgressBar value={pct} color={progressColor} size="sm" />
                </motion.div>
              )
            })}
          </motion.div>
        </>
      )}
    </Card>
  )
}
