import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
  if (!vendor) return NextResponse.json({ error: 'Not a vendor' }, { status: 403 })

  const order = await prisma.order.findFirst({ where: { id: params.id, vendorId: vendor.id } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { status, trackingNumber } = await req.json()
  const updated = await prisma.order.update({
    where: { id: params.id },
    data: {
      status,
      ...(trackingNumber && { trackingNumber }),
      ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
    },
  })
  return NextResponse.json(updated)
}
