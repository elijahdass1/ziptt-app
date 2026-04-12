import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { RevealCodeButton } from '@/components/digital/RevealCodeButton'

export default async function DigitalOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const orders = await prisma.digitalOrder.findMany({
    where: { customerId: session.user.id as string },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', color: '#F5F0E8', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '32px' }}>My Digital Orders</h1>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A8F7A' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
            <p>No digital orders yet. <a href="/digital" style={{ color: '#C9A84C' }}>Browse digital products →</a></p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{order.product.name}</h3>
                    <p style={{ fontSize: '13px', color: '#9A8F7A' }}>{new Date(order.createdAt).toLocaleDateString('en-TT', { dateStyle: 'medium' })}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: order.status === 'delivered' ? '#052e16' : '#1c1917', color: order.status === 'delivered' ? '#4ade80' : '#9A8F7A', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>
                      {order.status === 'delivered' ? '✅ Delivered' : '⏳ Pending'}
                    </span>
                    <p style={{ fontSize: '14px', color: '#C9A84C', marginTop: '8px' }}>${order.pricePaid.toFixed(2)} TTD</p>
                  </div>
                </div>
                {order.expiresAt && (
                  <p style={{ fontSize: '12px', color: '#9A8F7A', marginBottom: '12px' }}>
                    Valid until: {new Date(order.expiresAt).toLocaleDateString('en-TT', { dateStyle: 'medium' })}
                  </p>
                )}
                <RevealCodeButton code={order.deliveredCode || ''} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
