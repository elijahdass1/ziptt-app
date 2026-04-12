'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { ArchiveX, CheckCircle, Loader2 } from 'lucide-react'

interface Props {
  productId: string
  currentStatus: string
}

export function AdminProductActions({ productId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)

  const update = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast({ title: `Product ${status === 'ARCHIVED' ? 'archived' : 'activated'}` })
      window.location.reload()
    } catch {
      toast({ title: 'Failed to update product', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />

  if (currentStatus === 'ARCHIVED') {
    return (
      <button onClick={() => update('ACTIVE')}
        className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
        <CheckCircle className="h-3.5 w-3.5" /> Activate
      </button>
    )
  }

  return (
    <button onClick={() => update('ARCHIVED')}
      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium">
      <ArchiveX className="h-3.5 w-3.5" /> Archive
    </button>
  )
}
