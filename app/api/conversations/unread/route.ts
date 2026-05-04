// Cheap unread-message count for the navbar badge.
//
// Counts messages where:
//   - the conversation belongs to the current user (as customer or as
//     vendor), AND
//   - the sender is NOT the current user, AND
//   - readAt is null
//
// Returns { count } so the client can render a small badge. Polled by
// the navbar at a leisurely interval (~30s) — this is a hint, not a
// realtime feed.
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ count: 0 })

  const myVendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  const count = await prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: session.user.id },
      conversation: {
        OR: [
          { customerId: session.user.id },
          ...(myVendor ? [{ vendorId: myVendor.id }] : []),
        ],
      },
    },
  })

  return NextResponse.json({ count })
}
