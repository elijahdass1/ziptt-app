import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { AdminUserActions } from '@/components/admin/AdminUserActions'
import { Search } from 'lucide-react'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; status?: string; page?: string }
}) {
  const page = Number(searchParams.page ?? 1)
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = { role: { not: 'ADMIN' } }
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { email: { contains: searchParams.q } },
    ]
  }
  if (searchParams.role) where.role = searchParams.role
  if (searchParams.status) where.status = searchParams.status

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { vendor: { select: { storeName: true, status: true } } },
    }),
    prisma.user.count({ where }),
  ])

  const pages = Math.ceil(total / limit)

  const ROLE_COLOR: Record<string, string> = {
    CUSTOMER: 'bg-[#1A1A1A] text-[#888] border border-[#333]',
    VENDOR: 'bg-purple-900/30 text-purple-400 border border-purple-700/40',
  }
  const STATUS_COLOR: Record<string, string> = {
    ACTIVE: 'bg-green-900/30 text-green-400 border border-green-700/40',
    BANNED: 'bg-red-900/30 text-red-400 border border-red-700/40',
    PENDING: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/40',
  }

  return (
    <div className="bg-[#0A0A0A] min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#F5F0E8]" style={{ fontFamily: 'Georgia,serif' }}>Users</h1>
          <p className="text-sm text-[#888] mt-1">{total.toLocaleString()} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <form className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-[#1A1A1A] border border-[#333] text-[#F5F0E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] placeholder-[#555]"
          />
        </div>
        <select name="role" defaultValue={searchParams.role ?? ''} className="text-sm bg-[#1A1A1A] border border-[#333] text-[#F5F0E8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]">
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="VENDOR">Vendor</option>
        </select>
        <select name="status" defaultValue={searchParams.status ?? ''} className="text-sm bg-[#1A1A1A] border border-[#333] text-[#F5F0E8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
          <option value="PENDING">Pending</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-[#C9A84C] hover:bg-[#F0C040] text-[#0A0A0A] font-semibold text-sm rounded-lg transition-colors">Filter</button>
      </form>

      {/* Table */}
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#0A0A0A]">
                {['User', 'Phone', 'Role', 'Status', 'ID Status', 'Orders', 'Risk Score', 'Joined', 'Store', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-xs font-medium text-[#555] uppercase tracking-wide ${i === 9 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-10 text-center text-[#555]">No users found</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-[#1a1a1a] hover:bg-[#0A0A0A] transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#F5F0E8]">{user.name ?? '—'}</p>
                    <p className="text-xs text-[#555]">{user.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    {user.phone ? (
                      <div>
                        <p className="text-[#888] text-xs">{user.phone}</p>
                        {user.phoneVerified ? (
                          <span className="text-[10px] text-green-400">verified</span>
                        ) : (
                          <span className="text-[10px] text-[#555]">unverified</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[#555] text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[user.role] ?? 'bg-[#1A1A1A] text-[#888]'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[user.status] ?? 'bg-[#1A1A1A] text-[#888]'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {user.idVerified ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">Verified</span>
                    ) : user.idDocumentUrl ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Pending</span>
                    ) : (
                      <span className="text-[#555] text-xs">None</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[#888] text-sm">{user.totalOrders}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${
                      user.riskScore >= 70 ? 'text-red-400' :
                      user.riskScore >= 40 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {user.riskScore}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#555] text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-3 text-[#555] text-xs">
                    {user.vendor ? (
                      <span>{user.vendor.storeName} <span className="text-[#444]">({user.vendor.status})</span></span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <AdminUserActions userId={user.id} currentStatus={user.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-5 py-4 border-t border-[#1a1a1a] flex items-center justify-between">
            <p className="text-xs text-[#555]">Page {page} of {pages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                  className="text-sm px-3 py-1 border border-[#333] text-[#888] rounded-lg hover:bg-[#111111] transition-colors">Prev</a>
              )}
              {page < pages && (
                <a href={`?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
                  className="text-sm px-3 py-1 border border-[#333] text-[#888] rounded-lg hover:bg-[#111111] transition-colors">Next</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
