'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { Loader2, Eye, CheckCircle, XCircle } from 'lucide-react'

interface Props {
  disputeId: string
  currentStatus: string
}

export function AdminDisputeActions({ disputeId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const [showResolve, setShowResolve] = useState(false)
  const [resolution, setResolution] = useState('')

  const update = async (status: string, resolutionText?: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution: resolutionText }),
      })
      if (!res.ok) throw new Error()
      toast({ title: `Dispute ${status.toLowerCase().replace('_', ' ')}` })
      window.location.reload()
    } catch {
      toast({ title: 'Failed to update dispute', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />

  if (showResolve) {
    return (
      <div className="w-64">
        <textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Describe the resolution…"
          rows={3}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D62828] mb-2"
        />
        <div className="flex gap-2">
          <button
            onClick={() => update('RESOLVED_CUSTOMER', resolution)}
            disabled={!resolution.trim()}
            className="flex-1 btn-primary text-xs py-1.5 disabled:bg-gray-300"
          >
            Submit
          </button>
          <button onClick={() => setShowResolve(false)} className="flex-1 btn-secondary text-xs py-1.5">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {currentStatus === 'OPEN' && (
        <button
          onClick={() => update('IN_REVIEW')}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
        >
          <Eye className="h-3.5 w-3.5" /> Review
        </button>
      )}
      {(currentStatus === 'OPEN' || currentStatus === 'IN_REVIEW') && (
        <button
          onClick={() => setShowResolve(true)}
          className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium whitespace-nowrap"
        >
          <CheckCircle className="h-3.5 w-3.5" /> Resolve
        </button>
      )}
      {currentStatus !== 'CLOSED' && currentStatus !== 'RESOLVED_CUSTOMER' && currentStatus !== 'RESOLVED_VENDOR' && (
        <button
          onClick={() => update('CLOSED')}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium whitespace-nowrap"
        >
          <XCircle className="h-3.5 w-3.5" /> Close
        </button>
      )}
    </div>
  )
}
