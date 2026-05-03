// "Cancel Order" button + confirm modal. Shown on the customer
// /orders list for orders still in PENDING status. Once the vendor
// confirms or ships the order, the button doesn't render — disputes
// take over from there.
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface Props {
  orderId: string
  orderNumber: string
}

export function CancelOrderButton({ orderId, orderNumber }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, startTransition] = useTransition()

  const onConfirm = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({
          title: 'Could not cancel',
          description: data?.error ?? 'Try again or contact support@zip.tt',
          variant: 'destructive',
        })
        return
      }
      toast({ title: 'Order cancelled', description: `#${orderNumber} has been cancelled.` })
      setOpen(false)
      // Refresh the SSR list so the row shows CANCELLED + the button
      // disappears. router.refresh re-runs the page server fetch
      // without a full reload.
      startTransition(() => router.refresh())
    } catch {
      toast({ title: 'Network error', variant: 'destructive' })
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium border border-red-400/40 rounded px-2 py-1 hover:bg-red-500/10 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
        Cancel order
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#C9A84C]/20 rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-[#F5F0E8] mb-2">Cancel this order?</h3>
            <p className="text-sm text-[#9A8F7A] leading-relaxed">
              Are you sure you want to cancel order <span className="text-[#F5F0E8] font-medium">#{orderNumber}</span>?
              This cannot be undone — you&apos;ll need to place a new order if you change your mind.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setOpen(false)}
                disabled={busy}
                className="flex-1 py-2.5 text-sm font-semibold border border-[#C9A84C]/40 text-[#C9A84C] rounded-lg hover:bg-[#C9A84C]/10 transition-colors disabled:opacity-50"
              >
                Keep order
              </button>
              <button
                onClick={onConfirm}
                disabled={busy}
                className="flex-1 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {busy ? 'Cancelling…' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
