export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin()
    if (!guard.ok) return guard.response
    const session = guard.session

    const { userId, action } = await req.json()
    if (!userId || !['approve', 'reject'].includes(action)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (action === 'approve') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          idVerified: true,
          idVerifiedAt: new Date(),
          idVerifiedBy: session.user.id,
        },
      })
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          idDocumentUrl: null,
          idDocumentType: null,
          idVerified: false,
        },
      })
    }

    console.log(`[zip.tt] Admin ${session.user.id} ${action}d ID for user ${userId}`)

    return Response.json({ success: true })
  } catch (error) {
    console.error('[zip.tt API Error]:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
