'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, RotateCcw, Sparkles } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

// The widget ALWAYS renders regardless of API key configuration.
// When no Groq key is set, the server uses built-in fallback replies.

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const WELCOME = `Hey! 👋 I'm Zip, your shopping assistant for zip.tt 🇹🇹

I can help you:
• **Find products** across Trinidad & Tobago
• **Track orders** and check delivery status
• **Answer questions** about returns and payments
• **Support vendors** with tips and advice

What can I help you with today?`

const SUGGESTIONS = ['Find a product', 'Track my order', 'Return an item', 'Vendor help']

export function ZipChatWidget() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: WELCOME },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'customer' | 'vendor'>('customer')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Prevent SSR/hydration mismatch — render button only after client mount
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (session?.user?.role === 'VENDOR') setMode('vendor')
  }, [session])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    const assistantId = (Date.now() + 1).toString()
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)

    try {
      // Send full conversation history for context
      const history = [...messages, userMsg]
        .filter((m) => m.content)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, mode }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const raw = trimmed.slice(6)
          if (raw === '[DONE]') break
          try {
            const parsed = JSON.parse(raw) as { text?: string }
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + parsed.text } : m
                )
              )
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Sorry, I hit a snag! ${msg.includes('limit') ? msg : 'Please try again or email support@zip.tt 🙏'}` }
            : m
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const renderContent = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline text-[#C9A84C] hover:text-[#F0C040]">$1</a>')
      .replace(/^• (.+)$/gm, '<li class="ml-3">• $1</li>')
      .replace(/\n/g, '<br/>')
  }

  // Always render after mount — never hide based on API key availability
  if (!mounted) return null

  return (
    <>
      {/* Floating button — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200',
          open
            ? 'bg-[#1A1A1A] border border-[#C9A84C]/30'
            : 'bg-[#C9A84C] hover:bg-[#F0C040] hover:scale-105 shadow-[0_0_20px_rgba(201,168,76,0.4)]'
        )}
        aria-label="Chat with Zip"
      >
        {open
          ? <X className="h-6 w-6 text-[#C9A84C]" />
          : <MessageCircle className="h-6 w-6 text-[#0A0A0A]" />
        }
        {!open && messages.length === 1 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0C040] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F0C040]" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-[#111111] rounded-2xl shadow-2xl border border-[#C9A84C]/25 flex flex-col overflow-hidden"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] border-b border-[#C9A84C]/20 px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#0A0A0A] text-sm font-black shadow-[0_0_12px_rgba(201,168,76,0.5)] shrink-0">
              Z
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-sm text-[#F5F0E8]">Zip Assistant</p>
                <Sparkles className="h-3 w-3 text-[#C9A84C]" />
              </div>
              <p className="text-xs text-[#C9A84C]">zip.tt • Powered by Groq AI 🇹🇹</p>
            </div>
            <div className="flex items-center gap-1.5">
              {session?.user?.role === 'VENDOR' && (
                <button
                  onClick={() => setMode(mode === 'customer' ? 'vendor' : 'customer')}
                  className="text-xs bg-[#C9A84C]/15 hover:bg-[#C9A84C]/25 text-[#C9A84C] border border-[#C9A84C]/30 px-2 py-0.5 rounded-full transition-colors"
                >
                  {mode === 'vendor' ? '🏪 Vendor' : '🛒 Shopper'}
                </button>
              )}
              <button
                onClick={() => setMessages([{ id: '0', role: 'assistant', content: WELCOME }])}
                className="p-1 hover:bg-[#C9A84C]/15 rounded-full transition-colors text-[#9A8F7A] hover:text-[#C9A84C]"
                title="Clear chat"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0A0A0A]">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-full bg-[#C9A84C] text-[#0A0A0A] text-xs font-black flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    Z
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-[#C9A84C] text-[#0A0A0A] font-medium rounded-tr-sm'
                      : 'bg-[#1A1A1A] text-[#F5F0E8] border border-[#C9A84C]/10 rounded-tl-sm'
                  )}
                >
                  {msg.content ? (
                    <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                  ) : (
                    <div className="flex items-center gap-2 py-1">
                      <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 bg-[#C9A84C] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-1.5 w-1.5 bg-[#C9A84C] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-1.5 w-1.5 bg-[#C9A84C] rounded-full animate-bounce" />
                      </div>
                      <span className="text-xs text-[#9A8F7A]">Zip is thinking...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestion chips */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap bg-[#0A0A0A] shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus() }}
                  className="text-xs bg-[#1A1A1A] hover:bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-[#C9A84C]/15 bg-[#111111] shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask Zip anything..."
                maxLength={500}
                className="flex-1 text-sm bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-full px-4 py-2.5 text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="h-10 w-10 bg-[#C9A84C] hover:bg-[#F0C040] disabled:bg-[#1A1A1A] text-[#0A0A0A] disabled:text-[#9A8F7A] rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
