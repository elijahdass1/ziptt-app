// Code-entry form for one pending digital order. Vendor pastes the
// access code (or full multi-line redemption block) into the textarea
// and clicks Deliver — POSTs to /api/vendor/digital-orders/[id]/deliver
// which marks the order delivered and emails the customer.
//
// Lives on /vendor/digital/orders. Server-rendered list above; this
// is the only client component on the page.
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export function VendorDeliverDigitalForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [busy, startTransition] = useTransition()
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast({ title: 'Paste the access code first', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/vendor/digital-orders/${orderId}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({
          title: 'Could not deliver',
          description: data?.error ?? 'Try again or contact support@zip.tt',
          variant: 'destructive',
        })
        return
      }
      toast({
        title: 'Delivered ✓',
        description: 'Code sent to the customer by email.',
      })
      setCode('')
      // SSR list re-fetches and the row moves from Pending → Delivered.
      startTransition(() => router.refresh())
    } catch {
      toast({ title: 'Network error', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-2">
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#C9A84C]">
        Digital delivery code
      </label>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={2}
        placeholder="Paste the access code, redemption link, or instructions…"
        className="w-full bg-[var(--bg-primary)] border border-[#C9A84C]/25 rounded-lg p-3 text-sm font-mono text-[var(--text-primary)] placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
        disabled={submitting}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-[var(--text-secondary)]">
          The customer gets the same code via email + on their <span className="text-[#C9A84C]">My Digital Orders</span> page instantly.
        </p>
        <button
          type="submit"
          disabled={submitting || busy || !code.trim()}
          className="inline-flex items-center gap-1.5 bg-[#C9A84C] hover:bg-[#F0C040] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Send size={14} />
          {submitting ? 'Delivering…' : 'Deliver to customer'}
        </button>
      </div>
    </form>
  )
}
