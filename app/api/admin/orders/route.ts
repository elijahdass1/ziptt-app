export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/orders
//
// Query params:
//   status   PENDING | PROCESSING | OUT_FOR_DELIVERY | DELIVERED | CANCELLED | REFUNDED
//   driver   'null' (unassigned) or a User.id
//   vendor   Vendor.id (single vendor filter)
//   q        free-text search across orderNumber / customer name / customer email
//   from     ISO date — only orders placed on/after this date
//   to       ISO date — only orders placed on/before this date (inclusive end-of-day)
//   page     1-based page index (default 1)
//   pageSize defaults to 20, capped at 100
//
// Admin-only. Returns:
//   { orders, total, page, pageSize, totalPages }
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status') || undefined
  const driver   = searchParams.get('driver')
  const vendorId = searchParams.get('vendor') || undefined
  const search   = searchParams.get('q')?.trim() || ''
  const from     = searchParams.get('from')
  const to       = searchParams.get('to')
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20') || 20))

  // Build the Prisma where filter incrementally so unset params don't
  // narrow the result set.
  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (driver === 'null') where.driverId = null
  else if (driver) where.driverId = driver
  if (vendorId) where.vendorId = vendorId
  if (search) {
    ;(where as { OR?: unknown[] }).OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }

  // Date range — accept ISO strings; "to" gets pushed to end-of-day so
  // a same-day from/to bracket includes everything that day.
  const createdAt: { gte?: Date; lte?: Date } = {}
  if (from) {
    const d = new Date(from)
    if (!isNaN(d.getTime())) createdAt.gte = d
  }
  if (to) {
    const d = new Date(to)
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999)
      createdAt.lte = d
    }
  }
  if (createdAt.gte || createdAt.lte) where.createdAt = createdAt

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
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
    }),
  ])

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
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  })
}
