export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { Package, Clock, CheckCircle, Truck, MapPin } from 'lucide-react'

export const metadata = { title: 'Track My Order â zip.tt' }

export default function TrackingPage() {
  const statuses = [
    { icon: Clock,        color: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'Pending',    desc: 'Your order has been placed and is waiting for the vendor to confirm.' },
    { icon: Package,      color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20',     label: 'Processing', desc: 'The vendor has confirmed your order and is preparing it for dispatch.' },
    { icon: Truck,        color: 'text-purple-400',  bg: 'bg-purple-400/10 border-purple-400/20', label: 'Shipped',    desc: 'Your order has been handed to the courier and is on its way.' },
    { icon: MapPin,       color: 'text-orange-400',  bg: 'bg-orange-400/10 border-orange-400/20', label: 'Out for Delivery', desc: 'The courier is in your area and will deliver your order today.' },
    { icon: CheckCircle,  color: 'text-green-400',   bg: 'bg-green-400/10 border-green-400/20',   label: 'Delivered',  desc: 'Your order has been delivered. Enjoy! ð' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <Package className="h-5 w-5 text-[#C9A84C]" />
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Track My Order</h1>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Keep up with your order every step of the way.
        </p>
      </div>

      {/* CTA */}
      <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-6 text-center space-y-3">
        <p className="font-semibold text-[var(--text-primary)] text-lg">View your orders</p>
        <p className="text-sm text-[var(--text-secondary)]">Sign in to see real-time status updates for all your orders.</p>
        <Link href="/orders"
          className="inline-flex items-center gap-2 bg-[#C9A84C] text-black font-bold px-6 py-2.5 rounded-full hover:bg-[#F0C040] transition-colors text-sm">
          <Package className="h-4 w-4" /> Go to My Orders
        </Link>
      </div>

      {/* Order statuses explained */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Order Status Guide</h2>
        <div className="space-y-3">
          {statuses.map((s) => (
            <div key={s.label} className={`border rounded-xl p-4 flex items-start gap-4 ${s.bg}`}>
              <s.icon className={`h-5 w-5 mt-0.5 shrink-0 ${s.color}`} />
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{s.label}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-2xl p-5 space-y-4 text-sm">
        <p className="font-semibold text-[var(--text-primary)]">Common Questions</p>
        <div>
          <p className="text-[var(--text-primary)] font-medium">My order is still Pending after several hours â is that normal?</p>
          <p className="text-[var(--text-secondary)] mt-1">Vendors usually confirm within a few hours during business hours. If it's been more than 24 hours, <Link href="/help/contact" className="text-[#C9A84C] hover:underline">contact us</Link> and we'll follow up with the vendor.</p>
        </div>
        <div>
          <p className="text-[var(--text-primary)] font-medium">My estimated delivery time has passed â what should I do?</p>
          <p className="text-[var(--text-secondary)] mt-1">Check your order status in My Orders first. If it's still showing "Shipped" past the estimated date, <Link href="/help/contact" className="text-[#C9A84C] hover:underline">contact us</Link> with your order number.</p>
        </div>
        <div>
          <p className="text-[var(--text-primary)] font-medium">Can I change my delivery address after ordering?</p>
          <p className="text-[var(--text-secondary)] mt-1">Address changes are only possible while the order is still in Pending status. Email support@zip.tt immediately with your order number and new address.</p>
        </div>
      </div>
    </div>
  )
}
