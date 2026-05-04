// Floating "Message Seller" chat panel embedded on every vendor profile
// page. Opens to a slide-up dock at bottom-right (Facebook style).
//
// Realtime: polls /api/conversations/[id]/messages?since=<lastSeen> every
// 5s when open. Cheap, works on any host (no websocket infra needed for v1).
// We could swap to Pusher/Ably later by replacing useEffect's interval.
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Send, X, Store } from 'lucide-react'

interface Props {
  vendorSlug: string
  vendorName: string
  vendorLogo: string | null
  // Pass null when there's no signed-in user — clicking the button bounces
  // to /auth/login?callbackUrl=...
  isSignedIn: boolean
  // True when the viewer is the vendor — we hide the button entirely.
  isOwnStore: boolean
}

interface ChatMessage {
  id: string
  body: string
  createdAt: string
  fromMe: boolean
  readAt?: string | null
}

const POLL_MS = 5000

export function ChatWithVendor({
  vendorSlug,
  vendorName,
  vendorLogo,
  isSignedIn,
  isOwnStore,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  // Track latest message timestamp for incremental polling.
  const sinceRef = useRef<string | null>(null)

  if (isOwnStore) return null

  // Open + bootstrap conversation. Idempotent on backend so reopening is fine.
  const handleOpen = async () => {
    if (!isSignedIn) {
      router.push(`/auth/login?callbackUrl=/store/${vendorSlug}`)
      return
    }
    setOpen(true)
    if (conversationId) return // already initialised
    setBootstrapping(true)
    setError('')
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorSlug }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Could not start chat')
        return
      }
      const { id } = await res.json()
      setConversationId(id)
      // Initial fetch — full thread.
      const msgRes = await fetch(`/api/conversations/${id}/messages`)
      if (msgRes.ok) {
        const initial = (await msgRes.json()) as ChatMessage[]
        setMessages(initial)
        if (initial.length > 0) sinceRef.current = initial[initial.length - 1].createdAt
      }
      // Mark thread as read on open.
      fetch(`/api/conversations/${id}/read`, { method: 'POST' }).catch(() => {})
    } catch {
      setError('Network error')
    } finally {
      setBootstrapping(false)
    }
  }

  // Poll for new messages while panel is open.
  useEffect(() => {
    if (!open || !conversationId) return
    const tick = async () => {
      try {
        const url = sinceRef.current
          ? `/api/conversations/${conversationId}/messages?since=${encodeURIComponent(sinceRef.current)}`
          : `/api/conversations/${conversationId}/messages`
        const res = await fetch(url)
        if (!res.ok) return
        const fresh = (await res.json()) as ChatMessage[]
        if (fresh.length > 0) {
          setMessages((prev) => [...prev, ...fresh])
          sinceRef.current = fresh[fresh.length - 1].createdAt
          // Mark new incoming messages as read.
          fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' }).catch(() => {})
        }
      } catch {
        // Swallow — next tick will retry.
      }
    }
    const interval = setInterval(tick, POLL_MS)
    return () => clearInterval(interval)
  }, [open, conversationId])

  // Auto-scroll on new messages.
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!conversationId || !draft.trim() || sending) return
    setSending(true)
    setError('')
    const text = draft.trim()
    setDraft('')
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to send')
        setDraft(text) // restore so user doesn't lose their words
        return
      }
      const msg = (await res.json()) as ChatMessage
      setMessages((prev) => [...prev, msg])
      sinceRef.current = msg.createdAt
    } catch {
      setError('Network error')
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Trigger button — sits inline next to the vendor name in the profile header */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 bg-[#C9A84C] text-black hover:bg-[#b8963f] px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
      >
        <MessageSquare className="h-4 w-4" />
        Message Seller
      </button>

      {/* Floating panel */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[min(380px,calc(100vw-2rem))] h-[520px] max-h-[80vh] flex flex-col bg-[var(--bg-primary)] border border-[#C9A84C]/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#C9A84C]/15 bg-[var(--bg-secondary)]">
            <div className="h-8 w-8 rounded-full bg-[var(--bg-card)] border border-[#C9A84C]/30 flex items-center justify-center overflow-hidden shrink-0">
              {vendorLogo ? (
                <img src={vendorLogo} alt="" className="h-full w-full object-cover" />
              ) : (
                <Store className="h-4 w-4 text-[#C9A84C]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{vendorName}</p>
              <p className="text-[10px] text-[var(--text-secondary)]">Usually replies in a few hours</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-[var(--bg-primary)]">
            {bootstrapping ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-6">Loading…</p>
            ) : messages.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-6">
                Say hello — your message goes straight to the seller.
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      m.fromMe
                        ? 'bg-[#C9A84C] text-black rounded-br-sm'
                        : 'bg-[var(--bg-card)] text-[var(--text-primary)] rounded-bl-sm border border-[#C9A84C]/10'
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              ))
            )}
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          </div>

          {/* Composer */}
          <form onSubmit={send} className="border-t border-[#C9A84C]/15 bg-[var(--bg-secondary)] p-2 flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(e as unknown as React.FormEvent)
                }
              }}
              rows={1}
              placeholder="Write a message…"
              className="flex-1 bg-[var(--bg-primary)] border border-[#333] text-[var(--text-primary)] focus:border-[#C9A84C] focus:outline-none rounded-xl px-3 py-2 text-sm placeholder:text-[#555] resize-none max-h-24"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="bg-[#C9A84C] text-black hover:bg-[#b8963f] disabled:opacity-40 disabled:cursor-not-allowed h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-colors"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
