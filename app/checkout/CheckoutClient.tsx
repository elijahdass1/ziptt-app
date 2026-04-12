'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/lib/store'
import { formatTTD, DELIVERY_REGIONS } from '@/lib/utils'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { toast } from '@/components/ui/use-toast'
import { TrinidadDeliveryMap } from '@/components/storefront/TrinidadDeliveryMap'
import { IdVerificationGate } from '@/components/checkout/IdVerificationGate'
import Link from 'next/link'
import { MapPin, Shield, Clock } from 'lucide-react'

interface Props {
  userIdVerified: boolean
  userTotalOrders: number
}

export function CheckoutClient({ userIdVerified, userTotalOrders }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, total, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'address' | 'payment' | 'review'>('address')
  const [idVerified, setIdVerified] = useState(userIdVerified)

  const [form, setForm] = useState({
    street: '',
    city: '',
    region: 'Port of Spain' as (typeof DELIVERY_REGIONS)[number],
    notes: '',
    paymentMethod: 'CASH_ON_DELIVERY' as 'CASH_ON_DELIVERY' | 'LINX' | 'ONLINE_BANKING' | 'WIPAY',
  })

  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      toast({ title: 'Payment successful!', description: 'Your WiPay payment was processed successfully.' })
    } else if (payment === 'failed') {
      toast({ title: 'Payment failed', description: 'Your WiPay payment could not be processed. Please try again.', variant: 'destructive' })
    }
  }, [searchParams])

  const subtotal = total()
  const deliveryFee = subtotal >= 500 ? 0 : 50
  const grandTotal = subtotal + deliveryFee
  const needsIdVerification = grandTotal >= 2000 && !idVerified

  const handleSubmit = async () => {
    if (!form.street || !form.city) {
      toast({ title: 'Please fill in your delivery address', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            vendorId: i.vendorId,
          })),
          paymentMethod: form.paymentMethod,
          notes: `Deliver to: ${form.street}, ${form.city}, ${form.region}. ${form.notes}`,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Order failed')
      }
      const { orders } = await res.json()

      if (form.paymentMethod === 'WIPAY') {
        const wipayRes = await fetch('/api/payments/wipay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orders[0].id, total: grandTotal, description: 'zip.tt Order' }),
        })
        if (!wipayRes.ok) throw new Error('WiPay payment initiation failed')
        const { paymentUrl } = await wipayRes.json()
        clearCart()
        window.location.href = paymentUrl
        return
      }

      clearCart()
      router.push(`/orders?success=true`)
      toast({ title: 'Order placed!', description: `Your order has been confirmed. Order #${orders[0].orderNumber}` })
    } catch (err: any) {
      toast({ title: err.message || 'Failed to place order', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-xl font-bold mb-2 text-[#F5F0E8]">Sign in to checkout</h2>
            <p className="text-[#9A8F7A] mb-6">You need to be logged in to place an order.</p>
            <Link href="/auth/login?callbackUrl=/checkout" className="btn-primary">Sign In</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-[#F5F0E8] mb-8" style={{ fontFamily: 'Georgia, serif' }}>
          Checkout
        </h1>

        {/* ID Verification Gate */}
        {needsIdVerification ? (
          <IdVerificationGate onVerified={() => setIdVerified(true)} />
        ) : (
          <>
            {/* Progress steps */}
            <div className="flex items-center gap-4 mb-8">
              {(['address', 'payment', 'review'] as const).map((s, i) => {
                const stepIdx = ['address', 'payment', 'review'].indexOf(step)
                const done = i < stepIdx
                const active = step === s
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      active ? 'bg-[#C9A84C] text-[#0A0A0A]'
                      : done ? 'bg-[#C9A84C]/30 text-[#C9A84C]'
                      : 'bg-[#1A1A1A] text-[#555]'
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-sm font-medium capitalize hidden sm:inline ${active ? 'text-[#F5F0E8]' : 'text-[#555]'}`}>
                      {s}
                    </span>
                    {i < 2 && <div className="w-10 h-px bg-[#333]" />}
                  </div>
                )
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">

                {/* STEP 1: ADDRESS + MAP */}
                {step === 'address' && (
                  <div className="space-y-5">
                    <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 flex gap-3">
                      <Shield className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-200">Delivery available in selected areas only</p>
                        <p className="text-xs text-blue-300/70 mt-0.5">
                          Due to safety considerations, zip.tt currently delivers exclusively to established residential
                          and commercial zones across Trinidad. See the map below for covered areas.
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-[#C9A84C]" />
                        <h3 className="text-sm font-semibold text-[#F5F0E8]">Delivery Coverage Map</h3>
                      </div>
                      <TrinidadDeliveryMap selectedRegion={form.region} />
                    </div>

                    <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-5 space-y-4">
                      <h2 className="text-base font-bold text-[#F5F0E8]">Your Delivery Address</h2>

                      <div>
                        <label className="block text-xs font-medium text-[#9A8F7A] mb-1.5 uppercase tracking-wide">
                          Delivery Region *
                        </label>
                        <select
                          value={form.region}
                          onChange={(e) => setForm({ ...form, region: e.target.value as typeof form.region })}
                          className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-3 py-2.5 text-sm text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                        >
                          {DELIVERY_REGIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <div className="mt-2 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-xs text-green-400 font-medium">
                            {['Port of Spain', 'Westmoorings', 'Maraval', 'Diego Martin', 'Carenage', 'Champ Fleurs', 'Valsayn'].includes(form.region)
                              ? '1–2 business days'
                              : '2–3 business days'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#9A8F7A] mb-1.5 uppercase tracking-wide">
                          Street Address *
                        </label>
                        <input
                          value={form.street}
                          onChange={(e) => setForm({ ...form, street: e.target.value })}
                          placeholder="e.g. 23 Circular Road, Westmoorings"
                          className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-3 py-2.5 text-sm text-[#F5F0E8] placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#9A8F7A] mb-1.5 uppercase tracking-wide">
                          City / Town *
                        </label>
                        <input
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          placeholder="e.g. Port of Spain"
                          className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-3 py-2.5 text-sm text-[#F5F0E8] placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#9A8F7A] mb-1.5 uppercase tracking-wide">
                          Delivery Notes (optional)
                        </label>
                        <textarea
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          rows={2}
                          placeholder="Gate code, landmarks, preferred delivery time..."
                          className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-3 py-2.5 text-sm text-[#F5F0E8] placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent resize-none"
                        />
                      </div>

                      <button
                        onClick={() => setStep('payment')}
                        className="w-full py-3 bg-[#C9A84C] hover:bg-[#F0C040] text-[#0A0A0A] font-bold rounded-xl transition-colors"
                      >
                        Continue to Payment →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: PAYMENT */}
                {step === 'payment' && (
                  <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-5 space-y-4">
                    <h2 className="text-base font-bold text-[#F5F0E8]">Payment Method</h2>
                    <div className="space-y-3">
                      {[
                        {
                          value: 'CASH_ON_DELIVERY',
                          label: 'Cash on Delivery',
                          desc: userTotalOrders === 0 ? 'Pay when you receive your order' : 'Pay when you receive your order',
                          icon: '💵',
                          badge: userTotalOrders === 0 ? 'Recommended for new customers' : null,
                        },
                        { value: 'LINX', label: 'Linx Card', desc: 'Local debit card payment', icon: '💳', badge: null },
                        { value: 'ONLINE_BANKING', label: 'Online Banking', desc: 'Scotiabank, RBC, Republic Bank etc.', icon: '🏦', badge: null },
                        { value: 'WIPAY', label: 'Pay with WiPay', desc: 'Secure card or Linx payment via WiPay', icon: '🔒', badge: null },
                      ].map((method) => (
                        <label
                          key={method.value}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                            form.paymentMethod === method.value
                              ? 'border-[#C9A84C] bg-[#C9A84C]/8'
                              : 'border-[#1E1E1E] hover:border-[#333]'
                          }`}
                        >
                          <input
                            type="radio"
                            value={method.value}
                            checked={form.paymentMethod === method.value as typeof form.paymentMethod}
                            onChange={() => setForm({ ...form, paymentMethod: method.value as typeof form.paymentMethod })}
                            className="hidden"
                          />
                          <span className="text-2xl">{method.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-[#F5F0E8] text-sm">{method.label}</p>
                              {method.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full font-medium">
                                  {method.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#9A8F7A]">{method.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            form.paymentMethod === method.value ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-[#444]'
                          }`}>
                            {form.paymentMethod === method.value && <div className="w-2 h-2 bg-[#0A0A0A] rounded-full" />}
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button onClick={() => setStep('address')} className="flex-1 py-3 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/8 font-semibold rounded-xl transition-colors text-sm">
                        ← Back
                      </button>
                      <button onClick={() => setStep('review')} className="flex-1 py-3 bg-[#C9A84C] hover:bg-[#F0C040] text-[#0A0A0A] font-bold rounded-xl transition-colors">
                        Review Order →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: REVIEW */}
                {step === 'review' && (
                  <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-5 space-y-4">
                    <h2 className="text-base font-bold text-[#F5F0E8]">Review Your Order</h2>

                    <div className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-4 space-y-1 text-sm">
                      <p className="font-semibold text-[#C9A84C] text-xs uppercase tracking-wide">Delivery Address</p>
                      <p className="text-[#F5F0E8]">{form.street}, {form.city}</p>
                      <p className="text-[#9A8F7A]">{form.region}, Trinidad</p>
                      {form.notes && <p className="text-[#555] text-xs mt-1">{form.notes}</p>}
                    </div>

                    <div className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-4 space-y-1 text-sm">
                      <p className="font-semibold text-[#C9A84C] text-xs uppercase tracking-wide">Payment</p>
                      <p className="text-[#F5F0E8]">{form.paymentMethod.replace(/_/g, ' ')}</p>
                    </div>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3">
                          <img src={item.image || ''} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-[#1A1A1A]" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#F5F0E8] truncate">{item.name}</p>
                            <p className="text-xs text-[#9A8F7A]">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-[#C9A84C]">{formatTTD(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button onClick={() => setStep('payment')} className="flex-1 py-3 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/8 font-semibold rounded-xl transition-colors text-sm">
                        ← Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-3 bg-[#C9A84C] hover:bg-[#F0C040] disabled:bg-[#333] disabled:text-[#555] text-[#0A0A0A] font-bold rounded-xl transition-colors"
                      >
                        {loading ? 'Placing Order...' : '✓ Place Order'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ORDER SUMMARY SIDEBAR */}
              <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-5 h-fit space-y-3">
                <h2 className="font-bold text-[#F5F0E8] text-sm uppercase tracking-wide">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-[#9A8F7A]">
                      <span className="truncate">{item.name} ×{item.quantity}</span>
                      <span className="shrink-0 ml-2 text-[#F5F0E8]">{formatTTD(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-[#1E1E1E] pt-3 space-y-1.5">
                    <div className="flex justify-between text-[#9A8F7A] text-sm">
                      <span>Delivery</span>
                      <span className={deliveryFee === 0 ? 'text-green-400 font-medium' : 'text-[#F5F0E8]'}>
                        {deliveryFee === 0 ? 'FREE ✨' : formatTTD(deliveryFee)}
                      </span>
                    </div>
                    {subtotal < 500 && (
                      <p className="text-[10px] text-[#555]">Add {formatTTD(500 - subtotal)} more for free delivery</p>
                    )}
                    <div className="flex justify-between font-bold text-[#F5F0E8] pt-1 text-base">
                      <span>Total</span>
                      <span className="text-[#C9A84C]">{formatTTD(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
