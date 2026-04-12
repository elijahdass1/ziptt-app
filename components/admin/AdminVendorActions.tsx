'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  vendorId: string
  currentStatus: string
  storeName: string
}

export function AdminVendorActions({ vendorId, currentStatus, storeName }: Props) {
  const [loading, setLoading] = useState(false)

  const update = async (status: string) => {
    if (status === 'SUSPENDED' && !confirm(`Suspend ${storeName}?`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      const label = status === 'APPROVED' ? 'approved' : status === 'SUSPENDED' ? 'suspended' : 'updated'
      toast({ title: `${storeName} ${label}` })
      window.location.reload()
    } catch {
      toast({ title: 'Failed to update vendor', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />

  return (
    <div className="flex items-center justify-end gap-3">
      {currentStatus === 'PENDING' && (
        <>
          <button onClick={() => update('APPROVED')}
            className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
            <CheckCircle className="h-3.5 w-3.5" /> Approve
          </button>
          <button onClick={() => update('SUSPENDED')}
            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium">
            <XCircle className="h-3.5 w-3.5" /> Reject
          </button>
        </>
      )}
      {currentStatus === 'APPROVED' && (
        <button onClick={() => update('SUSPENDED')}
          className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
          <AlertTriangle className="h-3.5 w-3.5" /> Suspend
        </button>
      )}
      {currentStatus === 'SUSPENDED' && (
        <button onClick={() => update('APPROVED')}
          className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
          <CheckCircle className="h-3.5 w-3.5" /> Reinstate
        </button>
      )}
    </div>
  )
}
