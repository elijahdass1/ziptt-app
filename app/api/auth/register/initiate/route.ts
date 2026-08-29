export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { randomInt } from 'crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { passwordSchema } from '@/lib/passwordPolicy'

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^(\+?1?-?868-?)?\d{3}-?\d{4}$/, 'Invalid TT phone number'),
  password: passwordSchema,
})

// Uniform response the client always gets once input validation passes, so an
// attacker can't tell a fresh signup apart from an address that's already
// registered. Both advance the UI to the "enter the code" step.
const SENT_RESPONSE = { success: true, message: 'Verification code sent', channel: 'email' as const }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      const issues = parsed.error.issues ?? (parsed.error as any).errors ?? []
      return Response.json({ error: issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    const { name, email, phone, password } = parsed.data

    // Clean phone to digits only for storage
    const cleanPhone = phone.replace(/\D/g, '').replace(/^1/, '')

    // Rate limit: 3 sends per phone per hour, counted in the DB so the ceiling
    // survives serverless instance churn (an in-memory Map resets per Lambda).
    const windowStart = new Date(Date.now() - 3_600_000)
    const recentSends = await prisma.otpCode.count({
      where: { phone: cleanPhone, createdAt: { gt: windowStart } },
    })
    if (recentSends >= 3) {
      return Response.json({ error: 'Too many attempts. Try again in an hour.' }, { status: 429 })
    }

    // Opportunistic cleanup: drop this phone's rows older than the rate-limit
    // window so used/expired OTPs (each a stored credential) don't pile up.
    // Rows inside the window are kept — they still count toward the limit.
    await prisma.otpCode.deleteMany({
      where: { phone: cleanPhone, createdAt: { lt: windowStart } },
    })

    // Enumeration guard: if the address is already registered, do NOT create a
    // pending registration or send a code. Notify the real owner instead and
    // return the same generic response, so the caller learns nothing.
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      await sendEmail({
        to: email,
        subject: 'Someone tried to register with your zip.tt email',
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#C9A84C">zip.tt security notice</h2>
          <p>Someone just tried to create a new zip.tt account using this email address, which already has an account.</p>
          <p>If this was you, there's nothing to do — just sign in as usual. If you've forgotten your password, use the "Forgot password?" link on the sign-in page.</p>
          <p style="color:#999;font-size:12px">If this wasn't you, you can safely ignore this email — no account was created or changed.</p>
        </div>`,
      })
      return Response.json(SENT_RESPONSE)
    }

    // Generate OTP with a CSPRNG — Math.random() is predictable from
    // enough observed outputs, which for a 6-digit login code is unsafe.
    const code = String(randomInt(100000, 1000000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Hash the password up front. The pending registration lives server-side on
    // the OTP row (see below), so a plaintext password never leaves this
    // function — the old base64 cookie exposed it to anyone who read the cookie.
    const hashedPassword = await bcrypt.hash(password, 12)

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

    // Store the OTP together with the pending registration. deliveredByEmail
    // records whether the code actually reached the email inbox — verify-otp
    // only stamps emailVerified when that's true, so it can never be set by a
    // code that was delivered by SMS (or logged to the dev console).
    await prisma.otpCode.create({
      data: {
        phone: cleanPhone,
        code,
        expiresAt,
        regName: name,
        regEmail: email,
        regPassword: hashedPassword,
        deliveredByEmail: channel === 'email',
      },
    })

    // Log the code to the server console for local dev only. NEVER in
    // production — Vercel runtime logs are readable and this would leak a
    // live credential next to the phone number it belongs to.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[zip.tt OTP] Code for ${cleanPhone}: ${code} (expires in 10 min)\n`)
    }

    return Response.json({ ...SENT_RESPONSE, channel })
  } catch (error) {
    console.error('[zip.tt API Error]:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
