import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CopyCodeButton } from '@/components/digital/CopyCodeButton'

export default async function DigitalSuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const orderId = searchParams.orderId
  if (!orderId) redirect('/digital')

  const order = await prisma.digitalOrder.findUnique({
    where: { id: orderId },
    include: { product: true }
  })

  if (!order || order.customerId !== session.user.id) redirect('/digital')

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', color: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', marginBottom: '8px' }}>Purchase Successful!</h1>
        <p style={{ color: '#9A8F7A', marginBottom: '40px' }}>{order.product.name}</p>

        <div style={{ background: '#111111', border: '2px solid #C9A84C', borderRadius: '12px', padding: '32px', marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', color: '#9A8F7A', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Code</p>
          <div style={{ fontSize: '22px', fontFamily: 'monospace', color: '#C9A84C', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '20px', wordBreak: 'break-all' }}>
            {order.deliveredCode}
          </div>
          <CopyCodeButton code={order.deliveredCode || ''} />
        </div>

        {order.product.instructions && (
          <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '8px', padding: '20px', marginBottom: '24px', textAlign: 'left', fontSize: '14px', color: '#9A8F7A' }}>
            <strong style={{ color: '#F5F0E8', display: 'block', marginBottom: '8px' }}>How to redeem:</strong>
            {order.product.instructions}
          </div>
        )}

        <p style={{ fontSize: '13px', color: '#9A8F7A', marginBottom: '24px' }}>
          💾 Your code is also saved in <a href="/orders/digital" style={{ color: '#C9A84C' }}>My Digital Orders</a>
        </p>
        <a href="/digital" style={{ display: 'inline-block', background: '#C9A84C', color: '#0A0A0A', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Shop more digital products →
        </a>
      </div>
    </div>
  )
}
