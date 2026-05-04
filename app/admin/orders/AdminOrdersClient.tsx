'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatTTD } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Phone, Truck, RefreshCcw, Search } from 'lucide-react'

type AdminOrder = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  phone: string | null
  instructions: string | null
  driverId: string | null
  assignedAt: string | null
  deliveredAt: string | null
  createdAt: string
  vendor: { id: string; storeName: string }
  address: { street: string; city: string; region: string } | null
  customer: { id: string; name: string | null; email: string | null; phone: string | null }
  items: { quantity: number; product: { name: string } }[]
  driver: { id: string; name: string | null; email: string | null; phone: string | null } | null
}

type Driver = { id: string; name: string | null; email: string | null; phone: string | null }

const STATUS_OPTIONS = [
  'PENDING',
  'PROCESSING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const

const FILTER_STATUSES = ['ALL', ...STATUS_OPTIONS] as const

export function AdminOrdersClient() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<typeof FILTER_STATUSES[number]>('ALL')
  const [driverFilter, setDriverFilter] = useState<'ALL' | 'UNASSIGNED'>('ALL')
  const [q, setQ] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') params.set('status', filter)
      if (driverFilter === 'UNASSIGNED') params.set('driver', 'null')
      if (q.trim()) params.set('q', q.trim())
      const res = await fetch(`/api/admin/orders?${params}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load orders')
      const data = await res.json()
      setOrders(data.orders ?? [])
    } catch (e: any) {
      toast({ title: 'Could not load orders', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [filter, driverFilter, q])

  // Fetch drivers once.
  useEffect(() => {
    fetch('/api/admin/drivers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setDrivers(d.drivers ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function assign(orderId: string, driverId: string | null) {
    setBusyId(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Assign failed')
      toast({ title: driverId ? 'Driver assigned' : 'Driver removed' })
      await load()
    } catch (e: any) {
      toast({ title: 'Assign failed', description: e.message, variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  async function setStatus(orderId: string, status: string) {
    setBusyId(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Update failed')
      toast({ title: `Status set to ${status.replace(/_/g, ' ')}` })
      await load()
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Assign drivers, update status, and contact customers directly.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              placeholder="Order #, customer name or email"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof FILTER_STATUSES[number])}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {FILTER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Driver</label>
          <select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value as 'ALL' | 'UNASSIGNED')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="ALL">All</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
        </div>
      </div>

      {/* Orders */}
      {loading && orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No orders match the current filters.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <article
              key={o.id}
              className="bg-white border border-gray-200 rounded-xl p-4 grid lg:grid-cols-[1fr_320px] gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-gray-500">
                    #{o.orderNumber.slice(0, 8)}
                  </span>
                  <span className={statusPill(o.status)}>{o.status.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-sm font-semibold text-gray-900">{formatTTD(o.total)}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(o.createdAt).toLocaleString('en-TT', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">Customer</p>
                    <p className="text-gray-900 font-medium">{o.customer.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{o.customer.email}</p>
                    {(o.phone || o.customer.phone) && (
                      <a
                        href={`tel:${o.phone || o.customer.phone}`}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700 hover:underline"
                      >
                        <Phone size={11} /> {o.phone || o.customer.phone}
                      </a>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">Vendor</p>
                    <p className="text-gray-900 font-medium">{o.vendor.storeName}</p>
                    {o.address && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        → {o.address.street}, {o.address.city}, {o.address.region}
                      </p>
                    )}
                  </div>
                </div>

                {o.instructions && (
                  <p className="text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                    <span className="font-semibold text-amber-700">Instructions:</span>{' '}
                    {o.instructions}
                  </p>
                )}

                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700">
                    {o.items.length} item{o.items.length !== 1 ? 's' : ''}
                  </summary>
                  <ul className="mt-1 space-y-0.5">
                    {o.items.map((it, i) => (
                      <li key={i}>
                        {it.quantity} × {it.product.name}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>

              {/* Controls */}
              <div className="space-y-3 lg:border-l lg:border-gray-200 lg:pl-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <Truck size={11} /> Driver
                  </label>
                  <select
                    value={o.driverId ?? ''}
                    onChange={(e) => assign(o.id, e.target.value || null)}
                    disabled={busyId === o.id || o.status === 'DELIVERED' || o.status === 'CANCELLED'}
                    className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">— Unassigned —</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name || d.email}
                      </option>
                    ))}
                  </select>
                  {o.driver && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      Assigned to{' '}
                      <span className="font-medium text-gray-700">
                        {o.driver.name || o.driver.email}
                      </span>
                      {o.driver.phone && (
                        <>
                          {' '}
                          ·{' '}
                          <a
                            href={`tel:${o.driver.phone}`}
                            className="text-amber-700 hover:underline"
                          >
                            {o.driver.phone}
                          </a>
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                    disabled={busyId === o.id}
                    className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {(o.phone || o.customer.phone) && (
                  <a
                    href={`tel:${o.phone || o.customer.phone}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Phone size={13} /> Call Customer
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function statusPill(status: string) {
  const base = 'text-[11px] font-semibold px-2 py-0.5 rounded-full border'
  switch (status) {
    case 'PENDING':
      return `${base} bg-yellow-50 border-yellow-200 text-yellow-700`
    case 'PROCESSING':
      return `${base} bg-blue-50 border-blue-200 text-blue-700`
    case 'OUT_FOR_DELIVERY':
      return `${base} bg-amber-50 border-amber-200 text-amber-700`
    case 'DELIVERED':
      return `${base} bg-green-50 border-green-200 text-green-700`
    case 'CANCELLED':
      return `${base} bg-gray-50 border-gray-200 text-gray-600`
    case 'REFUNDED':
      return `${base} bg-rose-50 border-rose-200 text-rose-700`
    default:
      return `${base} bg-gray-50 border-gray-200 text-gray-700`
  }
}
