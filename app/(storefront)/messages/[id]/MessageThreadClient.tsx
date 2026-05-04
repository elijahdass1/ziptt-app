// Full-page message thread — same polling pattern as ChatWithVendor's
// floating panel, but fills the viewport for a focused conversation.
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Store, User as UserIcon } from 'lucide-react'

interface ChatMessage {
  id: string
  body: string
  createdAt: string
  fromMe: boolean
}

interface Props {
  conversationId: string
  currentUserId: string
  otherParty: { name: string; image: string | null; href: string | null }
  initialMessages: ChatMessage[]
}

const POLL_MS = 5000

export function MessageThreadClient({
  conversationId,
  otherParty,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const sinceRef = useRef<string | null>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].createdAt : null
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
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
          fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' }).catch(() => {})
        }
      } catch {/* swallow */}
    }
    const interval = setInterval(tick, POLL_MS)
    return () => clearInterval(interval)
  }, [conversationId])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || sending) return
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
        setDraft(text)
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#C9A84C]/15">
        <Link
          href="/messages"
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Back to inbox"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="h-10 w-10 rounded-full bg-[var(--bg-card)] border border-[#C9A84C]/20 flex items-center justify-center overflow-hidden shrink-0">
          {otherParty.image ? (
            <img src={otherParty.image} alt="" className="h-full w-full object-cover" />
          ) : otherParty.href ? (
            <Store className="h-5 w-5 text-[#C9A84C]" />
          ) : (
            <UserIcon className="h-5 w-5 text-[#C9A84C]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {otherParty.href ? (
            <Link
              href={otherParty.href}
              className="text-sm font-semibold text-[var(--text-primary)] hover:text-[#C9A84C] truncate transition-colors"
            >
              {otherParty.name}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{otherParty.name}</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 px-1 pb-3">
        {messages.length === 0 ? (
          <p className="text-xs text-[var(--text-secondary)] text-center py-12">No messages yet — say hi!</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  m.fromMe
                    ? 'bg-[#C9A84C] text-black rounded-br-sm'
                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] rounded-bl-sm border border-[#C9A84C]/10'
                }`}
              >
                {m.body}
                <span className={`block text-[10px] mt-1 ${m.fromMe ? 'text-[var(--bg-primary)]/60' : 'text-[var(--text-secondary)]'}`}>
                  {new Date(m.createdAt).toLocaleTimeString('en-TT', {
                    hour: 'numeric', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>

      {/* Composer */}
      <form onSubmit={send} className="flex items-end gap-2 pt-3 border-t border-[#C9A84C]/15">
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
          className="flex-1 bg-[var(--bg-primary)] border border-[#333] text-[var(--text-primary)] focus:border-[#C9A84C] focus:outline-none rounded-xl px-3 py-2.5 text-sm placeholder:text-[#555] resize-none max-h-32"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="bg-[#C9A84C] text-black hover:bg-[#b8963f] disabled:opacity-40 disabled:cursor-not-allowed h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
