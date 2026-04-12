export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { VerificationActions } from '@/components/admin/VerificationActions'

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const tab = searchParams.tab ?? 'customers'

  const pendingCustomers = await prisma.user.findMany({
    where: {
      idDocumentUrl: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      idVerified: true,
      idDocumentUrl: true,
      idDocumentType: true,
      createdAt: true,
      totalOrders: true,
    },
  })

  const pendingVendors = await prisma.vendor.findMany({
    where: {
      status: 'PENDING',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, idVerified: true } },
    },
  })

  return (
    <div className="bg-[#0A0A0A] min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#F5F0E8]" style={{ fontFamily: 'Georgia,serif' }}>
          Verifications
        </h1>
        <p className="text-sm text-[#888] mt-1">
          {pendingCustomers.filter(u => !u.idVerified).length} pending customer IDs &bull; {pendingVendors.length} pending vendor applications
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#1a1a1a]">
        {[
          { label: 'Customer IDs', value: 'customers' },
          { label: 'Vendor Applications', value: 'vendors' },
        ].map((t) => (
          <a
            key={t.value}
            href={`?tab=${t.value}`}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg -mb-px border-b-2 transition-colors ${
              tab === t.value
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-[#888] hover:text-[#F5F0E8]'
            }`}
          >
            {t.label}
            {t.value === 'customers' && pendingCustomers.filter(u => !u.idVerified).length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded-full font-bold">
                {pendingCustomers.filter(u => !u.idVerified).length}
              </span>
            )}
            {t.value === 'vendors' && pendingVendors.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded-full font-bold">
                {pendingVendors.length}
              </span>
            )}
          </a>
        ))}
      </div>

      {/* Tab 1: Customer IDs */}
      {tab === 'customers' && (
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
          {pendingCustomers.length === 0 ? (
            <div className="px-5 py-10 text-center text-[#555]">No customer ID submissions</div>
          ) : (
            <div className="divide-y divide-[#1a1a1a]">
              {pendingCustomers.map((user) => (
                <div key={user.id} className="p-5 flex items-start gap-5">
                  {/* ID Preview */}
                  {user.idDocumentUrl && (
                    <a href={user.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <img
                        src={user.idDocumentUrl}
                        alt="ID Document"
                        className="w-24 h-16 object-cover rounded-lg border border-[#333] hover:opacity-80 transition-opacity"
                      />
                    </a>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#F5F0E8]">{user.name ?? 'â'}</p>
                        <p className="text-xs text-[#555]">{user.email}</p>
                        {user.phone && <p className="text-xs text-[#555]">{user.phone}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-[#9A8F7A]">
                            Doc: <span className="text-[#F5F0E8]">{user.idDocumentType ?? 'â'}</span>
                          </span>
                          <span className="text-xs text-[#9A8F7A]">
                            Orders: <span className="text-[#F5F0E8]">{user.totalOrders}</span>
                          </span>
                          <span className="text-xs text-[#9A8F7A]">
                            Submitted: <span className="text-[#F5F0E8]">{formatDate(user.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {user.idVerified ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            Approved
                          </span>
                        ) : (
                          <VerificationActions userId={user.id} type="customer" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Vendor Applications */}
      {tab === 'vendors' && (
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl overflow-hidden">
          {pendingVendors.length === 0 ? (
            <div className="px-5 py-10 text-center text-[#555]">No pending vendor applications</div>
          ) : (
            <div className="divide-y divide-[#1a1a1a]">
              {pendingVendors.map((vendor) => (
                <div key={vendor.id} className="p-5 flex items-start gap-5">
                  {/* ID preview if available */}
                  {vendor.idDocumentUrl && (
                    <a href={vendor.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <img
                        src={vendor.idDocumentUrl}
                        alt="Vendor ID"
                        className="w-24 h-16 object-cover rounded-lg border border-[#333] hover:opacity-80 transition-opacity"
                      />
                    </a>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#F5F0E8]">{vendor.storeName}</p>
                        <p className="text-xs text-[#555]">Owner: {vendor.user.name} &bull; {vendor.user.email}</p>
                        {vendor.region && <p className="text-xs text-[#555]">{vendor.region}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-[#9A8F7A]">
                            Applied: <span className="text-[#F5F0E8]">{formatDate(vendor.createdAt)}</span>
                          </span>
                          {vendor.idDocumentType && (
                            <span className="text-xs text-[#9A8F7A]">
                              Doc: <span className="text-[#F5F0E8]">{vendor.idDocumentType}</span>
                            </span>
                          )}
                          {vendor.user.idVerified && (
                            <span className="text-xs text-green-400">ID Verified</span>
                          )}
                        </div>
                        {vendor.description && (
                          <p className="text-xs text-[#9A8F7A] mt-1 line-clamp-2">{vendor.description}</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        <VerificationActions userId={vendor.user.email ?? vendor.id} type="vendor" vendorId={vendor.id} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
