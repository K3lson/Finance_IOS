'use client'
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

interface BarChartProps {
  data: { label: string; actual: number; budgeted?: number }[]
  currency?: string
  height?: number
}

function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
}

function CustomTooltip({ active, payload, label, currency }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string; currency?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-elevated border border-surface-border rounded-xl p-3 shadow-xl text-sm">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-text-primary font-semibold">
          {p.name === 'actual' ? 'Actual' : 'Budget'}: {formatCurrency(p.value, currency)}
        </p>
      ))}
    </div>
  )
}

export function BarChart({ data, currency = 'USD', height = 240 }: BarChartProps) {
  const hasBudgeted = data.some((d) => d.budgeted !== undefined)
  const rechartData = data.map((d) => ({ name: d.label, actual: d.actual, ...(hasBudgeted ? { budgeted: d.budgeted } : {}) }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={rechartData} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#2a2a3a" strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, currency)} width={60} />
        <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600} />
        {hasBudgeted && (
          <Bar dataKey="budgeted" fill="transparent" stroke="#6366f1" strokeDasharray="4 2" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600} />
        )}
      </ReBarChart>
    </ResponsiveContainer>
  )
}
