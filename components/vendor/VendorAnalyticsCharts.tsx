'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatTTD, formatDate } from '@/lib/utils'

interface RevenueMonth {
  month: string
  revenue: number
  orders: number
}

interface TopSeller {
  name: string
  unitsSold: number
  revenue: number
}

interface RecentOrder {
  id: string
  total: number
  status: string
  createdAt: string | Date
  itemCount: number
}

interface AnalyticsData {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  orders: {
    total: number
    pending: number
    completed: number
    cancelled: number
  }
  products: {
    total: number
    active: number
    outOfStock: number
  }
  topSellers: TopSeller[]
  revenueByMonth: RevenueMonth[]
  recentOrders: RecentOrder[]
}

const TTDFormatter = (value: number) =>
  new Intl.NumberFormat('en-TT', { style: 'currency', currency: 'TTD', maximumFractionDigits: 0 }).format(value)

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  PROCESSING: 'bg-blue-500/20 text-blue-400',
  SHIPPED: 'bg-indigo-500/20 text-indigo-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
  REFUNDED: 'bg-purple-500/20 text-purple-400',
}

export function VendorAnalyticsCharts({ data }: { data: AnalyticsData }) {
  const { revenue, orders, products, topSellers, revenueByMonth, recentOrders } = data

  const statCards = [
    {
      label: 'Total Revenue',
      value: TTDFormatter(revenue.total),
      sub: `This month: ${TTDFormatter(revenue.thisMonth)}`,
    },
    {
      label: 'Total Orders',
      value: orders.total.toLocaleString(),
      sub: `${orders.completed} completed`,
    },
    {
      label: 'Active Products',
      value: products.active.toLocaleString(),
      sub: `${products.outOfStock} out of stock`,
    },
    {
      label: 'Monthly Growth',
      value: `${revenue.growth > 0 ? '+' : ''}${revenue.growth}%`,
      sub: `vs last month`,
      highlight: revenue.growth > 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl p-5">
            <p className="text-xs text-[#888] mb-1">{card.label}</p>
            <p
              className={`text-2xl font-bold ${
                card.highlight ? 'text-[#C9A84C]' : 'text-[var(--text-primary)]'
              }`}
            >
              {card.value}
            </p>
            <p className="text-xs text-[#555] mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue by month bar chart */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl p-5">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4" style={{ fontFamily: 'Georgia,serif' }}>
          Revenue — Last 6 Months (TTD)
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={revenueByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#888' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#888' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={45}
            />
            <Tooltip
              formatter={(value) => [TTDFormatter((value as number) ?? 0), 'Revenue']}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid #1a1a1a',
                backgroundColor: '#111111',
                color: '#F5F0E8',
              }}
              labelStyle={{ color: '#C9A84C' }}
            />
            <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top sellers + Recent orders row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top sellers */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[var(--bg-card)]">
            <h2 className="font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia,serif' }}>
              Top Sellers
            </h2>
          </div>
          {topSellers.length === 0 ? (
            <div className="p-5 text-sm text-[#888]">No sales data yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--bg-card)]">
                  <th className="px-5 py-2 text-left text-xs font-medium text-[#555] uppercase">#</th>
                  <th className="px-5 py-2 text-left text-xs font-medium text-[#555] uppercase">Product</th>
                  <th className="px-5 py-2 text-right text-xs font-medium text-[#555] uppercase">Units</th>
                  <th className="px-5 py-2 text-right text-xs font-medium text-[#555] uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellers.map((s, i) => (
                  <tr key={s.name} className="border-b border-[var(--bg-card)] last:border-0">
                    <td className="px-5 py-3 text-[#C9A84C] font-bold">{i + 1}</td>
                    <td className="px-5 py-3 text-[var(--text-primary)] truncate max-w-[140px]">{s.name}</td>
                    <td className="px-5 py-3 text-[#888] text-right">{s.unitsSold}</td>
                    <td className="px-5 py-3 text-[var(--text-primary)] font-semibold text-right">{TTDFormatter(s.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[var(--bg-card)]">
            <h2 className="font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia,serif' }}>
              Recent Orders
            </h2>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-5 text-sm text-[#888]">No orders yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--bg-card)]">
                  <th className="px-5 py-2 text-left text-xs font-medium text-[#555] uppercase">Order</th>
                  <th className="px-5 py-2 text-left text-xs font-medium text-[#555] uppercase">Date</th>
                  <th className="px-5 py-2 text-right text-xs font-medium text-[#555] uppercase">Items</th>
                  <th className="px-5 py-2 text-right text-xs font-medium text-[#555] uppercase">Total</th>
                  <th className="px-5 py-2 text-right text-xs font-medium text-[#555] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-[var(--bg-card)] last:border-0">
                    <td className="px-5 py-3 font-mono text-xs text-[#888]">
                      #{o.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#888]">
                      {new Date(o.createdAt).toLocaleDateString('en-TT', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-[#888] text-right">{o.itemCount}</td>
                    <td className="px-5 py-3 text-[var(--text-primary)] font-semibold text-right">{TTDFormatter(o.total)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[o.status] ?? 'bg-[#333] text-[#888]'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
