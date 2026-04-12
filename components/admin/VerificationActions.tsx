'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface Props {
  userId: string
  type: 'customer' | 'vendor'
  vendorId?: string
}

export function VerificationActions({ userId, type, vendorId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(action)
    try {
      if (type === 'customer') {
        const res = await fetch('/api/admin/verify-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action }),
        })
        if (!res.ok) throw new Error('Failed')
      } else if (type === 'vendor' && vendorId) {
        const status = action === 'approve' ? 'APPROVED' : 'REJECTED'
        const res = await fetch('/api/admin/vendors', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId, status }),
        })
        if (!res.ok) throw new Error('Failed')
      }
      router.refresh()
    } catch {
      // Silently fail — refresh will show current state
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction('approve')}
        disabled={loading !== null}
        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
      >
        {loading === 'approve' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
        Approve
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={loading !== null}
        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
      >
        {loading === 'reject' ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
        Reject
      </button>
    </div>
  )
}
