export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'
import { cookies } from 'next/headers'

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

    // Generate OTP
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Store OTP
    await prisma.otpCode.create({
      data: { phone: cleanPhone, code, expiresAt },
    })

    // DEV: log to console
    console.log(`\n[zip.tt OTP] Code for ${cleanPhone}: ${code} (expires in 10 min)\n`)

    // Store registration data in cookie for step 2
    const regData = Buffer.from(JSON.stringify({ name, email, phone: cleanPhone, password })).toString('base64')
    const cookieStore = cookies()
    cookieStore.set('zip_reg', regData, { httpOnly: true, maxAge: 600, path: '/' })

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
      } catch (smsError) {
        console.error('SMS failed:', smsError)
        // Don't fail â OTP still printed to console
      }
    }

    return Response.json({ success: true, message: 'Verification code sent' })
  } catch (error) {
    console.error('[zip.tt API Error]:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
