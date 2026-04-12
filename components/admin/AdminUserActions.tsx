'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { Ban, CheckCircle, Loader2 } from 'lucide-react'

interface Props {
  userId: string
  currentStatus: string
}

export function AdminUserActions({ userId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)

  const update = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast({ title: `User ${status === 'BANNED' ? 'banned' : 'unbanned'} successfully` })
      window.location.reload()
    } catch {
      toast({ title: 'Failed to update user', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-gray-400 ml-auto" />

  if (currentStatus === 'BANNED') {
    return (
      <button onClick={() => update('ACTIVE')}
        className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
        <CheckCircle className="h-3.5 w-3.5" /> Unban
      </button>
    )
  }

  return (
    <button onClick={() => update('BANNED')}
      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium">
      <Ban className="h-3.5 w-3.5" /> Ban
    </button>
  )
}
