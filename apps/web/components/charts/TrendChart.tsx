'use client'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

interface TrendChartProps {
  data: { label: string; income: number; expenses: number }[]
  height?: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-elevated border border-surface-border rounded-xl p-3 shadow-xl text-sm space-y-1">
      <p className="text-text-secondary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-text-muted capitalize">{p.name}:</span>
          <span className="text-text-primary font-semibold">
            ${p.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TrendChart({ data, height = 220 }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#2a2a3a" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2a2a3a', strokeWidth: 1 }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }}
        />
        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#incomeGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
          isAnimationActive
          animationDuration={700}
          animationEasing="ease-out"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#expensesGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
          isAnimationActive
          animationDuration={700}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
