export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  // Fetch all orders for this vendor (for revenue/order calculations)
  const allOrders = await prisma.order.findMany({
    where: { vendorId: vendor.id },
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Products stats
  const [totalProducts, activeProducts, outOfStockProducts] = await Promise.all([
    prisma.product.count({ where: { vendorId: vendor.id } }),
    prisma.product.count({ where: { vendorId: vendor.id, status: 'ACTIVE' } }),
    prisma.product.count({ where: { vendorId: vendor.id, stock: 0 } }),
  ])

  // Top 5 sellers by revenue (use orderItems)
  const orderItems = await prisma.orderItem.findMany({
    where: { order: { vendorId: vendor.id, status: { not: 'CANCELLED' } } },
    include: { product: { select: { name: true } } },
  })

  const productRevMap: Record<string, { name: string; unitsSold: number; revenue: number }> = {}
  for (const item of orderItems) {
    if (!productRevMap[item.productId]) {
      productRevMap[item.productId] = { name: item.product.name, unitsSold: 0, revenue: 0 }
    }
    productRevMap[item.productId].unitsSold += item.quantity
    productRevMap[item.productId].revenue += item.total
  }
  const topSellers = Object.values(productRevMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Revenue calculations
  const nonCancelledOrders = allOrders.filter((o) => o.status !== 'CANCELLED')
  const totalRevenue = nonCancelledOrders.reduce((s, o) => s + o.total, 0)

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const lastMonthDate = new Date(thisYear, thisMonth - 1, 1)
  const lastMonth = lastMonthDate.getMonth()
  const lastMonthYear = lastMonthDate.getFullYear()

  const thisMonthRevenue = nonCancelledOrders
    .filter((o) => {
      const d = new Date(o.createdAt)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })
    .reduce((s, o) => s + o.total, 0)

  const lastMonthRevenue = nonCancelledOrders
    .filter((o) => {
      const d = new Date(o.createdAt)
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
    })
    .reduce((s, o) => s + o.total, 0)

  const growth =
    lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : thisMonthRevenue > 0
      ? 100
      : 0

  // Order stats
  const totalOrders = allOrders.length
  const pendingOrders = allOrders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING').length
  const completedOrders = allOrders.filter((o) => o.status === 'DELIVERED').length
  const cancelledOrders = allOrders.filter((o) => o.status === 'CANCELLED').length

  // Revenue by last 6 months
  const revenueByMonth: { month: string; revenue: number; orders: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(thisYear, thisMonth - i, 1)
    const m = d.getMonth()
    const y = d.getFullYear()
    const monthOrders = nonCancelledOrders.filter((o) => {
      const od = new Date(o.createdAt)
      return od.getMonth() === m && od.getFullYear() === y
    })
    revenueByMonth.push({
      month: MONTH_NAMES[m],
      revenue: monthOrders.reduce((s, o) => s + o.total, 0),
      orders: monthOrders.length,
    })
  }

  // Recent orders (last 10)
  const recentOrders = allOrders.slice(0, 10).map((o) => ({
    id: o.id,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
    itemCount: o._count.items,
  }))

  return NextResponse.json({
    revenue: {
      total: totalRevenue,
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      growth,
    },
    orders: {
      total: totalOrders,
      pending: pendingOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
    },
    products: {
      total: totalProducts,
      active: activeProducts,
      outOfStock: outOfStockProducts,
    },
    topSellers,
    revenueByMonth,
    recentOrders,
  })
}
