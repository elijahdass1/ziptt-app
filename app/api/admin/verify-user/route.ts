import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
