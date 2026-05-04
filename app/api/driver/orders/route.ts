export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/driver/orders?scope=available|mine
// - available: unassigned PROCESSING orders the driver can claim
// - mine: orders currently assigned to the requesting driver (default)
//
// Role-gated: only DRIVER or ADMIN may call.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const role = session.user.role
  if (role !== 'DRIVER' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope') === 'available' ? 'available' : 'mine'

  // We treat "available" as orders that have been picked/packed and need
  // pickup → status PROCESSING with no driver assigned. Vendors (or admin)
  // bump orders to PROCESSING when they're ready for pickup.
  const where =
    scope === 'available'
      ? { driverId: null, status: 'PROCESSING' as const }
      : { driverId: session.user.id, status: { in: ['PROCESSING', 'OUT_FOR_DELIVERY'] } }

  const orders = await prisma.order.findMany({
    where: where as any,
    orderBy: { createdAt: 'asc' },
    take: 100,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      phone: true,
      instructions: true,
      assignedAt: true,
      createdAt: true,
      vendor: { select: { id: true, storeName: true, phone: true, address: true, region: true } },
      address: { select: { street: true, city: true, region: true } },
      customer: { select: { name: true, phone: true } },
      items: {
        select: {
          quantity: true,
          product: { select: { name: true } },
        },
      },
    },
  })

  return NextResponse.json({ orders })
}
