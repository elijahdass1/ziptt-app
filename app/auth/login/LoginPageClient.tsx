'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export function LoginPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        // Roughly a quarter of accounts are OAuth-only (signed up with Google,
        // so they have no password). Without this hint they hit a dead-end
        // "invalid password" and assume login is broken — the #1 support
        // confusion. We don't reveal *which* emails are OAuth-only (that would
        // enable account enumeration), just nudge everyone toward the button.
        toast({
          title: 'Invalid email or password',
          description: 'If you signed up with Google, use "Continue with Google" above instead.',
          variant: 'destructive',
        })
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => signIn('google', { callbackUrl })
  const handleApple = () => signIn('apple', { callbackUrl })

  // Show the Apple button only once Apple Sign-In is configured. This flag must
  // be paired with the server-side APPLE_ID/APPLE_SECRET env vars (see lib/auth.ts)
  // — the provider is registered server-side only when those exist, so gating
  // the button on this public flag keeps the two in sync and avoids a button
  // that would fail with "provider not found".
  const appleEnabled = process.env.NEXT_PUBLIC_APPLE_ENABLED === 'true'

  // Reference the CSS variables so inline styles flip with the theme.
  // Gold is the same hex in both modes, so it stays a literal.
  const gold = '#C9A84C'
  const bg = 'var(--bg-primary)'
  const card = 'var(--bg-card)'
  const inputBg = 'var(--bg-surface)'
  const inputBorder = 'var(--border-color)'
  const text = 'var(--text-primary)'
  const muted = 'var(--text-secondary)'

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '40px', fontWeight: '900', color: gold, fontFamily: 'Georgia, serif' }}>zip</span>
            <span style={{ fontSize: '40px', fontWeight: '900', color: text, fontFamily: 'Georgia, serif' }}>.tt</span>
          </Link>
          <p style={{ color: muted, fontSize: '14px', marginTop: '8px' }}>
            Trinidad & Tobago's premier marketplace
          </p>
        </div>

        {/* Card */}
        <div style={{ background: card, border: `1px solid ${inputBorder}`, borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: text, marginBottom: '6px', fontFamily: 'Georgia, serif' }}>
            Welcome back
          </h1>
          <p style={{ color: muted, fontSize: '13px', marginBottom: '24px' }}>
            Sign in to your zip.tt account
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              border: `1px solid ${inputBorder}`, borderRadius: '10px', padding: '10px',
              fontSize: '14px', fontWeight: '500', color: text, background: inputBg,
              cursor: 'pointer', marginBottom: '20px', transition: 'border-color 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = gold)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = inputBorder)}
          >
            <svg style={{ height: '18px', width: '18px' }} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Apple — rendered only when Sign in with Apple is configured */}
          {appleEnabled && (
            <button
              onClick={handleApple}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                border: `1px solid ${inputBorder}`, borderRadius: '10px', padding: '10px',
                fontSize: '14px', fontWeight: '500', color: text, background: inputBg,
                cursor: 'pointer', marginBottom: '20px', transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = gold)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = inputBorder)}
            >
              <svg viewBox="0 0 24 24" style={{ height: '18px', width: '18px', fill: text }}>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: inputBorder }} />
            <span style={{ fontSize: '12px', color: muted }}>or sign in with email</span>
            <div style={{ flex: 1, height: '1px', background: inputBorder }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: muted, marginBottom: '6px', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: '100%', background: inputBg, border: `1px solid ${inputBorder}`,
                  borderRadius: '10px', padding: '10px 14px', color: text, fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={e => (e.currentTarget.style.borderColor = gold)}
                onBlur={e => (e.currentTarget.style.borderColor = inputBorder)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', color: muted, fontWeight: '500' }}>
                  Password
                </label>
                <Link href="/auth/forgot" style={{ fontSize: '12px', color: gold, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  style={{
                    width: '100%', background: inputBg, border: `1px solid ${inputBorder}`,
                    borderRadius: '10px', padding: '10px 40px 10px 14px', color: text, fontSize: '14px',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = gold)}
                  onBlur={e => (e.currentTarget.style.borderColor = inputBorder)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: muted, display: 'flex'
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', background: gold,
                color: '#0A0A0A' /* gold pill — text stays black both modes */, border: 'none', borderRadius: '10px',
                fontWeight: '700', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '4px'
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: muted, marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link href="/auth/register" style={{ color: gold, fontWeight: '600', textDecoration: 'none' }}>
              Join zip.tt free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
