'use client'

import { useEffect, useState } from 'react'
import { VendorAnalyticsCharts } from '@/components/vendor/VendorAnalyticsCharts'
import { Loader2 } from 'lucide-react'

interface AnalyticsData {
  revenue: { total: number; thisMonth: number; lastMonth: number; growth: number }
  orders: { total: number; pending: number; completed: number; cancelled: number }
  products: { total: number; active: number; outOfStock: number }
  topSellers: { name: string; unitsSold: number; revenue: number }[]
  revenueByMonth: { month: string; revenue: number; orders: number }[]
  recentOrders: { id: string; total: number; status: string; createdAt: string; itemCount: number }[]
}

export default function VendorAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/vendor/analytics')
        if (!res.ok) {
          const body = await res.json()
          setError(body.error ?? 'Failed to load analytics.')
          return
        }
        const json: AnalyticsData = await res.json()
        setData(json)
      } catch {
        setError('Failed to load analytics. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#111111] border border-red-500/30 rounded-xl p-8 text-center">
        <p className="text-red-400 font-medium">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(''); window.location.reload() }}
          className="mt-4 border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10 px-4 py-2 rounded text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-[#0A0A0A] min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#F5F0E8]" style={{ fontFamily: 'Georgia,serif' }}>
          Analytics
        </h1>
        <p className="text-sm text-[#888] mt-1">Your store performance overview</p>
      </div>

      <VendorAnalyticsCharts data={data} />
    </div>
  )
}
