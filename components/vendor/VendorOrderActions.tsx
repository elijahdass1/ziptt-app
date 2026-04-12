'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

const TRANSITIONS: Record<string, { label: string; next: string; color: string }> = {
  PENDING: { label: 'Confirm Order', next: 'CONFIRMED', color: 'bg-blue-600 text-white hover:bg-blue-700' },
  CONFIRMED: { label: 'Mark Processing', next: 'PROCESSING', color: 'bg-purple-600 text-white hover:bg-purple-700' },
  PROCESSING: { label: 'Mark Shipped', next: 'SHIPPED', color: 'bg-indigo-600 text-white hover:bg-indigo-700' },
  SHIPPED: { label: 'Mark Delivered', next: 'DELIVERED', color: 'bg-green-600 text-white hover:bg-green-700' },
}

export function VendorOrderActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const transition = TRANSITIONS[currentStatus]

  if (!transition) return <span className="text-sm text-gray-400">No actions available</span>

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/vendor/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: transition.next }),
      })
      if (!res.ok) throw new Error()
      toast({ title: `Order ${transition.next.toLowerCase()}!` })
      router.refresh()
    } catch {
      toast({ title: 'Failed to update order', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/vendor/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Order cancelled' })
      router.refresh()
    } catch {
      toast({ title: 'Failed to cancel order', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleUpdate} disabled={loading}
        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${transition.color} disabled:opacity-60`}>
        {loading ? 'Updating...' : transition.label}
      </button>
      {['PENDING', 'CONFIRMED'].includes(currentStatus) && (
        <button onClick={handleCancel} disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
          Cancel Order
        </button>
      )}
    </div>
  )
}
