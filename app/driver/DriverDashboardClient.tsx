'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatTTD } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Phone, MapPin, Package, RefreshCcw, CheckCircle2, Clock } from 'lucide-react'

type DriverOrder = {
  id: string
  orderNumber: string
  status: string
  total: number
  phone: string | null
  instructions: string | null
  assignedAt: string | null
  createdAt: string
  vendor: {
    id: string
    storeName: string
    phone: string | null
    address: string | null
    region: string | null
  }
  address: { street: string; city: string; region: string } | null
  customer: { name: string | null; phone: string | null }
  items: { quantity: number; product: { name: string } }[]
}

export function DriverDashboardClient({ driverName }: { driverName: string }) {
  const [tab, setTab] = useState<'available' | 'mine'>('mine')
  const [orders, setOrders] = useState<DriverOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async (scope: 'available' | 'mine') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/driver/orders?scope=${scope}`, { cache: 'no-store' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to load orders')
      }
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch (e: any) {
      toast({ title: 'Could not load orders', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(tab)
  }, [tab, load])

  // Poll every 30s so drivers see new available orders without refresh.
  useEffect(() => {
    if (tab !== 'available') return
    const id = setInterval(() => load('available'), 30_000)
    return () => clearInterval(id)
  }, [tab, load])

  async function accept(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/driver/orders/${id}/accept`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not accept order')
      toast({ title: 'Order accepted', description: 'It moved to your active deliveries.' })
      // Refresh both lists; user is on Available, but Mine just changed too.
      await load(tab)
    } catch (e: any) {
      toast({ title: 'Accept failed', description: e.message, variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  async function deliver(id: string) {
    if (!confirm('Mark this order as delivered? This cannot be undone.')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/driver/orders/${id}/deliver`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not mark delivered')
      toast({ title: 'Marked as delivered' })
      await load(tab)
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8]">
      <header className="border-b border-[#1A1A1A] px-4 sm:px-6 py-4 sticky top-0 bg-[#0A0A0A]/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#9A8F7A]">zip.tt Driver</p>
            <h1 className="text-lg font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              {driverName}
            </h1>
          </div>
          <button
            onClick={() => load(tab)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#C9A84C]/30 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/10 disabled:opacity-50"
          >
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-2 mb-6">
          {(['mine', 'available'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                tab === t
                  ? 'bg-[#C9A84C] text-[#0A0A0A]'
                  : 'bg-[#111] text-[#9A8F7A] border border-[#1A1A1A] hover:text-[#F5F0E8]'
              }`}
            >
              {t === 'mine' ? 'My Deliveries' : 'Available'}
            </button>
          ))}
        </div>

        {loading && orders.length === 0 ? (
          <div className="text-center py-16 text-[#9A8F7A]">
            <div className="inline-block w-6 h-6 border-2 border-[#C9A84C] border-b-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm">Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-[#9A8F7A]">
            <Package size={36} className="mx-auto mb-3 text-[#2A2A2A]" strokeWidth={1.2} />
            <p className="text-sm">
              {tab === 'mine'
                ? 'No active deliveries. Check the Available tab to claim one.'
                : 'No orders waiting for pickup right now. We poll every 30s.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <article
                key={o.id}
                className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#9A8F7A] uppercase tracking-wide">
                      Order #{o.orderNumber.slice(0, 8)}
                    </p>
                    <p className="text-sm text-[#F5F0E8] font-semibold mt-0.5">
                      {formatTTD(o.total)} · {o.items.reduce((s, i) => s + i.quantity, 0)} item
                      {o.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                      o.status === 'OUT_FOR_DELIVERY'
                        ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                        : 'bg-blue-500/15 text-blue-300'
                    }`}
                  >
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wide text-[#9A8F7A] mb-1">
                      Pickup from
                    </p>
                    <p className="text-[#F5F0E8] font-medium">{o.vendor.storeName}</p>
                    <p className="text-[#9A8F7A] text-xs">
                      {[o.vendor.address, o.vendor.region].filter(Boolean).join(', ') || 'Address pending'}
                    </p>
                    {o.vendor.phone && (
                      <a
                        href={`tel:${o.vendor.phone}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#C9A84C] hover:underline"
                      >
                        <Phone size={12} /> {o.vendor.phone}
                      </a>
                    )}
                  </div>

                  <div className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wide text-[#9A8F7A] mb-1">
                      Deliver to
                    </p>
                    <p className="text-[#F5F0E8] font-medium">{o.customer.name ?? 'Customer'}</p>
                    {o.address ? (
                      <p className="text-[#9A8F7A] text-xs">
                        {o.address.street}, {o.address.city}, {o.address.region}
                      </p>
                    ) : (
                      <p className="text-[#9A8F7A] text-xs italic">
                        See order notes for address
                      </p>
                    )}
                    {(o.phone ?? o.customer.phone) && (
                      <a
                        href={`tel:${o.phone ?? o.customer.phone}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#C9A84C] hover:underline"
                      >
                        <Phone size={12} /> {o.phone ?? o.customer.phone}
                      </a>
                    )}
                  </div>
                </div>

                {o.instructions && (
                  <div className="bg-[#0A0A0A] border border-[#C9A84C]/20 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-wide text-[#C9A84C] mb-1 flex items-center gap-1">
                      <MapPin size={11} /> Instructions
                    </p>
                    <p className="text-sm text-[#F5F0E8] whitespace-pre-wrap">{o.instructions}</p>
                  </div>
                )}

                <details className="text-sm">
                  <summary className="cursor-pointer text-xs text-[#9A8F7A] hover:text-[#F5F0E8]">
                    Items ({o.items.length})
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs text-[#9A8F7A]">
                    {o.items.map((it, i) => (
                      <li key={i}>
                        {it.quantity} × {it.product.name}
                      </li>
                    ))}
                  </ul>
                </details>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#555]">
                    <Clock size={11} />
                    {o.assignedAt
                      ? `Accepted ${new Date(o.assignedAt).toLocaleTimeString('en-TT', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}`
                      : `Placed ${new Date(o.createdAt).toLocaleTimeString('en-TT', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}`}
                  </div>
                  {tab === 'available' ? (
                    <button
                      onClick={() => accept(o.id)}
                      disabled={busyId === o.id}
                      className="px-4 py-2 bg-[#C9A84C] hover:bg-[#F0C040] disabled:bg-[#333] disabled:text-[#555] text-[#0A0A0A] text-sm font-bold rounded-lg transition-colors"
                    >
                      {busyId === o.id ? 'Accepting…' : 'Accept Order'}
                    </button>
                  ) : (
                    <button
                      onClick={() => deliver(o.id)}
                      disabled={busyId === o.id}
                      className="px-4 py-2 bg-green-500 hover:bg-green-400 disabled:bg-[#333] disabled:text-[#555] text-[#0A0A0A] text-sm font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      {busyId === o.id ? 'Saving…' : 'Mark Delivered'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
