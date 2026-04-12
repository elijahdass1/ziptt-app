export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function VendorDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/vendor')

  const vendor = await prisma.vendor.findFirst({ where: { userId: session.user.id as string } })

  // Only place the redirect to register happens
  if (!vendor) redirect('/vendor/register')

  if (vendor.status === 'PENDING') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontSize: '14px', color: '#9A8F7A', marginBottom: '16px' }}>PENDING REVIEW</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#F5F0E8', fontFamily: 'Georgia, serif', marginBottom: '16px' }}>Application Under Review</h1>
          <div style={{ border: '1px solid #C9A84C', borderRadius: '12px', padding: '24px', background: '#111111', marginBottom: '16px' }}>
            <p style={{ color: '#9A8F7A', marginBottom: '8px' }}>
              Your vendor application for <strong style={{ color: '#C9A84C' }}>{vendor.storeName}</strong> is being reviewed.
            </p>
            <p style={{ color: '#9A8F7A', fontSize: '14px' }}>Typically takes 1-2 business days.</p>
          </div>
          <p style={{ fontSize: '14px', color: '#9A8F7A' }}>
            Questions? Email <a href="mailto:support@zip.tt" style={{ color: '#C9A84C' }}>support@zip.tt</a>
          </p>
        </div>
      </div>
    )
  }

  if (vendor.status === 'SUSPENDED') {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontSize: '14px', color: '#D62828', marginBottom: '16px' }}>APPLICATION NOT APPROVED</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#F5F0E8', fontFamily: 'Georgia, serif', marginBottom: '16px' }}>Store Suspended</h1>
          <div style={{ border: '1px solid #ef4444', borderRadius: '12px', padding: '24px', background: '#1a0000', marginBottom: '16px' }}>
            <p style={{ color: '#fca5a5' }}>Your store has been suspended. Please contact support for assistance.</p>
          </div>
          <p style={{ fontSize: '14px', color: '#9A8F7A' }}>
            Contact <a href="mailto:support@zip.tt" style={{ color: '#C9A84C' }}>support@zip.tt</a> to appeal or get more information.
          </p>
        </div>
      </div>
    )
  }

  const [orderCount, productCount, revenueData, recentOrders] = await Promise.all([
    prisma.order.count({ where: { items: { some: { product: { vendorId: vendor.id } } } } }),
    prisma.product.count({ where: { vendorId: vendor.id, status: 'ACTIVE' } }),
    prisma.orderItem.aggregate({ where: { product: { vendorId: vendor.id } }, _sum: { price: true } }),
    prisma.order.findMany({
      where: { items: { some: { product: { vendorId: vendor.id } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: { select: { name: true } }, items: { include: { product: { select: { name: true, vendorId: true } } } } },
    }),
  ])

  const totalRevenue = revenueData._sum.price ?? 0
  const commission = vendor.commission ?? 10
  const netRevenue = totalRevenue * (1 - commission / 100)

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, sub: `Net: $${netRevenue.toFixed(2)} TTD` },
    { label: 'Total Orders', value: orderCount.toString(), sub: 'All time' },
    { label: 'Active Products', value: productCount.toString(), sub: 'Live listings' },
    { label: 'Commission Rate', value: `${commission}%`, sub: 'Per sale' },
  ]

  return (
    <div style={{ padding: '32px', color: '#F5F0E8' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '4px' }}>
          Welcome back, {session.user.name?.split(' ')[0] ?? 'Vendor'}
        </h1>
        <p style={{ color: '#9A8F7A', fontSize: '14px' }}>{vendor.storeName} Dashboard</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ background: '#111111', border: '1px solid #C9A84C', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontSize: '12px', color: '#9A8F7A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{stat.label}</p>
            <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#C9A84C', marginBottom: '4px' }}>{stat.value}</p>
            <p style={{ fontSize: '12px', color: '#9A8F7A' }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Orders</h2>
          <a href="/vendor/orders" style={{ fontSize: '13px', color: '#C9A84C', textDecoration: 'none' }}>View all</a>
        </div>
        {recentOrders.length === 0 ? (
          <p style={{ padding: '32px', color: '#9A8F7A', textAlign: 'center' }}>No orders yet. Share your store to get started!</p>
        ) : (
          <div>
            {recentOrders.map((order) => (
              <div key={order.id} style={{ padding: '16px 24px', borderBottom: '1px solid #111111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{order.customer.name}</p>
                  <p style={{ fontSize: '12px', color: '#9A8F7A' }}>
                    {order.items.filter(i => i.product?.vendorId === vendor.id).map(i => i.product?.name).join(', ')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#C9A84C' }}>${order.total?.toFixed(2) ?? '0.00'}</p>
                  <span style={{ fontSize: '11px', color: '#9A8F7A' }}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
