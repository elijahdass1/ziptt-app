export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/driver/orders/[id]/deliver
// Driver marks an order delivered. We require the order to be assigned to
// THIS driver (or the caller is an admin) to prevent rogue updates.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const role = session.user.role
  if (role !== 'DRIVER' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
  }

  // Admins can mark any order delivered; drivers can only mark their own.
  const where: any =
    role === 'ADMIN'
      ? { id, status: { in: ['PROCESSING', 'OUT_FOR_DELIVERY'] } }
      : { id, driverId: session.user.id, status: { in: ['PROCESSING', 'OUT_FOR_DELIVERY'] } }

  const res = await prisma.order.updateMany({
    where,
    data: {
      status: 'DELIVERED',
      deliveredAt: new Date(),
    },
  })

  if (res.count === 0) {
    return NextResponse.json(
      { error: 'Order not found, not assigned to you, or already delivered' },
      { status: 409 }
    )
  }

  return NextResponse.json({ ok: true })
}
