'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatTTD } from '@/lib/utils'

interface SalesChartProps { vendorId: string }

export function SalesChart({ vendorId }: SalesChartProps) {
  const [data, setData] = useState<{ date: string; revenue: number; orders: number }[]>([])

  useEffect(() => {
    // Generate mock 30-day data for demo
    const days: typeof data = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({
        date: d.toLocaleDateString('en-TT', { month: 'short', day: 'numeric' }),
        revenue: Math.round(Math.random() * 3000 + 200),
        orders: Math.round(Math.random() * 8 + 1),
      })
    }
    setData(days)
  }, [vendorId])

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D62828" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#D62828" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={6} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value) => [`${formatTTD((value as number) ?? 0)}`, 'Revenue']}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#D62828" strokeWidth={2} fill="url(#revenue)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
