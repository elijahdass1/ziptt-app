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
        toast({ title: 'Invalid email or password', variant: 'destructive' })
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => signIn('google', { callbackUrl })

  const gold = '#C9A84C'
  const bg = '#0A0A0A'
  const card = '#111111'
  const inputBg = '#1A1A1A'
  const inputBorder = '#2A2A2A'
  const text = '#F5F0E8'
  const muted = '#9A8F7A'

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
        <div style={{ background: card, border: `1px solid #2A2A2A`, borderRadius: '16px', padding: '32px' }}>
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
              <label style={{ display: 'block', fontSize: '13px', color: muted, marginBottom: '6px', fontWeight: '500' }}>
                Password
              </label>
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
                color: '#0A0A0A', border: 'none', borderRadius: '10px',
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

          {/* Test accounts */}
          <div style={{ borderTop: `1px solid ${inputBorder}`, marginTop: '20px', paddingTop: '16px' }}>
            <p style={{ fontSize: '11px', color: muted, textAlign: 'center', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Test Accounts
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Customer', email: 'customer@zip.tt', pass: 'customer123' },
                { label: 'Vendor', email: 'info@trinitechhub.tt', pass: 'TechHub2026' },
                { label: 'Admin', email: 'elijah.dass1@gmail.com', pass: 'TridentAdmin2026!' },
              ].map(acc => (
                <button
                  key={acc.label}
                  onClick={() => { setEmail(acc.email); setPassword(acc.pass) }}
                  style={{
                    border: `1px solid ${inputBorder}`, borderRadius: '8px', padding: '7px 10px',
                    background: inputBg, color: muted, fontSize: '12px', cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = gold)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = inputBorder)}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
