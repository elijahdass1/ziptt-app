export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/orders?status=PENDING|PROCESSING|...&driver=null|<id>
// Admin-only paginated list. Defaults to 100 most recent orders if no
// filters are supplied.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const driver = searchParams.get('driver') // 'null' = unassigned, or a driver id
  const search = searchParams.get('q')?.trim() || ''

  const where: any = {}
  if (status) where.status = status
  if (driver === 'null') where.driverId = null
  else if (driver) where.driverId = driver
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      phone: true,
      instructions: true,
      driverId: true,
      assignedAt: true,
      deliveredAt: true,
      createdAt: true,
      vendor: { select: { id: true, storeName: true } },
      address: { select: { street: true, city: true, region: true } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        select: {
          quantity: true,
          product: { select: { name: true } },
        },
      },
    },
  })

  // Resolve driver names in one query (no relation defined on Order.driverId).
  const driverIds = Array.from(new Set(orders.map((o) => o.driverId).filter((x): x is string => !!x)))
  const drivers = driverIds.length
    ? await prisma.user.findMany({
        where: { id: { in: driverIds } },
        select: { id: true, name: true, email: true, phone: true },
      })
    : []
  const driverMap = new Map(drivers.map((d) => [d.id, d]))

  return NextResponse.json({
    orders: orders.map((o) => ({
      ...o,
      driver: o.driverId ? driverMap.get(o.driverId) ?? null : null,
    })),
  })
}
