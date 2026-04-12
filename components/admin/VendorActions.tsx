'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  vendorId: string
  currentStatus: string
  storeName: string
}

export function VendorActions({ vendorId, currentStatus, storeName }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const update = async (status: string) => {
    if (status === 'REJECTED' && !confirm(`Reject ${storeName}? The vendor's role will be reverted to customer.`)) return
    if (status === 'SUSPENDED' && !confirm(`Suspend ${storeName}? This will prevent them from selling.`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update vendor')
      const label =
        status === 'APPROVED' ? 'approved' :
        status === 'REJECTED' ? 'rejected' :
        status === 'SUSPENDED' ? 'suspended' : 'updated'
      toast({ title: `${storeName} ${label}` })
      router.refresh()
    } catch {
      toast({ title: 'Failed to update vendor', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-[#888]" />
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {currentStatus === 'PENDING' && (
        <>
          <button
            onClick={() => update('APPROVED')}
            className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            <CheckCircle className="h-3.5 w-3.5" /> Approve
          </button>
          <button
            onClick={() => update('REJECTED')}
            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" /> Reject
          </button>
        </>
      )}
      {currentStatus === 'APPROVED' && (
        <button
          onClick={() => update('SUSPENDED')}
          className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Suspend
        </button>
      )}
      {currentStatus === 'SUSPENDED' && (
        <button
          onClick={() => update('APPROVED')}
          className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-medium transition-colors"
        >
          <CheckCircle className="h-3.5 w-3.5" /> Reinstate
        </button>
      )}
      {currentStatus === 'REJECTED' && (
        <button
          onClick={() => update('APPROVED')}
          className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-medium transition-colors"
        >
          <CheckCircle className="h-3.5 w-3.5" /> Approve
        </button>
      )}
    </div>
  )
}
