export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { DigitalBuyButton } from '@/components/digital/DigitalBuyButton'

export default async function DigitalProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.digitalProduct.findUnique({
    where: { slug: params.slug },
    include: {
      vendor: true,
      _count: { select: { codes: { where: { isUsed: false } } } },
    },
  })

  if (!product || !product.isActive) notFound()

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          <a href="/" style={{ color: 'var(--text-secondary)' }}>Home</a> âº <a href="/digital" style={{ color: 'var(--text-secondary)' }}>Digital</a> âº <span style={{ color: '#C9A84C' }}>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Left */}
          <div>
            <div style={{ position: 'relative', height: '280px', background: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
              {product.thumbnail && <Image src={product.thumbnail} alt={product.name} fill style={{ objectFit: 'cover' }} />}
              <span style={{ position: 'absolute', top: '16px', left: '16px', background: '#C9A84C', color: 'var(--bg-primary)', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px' }}>â¡ INSTANT DELIVERY</span>
            </div>
            {/* How it works */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>How it works</h3>
              {['Click Buy Now and complete payment', 'Receive your code instantly on your orders page', 'Follow the redemption instructions', 'Enjoy your subscription! ð'].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#C9A84C', fontWeight: 'bold', minWidth: '20px' }}>{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div>
            <p style={{ fontSize: '13px', color: '#C9A84C', marginBottom: '8px' }}>{product.vendor.storeName}</p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '16px', lineHeight: '1.2' }}>{product.name}</h1>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#C9A84C' }}>${product.price.toFixed(2)}</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', marginLeft: '8px' }}>TTD</span>
              {product.comparePrice && (
                <span style={{ fontSize: '18px', color: 'var(--text-secondary)', textDecoration: 'line-through', marginLeft: '12px' }}>${product.comparePrice.toFixed(2)}</span>
              )}
            </div>
            <p style={{ fontSize: '14px', color: product._count.codes < 5 ? '#ef4444' : 'var(--text-secondary)', marginBottom: '24px' }}>
              {product._count.codes > 0 ? `â ${product._count.codes} codes in stock` : 'â Out of stock'}
            </p>
            {/* Non-refundable notice */}
            <div style={{ background: '#1A1000', border: '1px solid #5a4000', borderRadius: '8px', padding: '16px', marginBottom: '24px', fontSize: '13px', color: '#C9A84C' }}>
              â ï¸ Digital products cannot be refunded once the code has been revealed. Please confirm you need this service before purchasing.
            </div>
            {/* Instructions */}
            {product.instructions && (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid #1A1A1A', borderRadius: '8px', padding: '16px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>How to redeem:</strong>
                {product.instructions}
              </div>
            )}
            <DigitalBuyButton productId={product.id} price={product.price} inStock={product._count.codes > 0} />
          </div>
        </div>
      </div>
    </div>
  )
}
