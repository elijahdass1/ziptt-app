'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface Props {
  reviewId: string
  currentStatus: string
}

export function AdminReviewActions({ reviewId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)

  const update = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, status }),
      })
      if (!res.ok) throw new Error()
      toast({ title: `Review ${status.toLowerCase()}` })
      window.location.reload()
    } catch {
      toast({ title: 'Failed to update review', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-gray-400 ml-auto" />

  if (currentStatus !== 'PENDING') {
    return (
      <span className="text-xs text-[#555] italic">
        {currentStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
      </span>
    )
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={() => update('APPROVED')}
        className="inline-flex items-center gap-1 text-xs text-green-500 hover:text-green-400 font-medium whitespace-nowrap transition-colors"
      >
        <CheckCircle className="h-3.5 w-3.5" /> Approve
      </button>
      <button
        onClick={() => update('REJECTED')}
        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400 font-medium whitespace-nowrap transition-colors"
      >
        <XCircle className="h-3.5 w-3.5" /> Reject
      </button>
    </div>
  )
}
