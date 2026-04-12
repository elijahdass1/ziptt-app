'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  vendor: { storeName: string }
}

interface Props {
  preselectedOrderId?: string
  onClose?: () => void
}

const REASONS = [
  'Item not received',
  'Item damaged',
  'Wrong item sent',
  'Not as described',
  'Other',
]

const RESOLUTIONS = ['Refund', 'Replacement', 'Other']

export function DisputeForm({ preselectedOrderId, onClose }: Props) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [orderId, setOrderId] = useState(preselectedOrderId ?? '')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [resolution, setResolution] = useState('Refund')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data: Order[] = await res.json()
          const eligible = data.filter(
            (o) => o.status === 'CONFIRMED' || o.status === 'DELIVERED'
          )
          setOrders(eligible)
          if (preselectedOrderId && !orderId) {
            setOrderId(preselectedOrderId)
          } else if (eligible.length > 0 && !orderId) {
            setOrderId(eligible[0].id)
          }
        }
      } finally {
        setLoadingOrders(false)
      }
    }
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!orderId || !reason || !description.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason, description, requestedResolution: resolution }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to open dispute.')
        return
      }
      toast({ title: 'Dispute opened successfully' })
      router.refresh()
      onClose?.()
    } catch {
      setError('Failed to open dispute. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-[#F5F0E8]" style={{ fontFamily: 'Georgia,serif' }}>
        Open a Dispute
      </h2>

      <div>
        <label className="block text-xs text-[#888] mb-1">Order <span className="text-red-400">*</span></label>
        {loadingOrders ? (
          <div className="text-[#888] text-sm py-2">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="text-[#888] text-sm py-2">
            No eligible orders found. Only confirmed or delivered orders can have disputes.
          </div>
        ) : (
          <select
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            className="w-full bg-[#0A0A0A] border border-[#333] text-[#F5F0E8] focus:border-[#C9A84C] focus:outline-none rounded px-3 py-2 text-sm"
          >
            <option value="">Select an order…</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.orderNumber.slice(-8).toUpperCase()} — {o.vendor.storeName} ({o.status})
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-xs text-[#888] mb-1">Reason <span className="text-red-400">*</span></label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          className="w-full bg-[#0A0A0A] border border-[#333] text-[#F5F0E8] focus:border-[#C9A84C] focus:outline-none rounded px-3 py-2 text-sm"
        >
          <option value="">Select a reason…</option>
          {REASONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-[#888] mb-1">Description <span className="text-red-400">*</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          placeholder="Describe the issue in detail…"
          className="w-full bg-[#0A0A0A] border border-[#333] text-[#F5F0E8] focus:border-[#C9A84C] focus:outline-none rounded px-3 py-2 text-sm placeholder:text-[#555] resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-[#888] mb-1">Requested Resolution</label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="w-full bg-[#0A0A0A] border border-[#333] text-[#F5F0E8] focus:border-[#C9A84C] focus:outline-none rounded px-3 py-2 text-sm"
        >
          {RESOLUTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting || loadingOrders}
          className="bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#b8963f] font-semibold px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting…' : 'Open Dispute'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10 px-4 py-2 rounded text-sm transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
