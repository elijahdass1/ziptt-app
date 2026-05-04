export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/driver/orders/[id]/accept
// A driver claims an unassigned PROCESSING order. Uses updateMany with a
// `driverId: null` predicate so two drivers can't both claim the same order
// — only the first request wins, the second sees count=0 and gets a 409.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'DRIVER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
  }

  // Atomic claim: only succeeds if order is still unassigned and PROCESSING.
  const res = await prisma.order.updateMany({
    where: { id, driverId: null, status: 'PROCESSING' },
    data: {
      driverId: session.user.id,
      assignedAt: new Date(),
      status: 'OUT_FOR_DELIVERY',
    },
  })

  if (res.count === 0) {
    return NextResponse.json(
      { error: 'Order is no longer available — another driver may have claimed it' },
      { status: 409 }
    )
  }

  return NextResponse.json({ ok: true })
}
