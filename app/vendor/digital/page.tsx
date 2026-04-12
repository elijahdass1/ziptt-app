export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function VendorDigitalPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const vendor = await prisma.vendor.findFirst({ where: { userId: session.user.id as string } })
  if (!vendor) redirect('/vendor/register')

  const products = await prisma.digitalProduct.findMany({
    where: { vendorId: vendor.id },
    include: { _count: { select: { codes: { where: { isUsed: false } }, orders: true } } },
    orderBy: { createdAt: 'desc' }
  })

  const totalRevenue = await prisma.digitalOrder.aggregate({
    where: { vendorId: vendor.id, status: 'delivered' },
    _sum: { vendorEarnings: true }
  })

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', color: '#F5F0E8', padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px' }}>Digital Products</h1>
          <p style={{ color: '#9A8F7A', marginTop: '4px' }}>Revenue: ${(totalRevenue._sum.vendorEarnings ?? 0).toFixed(2)} TTD (after 15% commission)</p>
        </div>
        <Link href="/vendor/digital/new" style={{ background: '#C9A84C', color: '#0A0A0A', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
          + Add Digital Product
        </Link>
      </div>
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#9A8F7A' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>â¡</div>
          <p>No digital products yet. <Link href="/vendor/digital/new" style={{ color: '#C9A84C' }}>Add your first one â</Link></p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                {['Product', 'Category', 'Price', 'Available', 'Sold', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#9A8F7A', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                  <td style={{ padding: '16px' }}>{p.name}</td>
                  <td style={{ padding: '16px', color: '#9A8F7A', fontSize: '13px' }}>{p.categoryTag}</td>
                  <td style={{ padding: '16px', color: '#C9A84C' }}>${p.price.toFixed(2)}</td>
                  <td style={{ padding: '16px', color: p._count.codes < 5 ? '#ef4444' : '#4ade80' }}>{p._count.codes}</td>
                  <td style={{ padding: '16px' }}>{p._count.orders}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ background: p.isActive ? '#052e16' : '#1c1917', color: p.isActive ? '#4ade80' : '#9A8F7A', padding: '3px 10px', borderRadius: '12px', fontSize: '12px' }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
