export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import { formatDate, formatTTD } from '@/lib/utils'
import { AdminDisputeActions } from '@/components/admin/AdminDisputeActions'

export default async function AdminDisputesPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const page = Number(searchParams.page ?? 1)
  const limit = 20
  const skip = (page - 1) * limit
  const statusFilter = searchParams.status ?? 'OPEN'

  const where: Record<string, unknown> = {}
  if (statusFilter !== 'ALL') where.status = statusFilter

  const [disputes, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { orderNumber: true, total: true, status: true } },
        customer: { select: { name: true, email: true } },
        vendor: { select: { storeName: true } },
      },
    }),
    prisma.dispute.count({ where }),
  ])

  const pages = Math.ceil(total / limit)

  const STATUS_COLOR: Record<string, string> = {
    OPEN: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    IN_REVIEW: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    RESOLVED_CUSTOMER: 'bg-green-500/20 text-green-400 border border-green-500/30',
    RESOLVED_VENDOR: 'bg-green-500/20 text-green-400 border border-green-500/30',
    CLOSED: 'bg-[#333] text-[#888] border border-[#444]',
  }

  const STATUS_LABEL: Record<string, string> = {
    OPEN: 'Open',
    IN_REVIEW: 'Under Review',
    RESOLVED_CUSTOMER: 'Resolved (Customer)',
    RESOLVED_VENDOR: 'Resolved (Vendor)',
    CLOSED: 'Closed',
  }

  const tabs = [
    { label: 'Open', value: 'OPEN' },
    { label: 'Under Review', value: 'IN_REVIEW' },
    { label: 'Resolved', value: 'RESOLVED_CUSTOMER' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'All', value: 'ALL' },
  ]

  return (
    <div className="bg-[var(--bg-primary)] min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia,serif' }}>
          Disputes
        </h1>
        <p className="text-sm text-[#888] mt-1">{total.toLocaleString()} disputes total</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--bg-card)] overflow-x-auto">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={`?status=${tab.value}`}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg -mb-px border-b-2 transition-colors ${
              statusFilter === tab.value
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-[#888] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <div className="space-y-4">
        {disputes.length === 0 ? (
          <div className="bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl p-10 text-center text-[#888]">
            No disputes found
          </div>
        ) : disputes.map((dispute) => (
          <div key={dispute.id} className="bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[dispute.status] ?? 'bg-[#333] text-[#888]'}`}>
                    {STATUS_LABEL[dispute.status] ?? dispute.status}
                  </span>
                  <span className="text-xs text-[#555]">#{dispute.id.slice(0, 8).toUpperCase()}</span>
                  <span className="text-xs text-[#555]">â¢ {formatDate(dispute.createdAt)}</span>
                </div>

                <h3 className="font-semibold text-[var(--text-primary)] mb-1">{dispute.subject}</h3>
                {dispute.description && (
                  <p className="text-sm text-[#888] mb-3 line-clamp-2">{dispute.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-[#555] mb-0.5">Customer</p>
                    <p className="font-medium text-[var(--text-primary)]">{dispute.customer.name}</p>
                    <p className="text-xs text-[#888]">{dispute.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#555] mb-0.5">Vendor</p>
                    <p className="font-medium text-[var(--text-primary)]">{dispute.vendor.storeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#555] mb-0.5">Order #</p>
                    <p className="font-mono font-medium text-[var(--text-primary)]">
                      #{dispute.order.orderNumber.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#555] mb-0.5">Order Total</p>
                    <p className="font-medium text-[var(--text-primary)]">{formatTTD(dispute.order.total)}</p>
                  </div>
                </div>

                {dispute.resolution && (
                  <div className="mt-3 p-3 bg-[var(--bg-primary)] border border-[var(--bg-card)] rounded-lg">
                    <p className="text-xs text-[#555] mb-0.5">Requested Resolution</p>
                    <p className="text-sm text-[var(--text-primary)]">{dispute.resolution}</p>
                  </div>
                )}
              </div>

              <div className="shrink-0">
                <AdminDisputeActions disputeId={dispute.id} currentStatus={dispute.status} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-[#888]">Page {page} of {pages}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={`?status=${statusFilter}&page=${page - 1}`}
                className="text-sm px-3 py-1 border border-[#333] text-[#888] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">Prev</a>
            )}
            {page < pages && (
              <a href={`?status=${statusFilter}&page=${page + 1}`}
                className="text-sm px-3 py-1 border border-[#333] text-[#888] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">Next</a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
