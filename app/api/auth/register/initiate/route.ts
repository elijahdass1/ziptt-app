export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { randomInt } from 'crypto'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/email'

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^(\+?1?-?868-?)?\d{3}-?\d{4}$/, 'Invalid TT phone number'),
  password: z.string().min(8).regex(/\d/, 'Must contain at least one number'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      const issues = parsed.error.issues ?? (parsed.error as any).errors ?? []
      return Response.json({ error: issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    const { name, email, phone, password } = parsed.data

    // Rate limit: 3 per phone per hour
    const rl = rateLimit(`otp-init:${phone}`, 3, 3_600_000)
    if (!rl.allowed) {
      return Response.json({ error: 'Too many attempts. Try again in an hour.' }, { status: 429 })
    }

    // Check email not already registered
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: 'An account with this email already exists.' }, { status: 400 })
    }

    // Clean phone to digits only for storage
    const cleanPhone = phone.replace(/\D/g, '').replace(/^1/, '')

    // Generate OTP with a CSPRNG — Math.random() is predictable from
    // enough observed outputs, which for a 6-digit login code is unsafe.
    const code = String(randomInt(100000, 1000000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Store OTP
    await prisma.otpCode.create({
      data: { phone: cleanPhone, code, expiresAt },
    })

    // Log the code to the server console for local dev only. NEVER in
    // production — Vercel runtime logs are readable and this would leak a
    // live credential next to the phone number it belongs to.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[zip.tt OTP] Code for ${cleanPhone}: ${code} (expires in 10 min)\n`)
    }

    // Store registration data in cookie for step 2
    const regData = Buffer.from(JSON.stringify({ name, email, phone: cleanPhone, password })).toString('base64')
    const cookieStore = cookies()
    cookieStore.set('zip_reg', regData, { httpOnly: true, maxAge: 600, path: '/' })

    let channel: 'sms' | 'email' | 'console' = 'console'

    // If Twilio configured, send real SMS
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const twilio = require('twilio')
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        await client.messages.create({
          body: `Your zip.tt verification code is: ${code}. Valid for 10 minutes.`,
          from: process.env.TWILIO_FROM_NUMBER ?? '',
          to: `+1868${cleanPhone}`,
        })
        channel = 'sms'
      } catch (smsError) {
        console.error('SMS failed:', smsError)
      }
    }

    // If SMS not sent, fall back to email via Resend so the code actually
    // reaches the user — without this, an unconfigured Twilio silently
    // strands every signup at the OTP step with no way to receive the code.
    if (channel !== 'sms') {
      const emailResult = await sendEmail({
        to: email,
        subject: 'Your zip.tt verification code',
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#C9A84C">zip.tt verification</h2>
          <p>Hi ${name},</p>
          <p>Your verification code is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px 0;color:#0A0A0A;background:#f5f5f5;border-radius:8px;margin:16px 0">${code}</div>
          <p style="color:#666">This code expires in 10 minutes. Do not share it with anyone.</p>
          <p style="color:#999;font-size:12px">If you did not request this, you can safely ignore this email.</p>
        </div>`,
      })
      if (emailResult.ok) channel = 'email'
    }

    return Response.json({ success: true, message: 'Verification code sent', channel })
  } catch (error) {
    console.error('[zip.tt API Error]:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
