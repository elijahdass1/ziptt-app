export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { formatTTD, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Package, ChevronRight, AlertTriangle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'badge-yellow', CONFIRMED: 'badge-blue', PROCESSING: 'badge-blue',
  SHIPPED: 'badge-blue', DELIVERED: 'badge-green', CANCELLED: 'badge-gray', REFUNDED: 'badge-red',
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login?callbackUrl=/orders')

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: { select: { name: true, images: true } } } },
      vendor: { select: { storeName: true } },
    },
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Package className="h-6 w-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex items-center justify-center mb-4"><Package className="h-16 w-16 text-gray-300" strokeWidth={1.2} /></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">When you place an order, it&apos;ll show up here.</p>
            <Link href="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Order Number</p>
                      <p className="font-mono font-semibold text-gray-900">#{order.orderNumber.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Date</p>
                      <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Vendor</p>
                      <p className="font-medium text-gray-900">{order.vendor.storeName}</p>
                    </div>
                  </div>
                  <span className={STATUS_COLORS[order.status] ?? 'badge-gray'}>{order.status}</span>
                </div>

                {/* Items */}
                <div className="p-5">
                  <div className="space-y-3">
                    {order.items.map((item) => {
                      const images = typeof item.product.images === 'string'
                        ? JSON.parse(item.product.images as string) as string[]
                        : item.product.images as unknown as string[]
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={images[0] ?? ''}
                            alt={item.product.name}
                            className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatTTD(item.price)}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 shrink-0">{formatTTD(item.total)}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm">
                      <span className="text-gray-500">Total: </span>
                      <span className="font-bold text-gray-900 text-base">{formatTTD(order.total)}</span>
                      <span className="text-xs text-gray-400 ml-2">({order.paymentMethod.replace(/_/g, ' ')})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.trackingNumber && (
                        <div className="text-sm text-[#D62828] font-medium">
                          Tracking: {order.trackingNumber}
                        </div>
                      )}
                      {(order.status === 'CONFIRMED' || order.status === 'DELIVERED') && (
                        <Link
                          href={`/account/disputes?orderId=${order.id}`}
                          className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium border border-amber-300 rounded px-2 py-1 hover:bg-amber-50 transition-colors"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Open Dispute
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
