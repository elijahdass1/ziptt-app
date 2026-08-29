export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createHash } from 'crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { passwordSchema } from '@/lib/passwordPolicy'

const schema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      const issues = parsed.error.issues ?? (parsed.error as any).errors ?? []
      return Response.json({ error: issues[0]?.message ?? 'Invalid request' }, { status: 400 })
    }
    const { token, password } = parsed.data

    const tokenHash = createHash('sha256').update(token).digest('hex')
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return Response.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Update the password and burn the token atomically. Also clear any other
    // outstanding reset tokens for this user so a second link can't be reused.
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword } }),
      prisma.passwordResetToken.updateMany({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: record.userId, id: { not: record.id } },
      }),
    ])

    return Response.json({ success: true, message: 'Your password has been reset. You can now sign in.' })
  } catch (error) {
    console.error('[zip.tt API Error]:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
