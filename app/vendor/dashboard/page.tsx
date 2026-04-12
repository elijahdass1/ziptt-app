export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { VendorDashboardClient } from '@/components/vendor/VendorDashboardClient'

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/vendor/dashboard')

  const vendor = await prisma.vendor.findFirst({
    where: { userId: session.user.id as string },
  })
  if (!vendor) redirect('/vendor/register')

  const [products, orderStats] = await Promise.all([
    prisma.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true } } },
    }),
    prisma.orderItem.aggregate({
      where: { product: { vendorId: vendor.id } },
      _sum: { price: true },
      _count: true,
    }),
  ])

  const recentOrders = await prisma.order.findMany({
    where: { items: { some: { product: { vendorId: vendor.id } } } },
    include: {
      items: { include: { product: { select: { name: true } } } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  // Serialize dates for client component
  const serialisedOrders = recentOrders.map(o => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    estimatedDelivery: o.estimatedDelivery?.toISOString() ?? null,
    deliveredAt: o.deliveredAt?.toISOString() ?? null,
    deliveryConfirmedAt: o.deliveryConfirmedAt?.toISOString() ?? null,
    items: o.items.map(i => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
    })),
  }))

  const serialisedProducts = products.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <VendorDashboardClient
      vendor={vendor}
      products={serialisedProducts as any}
      totalRevenue={orderStats._sum.price ?? 0}
      totalOrders={orderStats._count}
      recentOrders={serialisedOrders as any}
    />
  )
}
