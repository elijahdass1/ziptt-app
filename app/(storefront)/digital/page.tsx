export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export default async function DigitalPage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category

  const products = await prisma.digitalProduct.findMany({
    where: {
      isActive: true,
      ...(category ? { categoryTag: category } : {}),
    },
    include: {
      vendor: { select: { storeName: true, rating: true } },
      _count: { select: { codes: { where: { isUsed: false } } } },
    },
    orderBy: [{ featured: 'desc' }, { soldCount: 'desc' }],
  })

  const categories = [
    { key: '', label: 'All' },
    { key: 'streaming', label: 'ðº Streaming' },
    { key: 'software', label: 'ð» Software' },
    { key: 'gaming', label: 'ð® Gaming' },
    { key: 'education', label: 'ð Education' },
  ]

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', color: '#F5F0E8' }}>
      {/* Hero */}
      <div style={{ padding: '60px 24px', textAlign: 'center', borderBottom: '1px solid #1A1A1A' }}>
        <div style={{ fontSize: '14px', color: '#C9A84C', marginBottom: '12px', letterSpacing: '2px' }}>â¡ INSTANT DELIVERY</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 'bold', marginBottom: '16px' }}>
          Digital Products
        </h1>
        <p style={{ color: '#9A8F7A', fontSize: '18px', maxWidth: '500px', margin: '0 auto 32px' }}>
          Netflix, Spotify, ChatGPT & more â paid in TTD, delivered instantly.
        </p>
        {/* Trust badges */}
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['â¡ Instant Delivery', 'ð Secure Checkout', 'ð§ Email Delivery', 'ð¹ð¹ TTD Prices'].map(b => (
            <span key={b} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: '#9A8F7A' }}>{b}</span>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ padding: '24px', display: 'flex', gap: '12px', overflowX: 'auto', borderBottom: '1px solid #1A1A1A' }}>
        {categories.map(c => (
          <Link key={c.key} href={`/digital${c.key ? `?category=${c.key}` : ''}`}
            style={{
              padding: '8px 20px', borderRadius: '20px', textDecoration: 'none', fontSize: '14px', whiteSpace: 'nowrap',
              background: category === c.key || (!category && !c.key) ? '#C9A84C' : '#1A1A1A',
              color: category === c.key || (!category && !c.key) ? '#0A0A0A' : '#F5F0E8',
              border: '1px solid #2A2A2A',
            }}>
            {c.label}
          </Link>
        ))}
      </div>

      {/* Product grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {products.map(product => (
            <Link key={product.id} href={`/digital/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#111111', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1A1A1A' }}>
                <div style={{ position: 'relative', height: '180px', background: '#1A1A1A' }}>
                  {product.thumbnail && (
                    <Image src={product.thumbnail} alt={product.name} fill style={{ objectFit: 'cover' }} />
                  )}
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#C9A84C', color: '#0A0A0A', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                    â¡ INSTANT
                  </span>
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#9A8F7A', marginBottom: '6px' }}>{product.vendor.storeName}</p>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', lineHeight: '1.3' }}>{product.name}</h3>
                  <p style={{ fontSize: '12px', color: product._count.codes < 5 ? '#ef4444' : '#9A8F7A', marginBottom: '12px' }}>
                    {product._count.codes} codes available
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#C9A84C' }}>${product.price.toFixed(2)}</span>
                      {product.comparePrice && (
                        <span style={{ fontSize: '13px', color: '#9A8F7A', textDecoration: 'line-through', marginLeft: '8px' }}>${product.comparePrice.toFixed(2)}</span>
                      )}
                      <span style={{ fontSize: '11px', color: '#9A8F7A', display: 'block' }}>TTD</span>
                    </div>
                    <span style={{ background: '#C9A84C', color: '#0A0A0A', fontSize: '12px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '6px' }}>Buy â</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
