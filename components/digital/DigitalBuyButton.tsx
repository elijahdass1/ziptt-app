'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DigitalBuyButton({ productId, price, inStock }: { productId: string; price: number; inStock: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleBuy() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/digital/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digitalProductId: productId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) { router.push('/auth/login'); return }
        setError(data.error || 'Purchase failed. Please try again.')
        return
      }
      router.push(`/digital/success?orderId=${data.orderId}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <p style={{ color: '#ef4444', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
      <button
        onClick={handleBuy}
        disabled={!inStock || loading}
        style={{
          width: '100%', padding: '16px', borderRadius: '8px', border: 'none', cursor: inStock && !loading ? 'pointer' : 'not-allowed',
          background: inStock ? '#C9A84C' : '#333', color: 'var(--bg-primary)', fontSize: '16px', fontWeight: 'bold',
        }}>
        {loading ? 'Processing...' : inStock ? `Buy Now — $${price.toFixed(2)} TTD` : 'Out of Stock'}
      </button>
    </div>
  )
}
