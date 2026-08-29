'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { MIN_PASSWORD_LENGTH, PASSWORD_POLICY_HINT, checkPassword } from '@/lib/passwordPolicy'

export function ResetPasswordClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' })
      return
    }
    const pwCheck = checkPassword(password)
    if (!pwCheck.ok) {
      toast({ title: pwCheck.error, variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({ title: data.error || 'Could not reset password', variant: 'destructive' })
        return
      }
      setDone(true)
      setTimeout(() => router.push('/auth/login'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const missingToken = !token

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
          {done ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle className="h-10 w-10 text-[#C9A84C] mx-auto" />
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Password reset</h1>
              <p className="text-sm text-[var(--text-secondary)]">Redirecting you to sign in...</p>
            </div>
          ) : missingToken ? (
            <div className="text-center py-6 space-y-4">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Invalid reset link</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                This link is missing or malformed. Request a new one from the forgot-password page.
              </p>
              <Link href="/auth/forgot" className="inline-block text-sm text-[#C9A84C] hover:underline font-medium">
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Choose a new password</h1>
              <p className="text-sm text-[var(--text-secondary)] mb-6">{PASSWORD_POLICY_HINT}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">New password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={MIN_PASSWORD_LENGTH}
                      placeholder={PASSWORD_POLICY_HINT}
                      className="w-full bg-[var(--bg-card)] border border-[#C9A84C]/20 rounded-xl px-4 pr-10 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[#C9A84C]">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Confirm new password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    placeholder="Repeat your new password"
                    className="w-full bg-[var(--bg-card)] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#C9A84C] hover:bg-[#F0C040] disabled:bg-[var(--bg-card)] disabled:text-[var(--text-secondary)] text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
          <Link href="/auth/login" className="text-[#C9A84C] hover:underline font-medium">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
