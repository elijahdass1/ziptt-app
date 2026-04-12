import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { VendorActions } from '@/components/admin/VendorActions'

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border border-green-500/30',
  ACTIVE: 'bg-green-500/20 text-green-400 border border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border border-red-500/30',
  SUSPENDED: 'bg-[#333] text-[#888] border border-[#444]',
}

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const page = Number(searchParams.page ?? 1)
  const limit = 20
  const skip = (page - 1) * limit
  const activeTab = searchParams.status ?? 'All'

  // Fetch ALL vendors — filtering happens in UI
  const vendors = await prisma.vendor.findMany({
    include: {
      user: {
        select: { name: true, email: true, idVerified: true }
      },
      _count: {
        select: { products: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Filter in component
  const filteredVendors = activeTab === 'All'
    ? vendors
    : vendors.filter(v => v.status === activeTab.toUpperCase())

  const total = filteredVendors.length
  const pagedVendors = filteredVendors.slice(skip, skip + limit)
  const pages = Math.ceil(total / limit)

  const tabs = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Suspended', value: 'Suspended' },
  ]

  return (
    <div className="bg-[#0A0A0A] min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#F5F0E8]" style={{ fontFamily: 'Georgia,serif' }}>
          Vendors
        </h1>
        <p className="text-sm text-[#888] mt-1">{total.toLocaleString()} vendor{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#1a1a1a]">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={`?status=${tab.value}`}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg -mb-px border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-[#888] hover:text-[#F5F0E8]'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#0A0A0A]">
                {['Store', 'Owner', 'ID Verified', 'Region', 'Status', 'Products', 'Chargebacks', 'Applied', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-medium text-[#555] uppercase tracking-wide ${
                      i === 8 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedVendors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-[#555]">
                    No vendors found
                  </td>
                </tr>
              ) : (
                pagedVendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-[#1a1a1a] hover:bg-[#0A0A0A] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#F5F0E8]">{vendor.storeName}</p>
                      <p className="text-xs text-[#555]">/{vendor.slug}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[#F5F0E8]">{vendor.user.name}</p>
                      <p className="text-xs text-[#555]">{vendor.user.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      {vendor.user.idVerified ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">Verified</span>
                      ) : vendor.idDocumentUrl ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Pending</span>
                      ) : (
                        <span className="text-[#555] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#888] text-xs">{vendor.region ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[vendor.status] ?? 'bg-[#333] text-[#888]'}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#888]">{vendor._count.products}</td>
                    <td className="px-5 py-3 text-[#888]">{vendor.chargebackCount}</td>
                    <td className="px-5 py-3 text-xs text-[#555]">{formatDate(vendor.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {vendor.idDocumentUrl && (
                          <a href={vendor.idDocumentUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-2 py-1 border border-[#C9A84C]/30 text-[#C9A84C] rounded-lg hover:bg-[#C9A84C]/10 transition-colors">
                            Docs
                          </a>
                        )}
                        <VendorActions
                          vendorId={vendor.id}
                          currentStatus={vendor.status}
                          storeName={vendor.storeName}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-5 py-4 border-t border-[#1a1a1a] flex items-center justify-between">
            <p className="text-xs text-[#888]">Page {page} of {pages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`?status=${activeTab}&page=${page - 1}`}
                  className="text-sm px-3 py-1 border border-[#333] text-[#888] rounded-lg hover:bg-[#111111] transition-colors"
                >
                  Prev
                </a>
              )}
              {page < pages && (
                <a
                  href={`?status=${activeTab}&page=${page + 1}`}
                  className="text-sm px-3 py-1 border border-[#333] text-[#888] rounded-lg hover:bg-[#111111] transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
