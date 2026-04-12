import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { formatTTD, formatDate } from '@/lib/utils'
import { VendorOrderActions } from '@/components/vendor/VendorOrderActions'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'badge-yellow', CONFIRMED: 'badge-blue', PROCESSING: 'badge-blue',
  SHIPPED: 'badge-blue', DELIVERED: 'badge-green', CANCELLED: 'badge-gray', REFUNDED: 'badge-red',
}

export default async function VendorOrdersPage() {
  const session = await getServerSession(authOptions)!
  const vendor = await prisma.vendor.findUnique({ where: { userId: session!.user.id } })
  if (!vendor) return null

  const orders = await prisma.order.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      items: { include: { product: { select: { name: true, images: true } } } },
      address: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">{orders.length} total orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-lg font-semibold text-gray-900">No orders yet</h2>
          <p className="text-gray-500">When customers place orders, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-mono font-bold text-gray-900">#{order.orderNumber.slice(-8).toUpperCase()}</span>
                  <span className="text-gray-500">{formatDate(order.createdAt)}</span>
                  <span className="font-medium text-gray-900">{order.customer.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={STATUS_COLORS[order.status] ?? 'badge-gray'}>{order.status}</span>
                  <span className="font-bold text-gray-900">{formatTTD(order.total)}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.product.images[0] ?? ''} alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatTTD(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Customer</p>
                      <p className="text-gray-700">{order.customer.name}</p>
                      <p className="text-gray-500 text-xs">{order.customer.email}</p>
                    </div>
                    {order.address && (
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Delivery</p>
                        <p className="text-gray-700">{order.address.street}, {order.address.city}, {order.address.region}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Payment</p>
                      <p className="text-gray-700">{order.paymentMethod.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  <VendorOrderActions orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
