'use client'
import { ResponsiveContainer, LineChart, Line } from 'recharts'

interface SparkLineProps {
  data: { value: number }[]
  color?: string
  height?: number
}

export function SparkLine({ data, color = '#6366f1', height = 48 }: SparkLineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive
          animationDuration={600}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
