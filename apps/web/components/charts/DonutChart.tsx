'use client'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

interface DonutChartProps {
  data: { label: string; value: number; color?: string }[]
  total?: number
  centerLabel?: string
  height?: number
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-elevated border border-surface-border rounded-xl p-3 shadow-xl text-sm">
      <p className="text-text-primary font-semibold">{payload[0].name}</p>
      <p className="text-text-secondary">${payload[0].value.toLocaleString()}</p>
    </div>
  )
}

export function DonutChart({ data, total, centerLabel, height = 240 }: DonutChartProps) {
  const rechartData = data.map((d) => ({ name: d.label, value: d.value, fill: d.color }))
  const displayTotal = total ?? data.reduce((s, d) => s + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={rechartData}
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          paddingAngle={2}
          dataKey="value"
          isAnimationActive
          animationDuration={600}
          animationEasing="ease-out"
        >
          {rechartData.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={entry.fill ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {centerLabel && (
          <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" fill="#f1f5f9" fontSize={14} fontWeight={700}>
            {centerLabel}
          </text>
        )}
        <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize={12}>
          ${displayTotal.toLocaleString()}
        </text>
      </PieChart>
    </ResponsiveContainer>
  )
}
