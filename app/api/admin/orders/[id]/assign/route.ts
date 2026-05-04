export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/admin/orders/[id]/assign  body: { driverId: string | null }
// Admin assigns or unassigns a driver. Passing null clears the assignment
// and reverts status to PROCESSING (so it goes back into the available queue).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { driverId?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const driverId = body.driverId === null || body.driverId === '' ? null : body.driverId
  if (driverId !== null && typeof driverId !== 'string') {
    return NextResponse.json({ error: 'Invalid driverId' }, { status: 400 })
  }

  // Verify driver exists and has role DRIVER (or ADMIN, in case admin self-assigns).
  if (driverId) {
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
      select: { role: true, status: true },
    })
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }
    if (driver.role !== 'DRIVER' && driver.role !== 'ADMIN') {
      return NextResponse.json({ error: 'User is not a driver' }, { status: 400 })
    }
    if (driver.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Driver account is not active' }, { status: 400 })
    }
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: { status: true },
  })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    return NextResponse.json(
      { error: `Cannot reassign a ${order.status.toLowerCase()} order` },
      { status: 400 }
    )
  }

  await prisma.order.update({
    where: { id: params.id },
    data: driverId
      ? {
          driverId,
          assignedAt: new Date(),
          status: 'OUT_FOR_DELIVERY',
        }
      : {
          driverId: null,
          assignedAt: null,
          // Bump back to PROCESSING so it re-enters the driver queue.
          status: 'PROCESSING',
        },
  })

  return NextResponse.json({ ok: true })
}
