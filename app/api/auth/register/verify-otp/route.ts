import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const schema = z.object({
  phone: z.string(),
  code: z.string().length(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }
    const { phone, code } = parsed.data

    // Rate limit: 5 attempts per phone per hour
    const rl = rateLimit(`otp-verify:${phone}`, 5, 3_600_000)
    if (!rl.allowed) {
      return Response.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    // Find valid OTP
    const otp = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!otp) {
      return Response.json({ error: 'Invalid or expired code. Please try again.' }, { status: 400 })
    }

    // Mark OTP used
    await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })

    // Get registration data from cookie
    const cookieStore = cookies()
    const regCookie = cookieStore.get('zip_reg')
    if (!regCookie) {
      return Response.json({ error: 'Registration session expired. Please start again.' }, { status: 400 })
    }

    let regData: { name: string; email: string; phone: string; password: string }
    try {
      regData = JSON.parse(Buffer.from(regCookie.value, 'base64').toString())
    } catch {
      return Response.json({ error: 'Registration session corrupted. Please start again.' }, { status: 400 })
    }

    // Check email still available
    const existing = await prisma.user.findUnique({ where: { email: regData.email } })
    if (existing) {
      return Response.json({ error: 'An account with this email already exists.' }, { status: 400 })
    }

    // Create user
    const hashedPassword = await bcrypt.hash(regData.password, 12)
    await prisma.user.create({
      data: {
        name: regData.name,
        email: regData.email,
        password: hashedPassword,
        phone: regData.phone,
        phoneVerified: true,
        role: 'CUSTOMER',
        emailVerified: new Date(),
      },
    })

    // Clear registration cookie
    cookieStore.delete('zip_reg')

    return Response.json({ success: true, redirect: '/' })
  } catch (error) {
    console.error('[zip.tt API Error]:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
