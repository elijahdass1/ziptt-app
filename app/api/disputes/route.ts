import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const disputes = await prisma.dispute.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      order: { select: { orderNumber: true, total: true } },
      vendor: { select: { storeName: true } },
    },
  })

  return NextResponse.json(disputes)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, reason, description, requestedResolution } = await req.json()

  if (!orderId || !reason || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate the order belongs to the user
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: session.user.id },
    select: { id: true, vendorId: true, status: true },
  })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Check no existing open dispute for this order
  const existingDispute = await prisma.dispute.findFirst({
    where: { orderId, customerId: session.user.id, status: { in: ['OPEN', 'IN_REVIEW'] } },
  })
  if (existingDispute) {
    return NextResponse.json({ error: 'A dispute is already open for this order' }, { status: 409 })
  }

  const dispute = await prisma.dispute.create({
    data: {
      orderId,
      customerId: session.user.id,
      vendorId: order.vendorId,
      subject: reason,
      description,
      resolution: requestedResolution ?? null,
      status: 'OPEN',
    },
  })

  return NextResponse.json(dispute, { status: 201 })
}
