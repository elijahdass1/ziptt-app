'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/store'
import { formatTTD } from '@/lib/utils'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store, Banknote, CreditCard, Building2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function CartPage() {
  // Prevent hydration mismatch - Zustand reads from localStorage only on client
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { items, removeItem, updateQuantity, total } = useCartStore()
  const subtotal = total()
  const deliveryFee = subtotal >= 500 ? 0 : 50
  const grandTotal = subtotal + deliveryFee

  // Group by vendor
  const byVendor = items.reduce((acc, item) => {
    if (!acc[item.vendorId]) acc[item.vendorId] = { name: item.vendorName, items: [] }
    acc[item.vendorId].items.push(item)
    return acc
  }, {} as Record<string, { name: string; items: typeof items }>)

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-[#F5F0E8] mb-6 flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-[#C9A84C]" /> Shopping Cart
          {mounted && (
            <span className="text-sm font-normal text-[#9A8F7A]">({items.length} item{items.length !== 1 ? 's' : ''})</span>
          )}
        </h1>

        {!mounted ? (
          /* Loading skeleton */
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#111111] border border-[#C9A84C]/10 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex items-center justify-center mb-4">
              <span className="h-20 w-20 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
                <ShoppingBag className="h-9 w-9 text-[#C9A84C]" />
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#F5F0E8] mb-2">Your cart is empty</h2>
            <p className="text-[#9A8F7A] mb-6">Browse our marketplace and add some items!</p>
            <Link href="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {Object.entries(byVendor).map(([vendorId, { name, items: vendorItems }]) => (
                <div key={vendorId} className="bg-[#111111] border border-[#C9A84C]/10 rounded-2xl overflow-hidden">
                  <div className="bg-[#1A1A1A] border-b border-[#C9A84C]/10 px-4 py-2.5">
                    <p className="text-sm font-semibold text-[#F5F0E8]"><Store size={13} strokeWidth={1.5} className="inline mr-1" />{name}</p>
                  </div>
                  <div className="divide-y divide-[#C9A84C]/10">
                    {vendorItems.map((item) => (
                      <div key={item.productId} className="flex gap-4 p-4">
                        <img src={item.image || '/placeholder.png'} alt={item.name}
                          className="w-20 h-20 rounded-xl object-cover bg-[#1A1A1A] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#F5F0E8] line-clamp-2">{item.name}</h3>
                          <p className="text-sm font-bold text-[#C9A84C] mt-1">{formatTTD(item.price)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-[#C9A84C]/20 rounded-lg overflow-hidden">
                              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="p-1.5 hover:bg-[#1A1A1A] text-[#F5F0E8] transition-colors">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="px-3 py-1 text-sm font-semibold text-[#F5F0E8]">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="p-1.5 hover:bg-[#1A1A1A] text-[#F5F0E8] transition-colors" disabled={item.quantity >= item.stock}>
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button onClick={() => removeItem(item.productId)}
                              className="text-[#9A8F7A] hover:text-red-400 transition-colors p-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <span className="ml-auto text-sm font-bold text-[#F5F0E8]">
                              {formatTTD(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="space-y-4">
              <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-5 space-y-4">
                <h2 className="font-bold text-[#F5F0E8]">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#9A8F7A]">
                    <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                    <span className="text-[#F5F0E8]">{formatTTD(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#9A8F7A]">
                    <span>Delivery</span>
                    <span className={deliveryFee === 0 ? 'text-green-400 font-medium' : 'text-[#F5F0E8]'}>
                      {deliveryFee === 0 ? 'FREE' : formatTTD(deliveryFee)}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-xs text-[#9A8F7A]/70">Add {formatTTD(500 - subtotal)} more for free delivery</p>
                  )}
                  <div className="border-t border-[#C9A84C]/15 pt-2">
                    <div className="flex justify-between font-bold text-[#F5F0E8] text-base">
                      <span>Total</span>
                      <span className="text-[#C9A84C]">{formatTTD(grandTotal)}</span>
                    </div>
                    <p className="text-xs text-[#9A8F7A]/60 mt-0.5">TTD · Inclusive of all fees</p>
                  </div>
                </div>
                <Link href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#C9A84C] hover:bg-[#F0C040] text-[#0A0A0A] font-bold rounded-xl transition-colors">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-[#F5F0E8] mb-3">Payment Methods</h3>
                <div className="space-y-2 text-sm text-[#9A8F7A]">
                  <p>Cash on Delivery</p>
                  <p>Linx Card</p>
                  <p>Online Banking</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
