export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { formatTTD, formatDate } from '@/lib/utils'
import Link from 'next/link'

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  PROCESSING: 'bg-blue-500/20 text-blue-400',
  SHIPPED: 'bg-indigo-500/20 text-indigo-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
  REFUNDED: 'bg-purple-500/20 text-purple-400',
}

async function getAdminStats() {
  const [
    totalUsers,
    totalVendors,
    totalProducts,
    totalOrders,
    pendingVendors,
    openDisputes,
    recentOrders,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
    prisma.vendor.count({ where: { status: 'APPROVED' } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.vendor.count({ where: { status: 'PENDING' } }),
    prisma.dispute.count({ where: { status: 'OPEN' } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true } },
        vendor: { select: { storeName: true } },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } },
    }),
  ])

  return {
    totalUsers,
    totalVendors,
    totalProducts,
    totalOrders,
    pendingVendors,
    openDisputes,
    recentOrders,
    gmv: revenueAgg._sum.total ?? 0,
  }
}

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/auth/login')

  const stats = await getAdminStats()

  return (
    <div className="bg-[#0A0A0A] min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#F5F0E8]" style={{ fontFamily: 'Georgia,serif' }}>
          Platform Overview
        </h1>
        <p className="text-sm text-[#888] mt-1">Real-time stats for zip.tt marketplace</p>
      </div>

      {/* Alert banners */}
      {(stats.pendingVendors > 0 || stats.openDisputes > 0) && (
        <div className="mb-6 space-y-2">
          {stats.pendingVendors > 0 && (
            <Link
              href="/admin/vendors?status=PENDING"
              className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/15 transition-colors"
            >
              <span className="text-yellow-400 text-lg">â³</span>
              <span className="text-sm font-medium text-yellow-300">
                {stats.pendingVendors} vendor application{stats.pendingVendors > 1 ? 's' : ''} awaiting review
              </span>
            </Link>
          )}
          {stats.openDisputes > 0 && (
            <Link
              href="/admin/disputes?status=OPEN"
              className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/15 transition-colors"
            >
              <span className="text-red-400 text-lg">â </span>
              <span className="text-sm font-medium text-red-300">
                {stats.openDisputes} open dispute{stats.openDisputes > 1 ? 's' : ''} need attention
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers.toLocaleString() },
          { label: 'Active Vendors', value: stats.totalVendors.toLocaleString() },
          { label: 'Active Products', value: stats.totalProducts.toLocaleString() },
          { label: 'Total Orders', value: stats.totalOrders.toLocaleString() },
        ].map((card) => (
          <div key={card.label} className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5">
            <p className="text-xs text-[#888] mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-[#F5F0E8]">{card.value}</p>
          </div>
        ))}

        {/* GMV â full width */}
        <div className="col-span-2 lg:col-span-4 bg-[#111111] border border-[#C9A84C]/20 rounded-xl p-5">
          <p className="text-xs text-[#888] mb-1">Gross Merchandise Value (all time)</p>
          <p className="text-3xl font-bold text-[#C9A84C]">{formatTTD(stats.gmv)}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { href: '/admin/vendors?status=PENDING', label: 'Pending Vendors', count: stats.pendingVendors, color: 'text-yellow-400' },
          { href: '/admin/disputes?status=OPEN', label: 'Open Disputes', count: stats.openDisputes, color: 'text-red-400' },
          { href: '/admin/vendors', label: 'All Vendors', count: null, color: 'text-[#C9A84C]' },
          { href: '/admin/products', label: 'All Products', count: null, color: 'text-[#C9A84C]' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-[#111111] border border-[#1a1a1a] hover:border-[#C9A84C]/30 rounded-xl p-4 transition-colors"
          >
            <p className={`text-xs font-medium ${link.color}`}>{link.label}</p>
            {link.count !== null && (
              <p className="text-xl font-bold text-[#F5F0E8] mt-1">{link.count}</p>
            )}
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between">
          <h2 className="font-semibold text-[#F5F0E8]" style={{ fontFamily: 'Georgia,serif' }}>
            Recent Orders
          </h2>
          <Link href="/admin/orders" className="text-sm text-[#C9A84C] hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#0A0A0A]">
                {['Order ID', 'Customer', 'Vendor', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#555] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#555]">
                    No orders yet
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#1a1a1a] hover:bg-[#0A0A0A] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-[#555]">
                      {order.id.slice(0, 8)}â¦
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#F5F0E8]">{order.customer.name}</p>
                      <p className="text-xs text-[#555]">{order.customer.email}</p>
                    </td>
                    <td className="px-5 py-3 text-[#888]">{order.vendor?.storeName ?? 'â'}</td>
                    <td className="px-5 py-3 font-medium text-[#F5F0E8]">{formatTTD(order.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[order.status] ?? 'bg-[#333] text-[#888]'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#555]">{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
