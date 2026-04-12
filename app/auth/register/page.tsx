'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  // Step 1 fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)

  // Step 2 OTP
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Format phone display
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}`
  }

  const phoneDigits = phone.replace(/\D/g, '')

  useEffect(() => {
    if (resendCountdown > 0) {
      const t = setTimeout(() => setResendCountdown(r => r - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendCountdown])

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' })
      return
    }
    if (phoneDigits.length < 7) {
      toast({ title: 'Enter a valid TT phone number', variant: 'destructive' })
      return
    }
    if (!agreed) {
      toast({ title: 'Please accept the Terms of Service', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phoneDigits, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error || 'Failed to send code', variant: 'destructive' })
        return
      }
      setStep(2)
      setResendCountdown(60)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) {
      toast({ title: 'Enter the full 6-digit code', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneDigits, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error || 'Invalid code', variant: 'destructive' })
        return
      }
      // Auto sign in
      await signIn('credentials', { email, password, redirect: false })
      setStep(3)
      setTimeout(() => router.push('/'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCountdown > 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phoneDigits, password }),
      })
      if (res.ok) {
        toast({ title: 'New code sent!' })
        setResendCountdown(60)
        setOtp(['', '', '', '', '', ''])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <span className="text-3xl font-black gold-shimmer">zip</span>
            <span className="text-3xl font-black text-[#F5F0E8]">.tt</span>
          </Link>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s < step ? 'bg-[#C9A84C] text-[#0A0A0A]' :
                s === step ? 'bg-[#C9A84C] text-[#0A0A0A] ring-4 ring-[#C9A84C]/25' :
                'bg-[#1A1A1A] text-[#9A8F7A] border border-[#C9A84C]/20'
              }`}>
                {s < step ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`h-px w-8 transition-all ${s < step ? 'bg-[#C9A84C]' : 'bg-[#1A1A1A]'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-6 shadow-2xl">
          {/* Step 1 */}
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-[#F5F0E8] mb-1">Create your account</h1>
              <p className="text-sm text-[#9A8F7A] mb-6">Join thousands of shoppers on zip.tt 🇹🇹</p>
              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} required
                    placeholder="Your full name"
                    className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="your@email.com"
                    className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base select-none">🇹🇹</span>
                    <input value={phone} onChange={e => setPhone(formatPhone(e.target.value))} required
                      placeholder="868-123-4567"
                      maxLength={8}
                      className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent" />
                  </div>
                  <p className="text-xs text-[#9A8F7A] mt-1">e.g. 868-123-4567 — used for delivery &amp; verification</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                      placeholder="Min 8 chars, at least 1 number"
                      className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 pr-10 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8F7A] hover:text-[#C9A84C]">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    placeholder="Repeat your password"
                    className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent" />
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                    className="mt-0.5 accent-[#C9A84C]" />
                  <span className="text-sm text-[#9A8F7A]">
                    I agree to the{' '}
                    <Link href="/terms" className="text-[#C9A84C] hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-[#C9A84C] hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#C9A84C] hover:bg-[#F0C040] disabled:bg-[#1A1A1A] disabled:text-[#9A8F7A] text-[#0A0A0A] font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Sending code...' : 'Send Verification Code →'}
                </button>
              </form>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <h1 className="text-xl font-bold text-[#F5F0E8] mb-1">Verify your phone</h1>
              <p className="text-sm text-[#9A8F7A] mb-6">
                We sent a 6-digit code to <span className="text-[#C9A84C] font-medium">+1 (868) {phone}</span>.<br/>
                Check your terminal for the code in dev mode.
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-12 h-12 text-center text-xl font-bold bg-[#1A1A1A] border-2 border-[#C9A84C]/20 rounded-xl text-[#F5F0E8] focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25 transition-all"
                    />
                  ))}
                </div>
                <button type="submit" disabled={loading || otp.join('').length !== 6}
                  className="w-full py-3 bg-[#C9A84C] hover:bg-[#F0C040] disabled:bg-[#1A1A1A] disabled:text-[#9A8F7A] text-[#0A0A0A] font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Verifying...' : 'Verify Phone →'}
                </button>
                <div className="text-center">
                  {resendCountdown > 0 ? (
                    <p className="text-sm text-[#9A8F7A]">Resend in <span className="text-[#C9A84C] font-medium">{resendCountdown}s</span></p>
                  ) : (
                    <button type="button" onClick={handleResend} disabled={loading}
                      className="text-sm text-[#C9A84C] hover:underline">
                      Resend code
                    </button>
                  )}
                </div>
              </form>
              <button onClick={() => setStep(1)} className="mt-4 text-sm text-[#9A8F7A] hover:text-[#F5F0E8] w-full text-center">
                ← Change phone number
              </button>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl">🎉</div>
              <h1 className="text-2xl font-bold text-[#F5F0E8]">Welcome to zip.tt!</h1>
              <p className="text-[#9A8F7A]">Your account is ready. Redirecting you now...</p>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#C9A84C]" />
              </div>
            </div>
          )}
        </div>

        {step === 1 && (
          <p className="text-center text-sm text-[#9A8F7A] mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#C9A84C] hover:underline font-medium">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
