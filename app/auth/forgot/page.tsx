'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // The endpoint intentionally always succeeds (no account enumeration),
      // so we show the same confirmation regardless of the response.
      if (res.ok) {
        setSent(true)
      } else {
        toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <span className="text-3xl font-black gold-shimmer">zip</span>
            <span className="text-3xl font-black text-[var(--text-primary)]">.tt</span>
          </Link>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-2xl p-6 shadow-2xl">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle className="h-10 w-10 text-[#C9A84C] mx-auto" />
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Check your email</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                If an account exists for <span className="text-[#C9A84C] font-medium">{email}</span>, we've
                sent a link to reset your password. It expires in 1 hour — check your spam folder too.
              </p>
              <Link href="/auth/login" className="inline-block text-sm text-[#C9A84C] hover:underline font-medium">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Forgot your password?</h1>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Enter your email and we'll send you a link to reset it.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="your@email.com"
                    className="w-full bg-[var(--bg-card)] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#C9A84C] hover:bg-[#F0C040] disabled:bg-[var(--bg-card)] disabled:text-[var(--text-secondary)] text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
          Remembered it?{' '}
          <Link href="/auth/login" className="text-[#C9A84C] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
