'use client'

import type { RecurringPayment } from '@finance-app/types'
import { upcomingPayments, formatCurrency, toMonthlyRecurringCost } from '@finance-app/core'
import { Card, Badge } from '@/components/ui'

function formatDateHeading(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

function isOverdue(dateStr: string): boolean {
  return dateStr < new Date().toISOString().split('T')[0]
}

interface UpcomingTimelineProps {
  payments: RecurringPayment[]
}

export function UpcomingTimeline({ payments: allPayments }: UpcomingTimelineProps) {
  const today = new Date()
  const upcoming = upcomingPayments(allPayments, 30, today)

  // Also include overdue payments
  const todayStr = today.toISOString().split('T')[0]
  const overdue = allPayments.filter(p => p.isActive && p.nextDueDate < todayStr)

  const combined = [...overdue, ...upcoming]

  const total30Days = upcoming.reduce((s, p) => s + p.amount, 0)

  // Group by date
  const grouped = new Map<string, RecurringPayment[]>()
  for (const p of combined) {
    const list = grouped.get(p.nextDueDate) ?? []
    list.push(p)
    grouped.set(p.nextDueDate, list)
  }

  const sortedDates = Array.from(grouped.keys()).sort()

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-semibold text-sm">Upcoming (30 days)</h3>
        {upcoming.length > 0 && (
          <span className="text-xs text-text-muted">{formatCurrency(total30Days)} total</span>
        )}
      </div>

      {combined.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-text-muted text-sm">No payments due in the next 30 days.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => {
            const items = grouped.get(date)!
            const over = isOverdue(date)
            const tod = isToday(date)

            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={[
                      'w-1.5 h-1.5 rounded-full',
                      over ? 'bg-danger' : tod ? 'bg-brand' : 'bg-surface-border',
                    ].join(' ')}
                  />
                  <span
                    className={[
                      'text-xs font-semibold',
                      over ? 'text-danger' : tod ? 'text-brand' : 'text-text-muted',
                    ].join(' ')}
                  >
                    {tod ? 'Today' : formatDateHeading(date)}
                  </span>
                  {over && <Badge variant="danger" size="sm">Overdue</Badge>}
                </div>
                <div className="ml-4 space-y-1.5 border-l border-surface-border pl-3">
                  {items.map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">{p.name}</span>
                      <span className="text-text-primary text-sm font-medium">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
