export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { randomBytes, createHash } from 'crypto'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { sendEmail, emailLayout } from '@/lib/email'

const schema = z.object({ email: z.string().email() })

// Always the same response, whether or not the address has an account, so this
// endpoint can't be used to enumerate customers.
const GENERIC = Response.json({
  success: true,
  message: 'If an account exists for that email, a reset link is on its way.',
})

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour
// Max reset emails per account per window. Enforced in the DB (not the
// in-memory rateLimit Map, which resets per Lambda) so this endpoint can't be
// used to bomb a victim's inbox by hammering it across serverless instances.
const MAX_RESETS_PER_WINDOW = 3

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    // Even on malformed input, don't leak anything distinguishing.
    if (!parsed.success) return GENERIC
    const { email } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    // Only issue a token for accounts that actually have a password to reset.
    // OAuth-only accounts (no password) sign in with Google/Apple; sending them
    // a reset link would be confusing and pointless.
    if (user && user.password) {
      const windowStart = new Date(Date.now() - TOKEN_TTL_MS)

      // Rate limit: count this account's tokens issued in the window (used or
      // not). At the ceiling, return the same generic response without sending
      // — indistinguishable from any other request, and no email goes out.
      const recentCount = await prisma.passwordResetToken.count({
        where: { userId: user.id, createdAt: { gt: windowStart } },
      })
      if (recentCount >= MAX_RESETS_PER_WINDOW) return GENERIC

      // Invalidate still-live tokens (mark used) so only the newest link works,
      // while keeping the rows for the rate-limit count above. Then sweep rows
      // older than the window so they don't accumulate.
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      })
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, createdAt: { lt: windowStart } },
      })

      const rawToken = randomBytes(32).toString('hex')
      const tokenHash = createHash('sha256').update(rawToken).digest('hex')
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
      })

      const base = (process.env.NEXTAUTH_URL ?? '').replace(/\/$/, '')
      const resetUrl = `${base}/auth/reset?token=${rawToken}`

      await sendEmail({
        to: email,
        subject: 'Reset your zip.tt password',
        html: emailLayout({
          preheader: 'Reset your zip.tt password',
          heading: 'Reset your password',
          body: `<p style="margin:0 0 12px;">We received a request to reset the password for your zip.tt account. Click the button below to choose a new one. This link expires in 1 hour.</p>
                 <p style="margin:0;color:#6E665A;">If you didn't request this, you can safely ignore this email — your password won't change.</p>`,
          cta: { label: 'Reset password', url: resetUrl },
        }),
      })
    }

    return GENERIC
  } catch (error) {
    console.error('[zip.tt API Error]:', error)
    // Still generic — never surface internal failure detail here.
    return GENERIC
  }
}
