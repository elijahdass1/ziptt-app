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
//
// Defensive: the underlying Message + Conversation models were removed
// from prisma/schema.prisma at some point, so `prisma.message` is
// undefined on the current client. Without a guard, every poll throws
// `TypeError: Cannot read properties of undefined (reading 'count')`
// and floods the Vercel runtime logs with 500s. Until the messaging
// schema is restored, we return { count: 0 } and quietly log so the
// navbar badge stays clean.
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ count: 0 })

    // Cast to any so the missing-model case (prisma.message === undefined)
    // doesn't fight TypeScript. The try/catch below is the real safety net.
    const p = prisma as any
    if (!p?.message?.count) {
      // Schema doesn't include messaging — feature shipped without the
      // backing models. Treat as zero unread.
      return NextResponse.json({ count: 0 })
    }

    const myVendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    const count = await p.message.count({
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

    return NextResponse.json({ count: count ?? 0 })
  } catch (e) {
    // Last-resort guard: never let this route throw a 500. The badge
    // is non-critical UI and a stuck zero is preferable to a crash.
    console.warn('[conversations/unread] fell back to 0:', e instanceof Error ? e.message : e)
    return NextResponse.json({ count: 0 })
  }
}
