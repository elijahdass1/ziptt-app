export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const schema = z.object({
  phone: z.string(),
  code: z.string().length(6),
})

// Generic failure so a caller can't distinguish "no such pending signup",
// "wrong code", and "expired" from one another.
const INVALID = Response.json(
  { error: 'Invalid or expired code. Please try again.' },
  { status: 400 }
)

const MAX_ATTEMPTS = 5

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }
    const { phone, code } = parsed.data

    // All live pending registrations for this phone (newest first). Each row
    // carries its own reg data; a resend just adds a newer row.
    const pending = await prisma.otpCode.findMany({
      where: {
        phone,
        used: false,
        expiresAt: { gt: new Date() },
        regEmail: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (pending.length === 0) return INVALID

    // Enforce the attempt ceiling in the DB (not an in-memory Map, which resets
    // on every cold/other serverless instance) so a 6-digit code can't be
    // brute-forced. The newest row is the attempt counter.
    const counter = pending[0]
    if (counter.attempts >= MAX_ATTEMPTS) {
      return Response.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    // Match against any live code for this phone (covers resends).
    const otp = pending.find((row) => row.code === code)
    if (!otp) {
      await prisma.otpCode.update({
        where: { id: counter.id },
        data: { attempts: { increment: 1 } },
      })
      return INVALID
    }

    if (!otp.regEmail || !otp.regName || !otp.regPassword) return INVALID

    // Email must still be free (guards a race where two signups used the same
    // address). Generic response so this can't be used to enumerate either.
    const existing = await prisma.user.findUnique({ where: { email: otp.regEmail } })
    if (existing) {
      await prisma.otpCode.deleteMany({ where: { phone } })
      return INVALID
    }

    // Create the account from the server-side pending registration. The
    // password is already a bcrypt hash from initiate. emailVerified is only
    // stamped when the code was genuinely delivered to that email inbox — an
    // SMS-delivered code proves the phone, not the address, so setting it there
    // would let an attacker who owns the phone claim a victim's email and, via
    // allowDangerousEmailAccountLinking, later fuse it with the victim's Google.
    await prisma.user.create({
      data: {
        name: otp.regName,
        email: otp.regEmail,
        password: otp.regPassword,
        phone: otp.phone,
        phoneVerified: !otp.deliveredByEmail,
        role: 'CUSTOMER',
        emailVerified: otp.deliveredByEmail ? new Date() : null,
      },
    })

    // Consume every pending row for this phone so used codes don't linger.
    await prisma.otpCode.deleteMany({ where: { phone } })

    return Response.json({ success: true, redirect: '/' })
  } catch (error) {
    console.error('[zip.tt API Error]:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
