// Mark all unread messages in a conversation as read for the current user.
// Called when the chat panel opens or scrolls to bottom — the client doesn't
// need granular per-message read receipts in v1.
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    select: { customerId: true, vendor: { select: { userId: true } } },
  })
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isParticipant =
    conversation.customerId === session.user.id ||
    conversation.vendor.userId === session.user.id
  if (!isParticipant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Only mark messages from the OTHER party as read.
  await prisma.message.updateMany({
    where: {
      conversationId: params.id,
      senderId: { not: session.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
