export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { formatDate } from '@/lib/utils'
import { DisputeFormWrapper } from '@/components/account/DisputeFormWrapper'

const STATUS_BADGE: Record<string, string> = {
  OPEN: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  IN_REVIEW: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  RESOLVED_CUSTOMER: 'bg-green-500/20 text-green-400 border border-green-500/30',
  RESOLVED_VENDOR: 'bg-green-500/20 text-green-400 border border-green-500/30',
  CLOSED: 'bg-[#333] text-[#888] border border-[#444]',
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Open',
  IN_REVIEW: 'Under Review',
  RESOLVED_CUSTOMER: 'Resolved',
  RESOLVED_VENDOR: 'Resolved',
  CLOSED: 'Closed',
}

export default async function DisputesPage({
  searchParams,
}: {
  searchParams: { orderId?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login?callbackUrl=/account/disputes')

  const disputes = await prisma.dispute.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      order: { select: { orderNumber: true, total: true } },
      vendor: { select: { storeName: true } },
    },
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1
            className="text-2xl font-semibold text-[#F5F0E8]"
            style={{ fontFamily: 'Georgia,serif' }}
          >
            My Disputes
          </h1>
        </div>

        {/* Dispute form wrapper (client component for toggle) */}
        <DisputeFormWrapper preselectedOrderId={searchParams.orderId} />

        {disputes.length === 0 ? (
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-12 text-center">
            <p className="text-4xl mb-3">ð</p>
            <p className="text-[#F5F0E8] font-semibold mb-1">No disputes opened yet</p>
            <p className="text-[#888] text-sm">
              If you have an issue with an order, open a dispute above.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {disputes.map((dispute) => (
              <div
                key={dispute.id}
                className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          STATUS_BADGE[dispute.status] ?? 'bg-[#333] text-[#888]'
                        }`}
                      >
                        {STATUS_LABEL[dispute.status] ?? dispute.status}
                      </span>
                      <span className="text-xs text-[#555]">
                        #{dispute.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    <p className="font-semibold text-[#F5F0E8] mb-0.5">
                      {dispute.subject}
                    </p>
                    <p className="text-xs text-[#888] mb-2">
                      Order #{dispute.order.orderNumber.slice(-8).toUpperCase()} â¢{' '}
                      {dispute.vendor.storeName}
                    </p>

                    {dispute.resolution && (
                      <p className="text-xs text-[#888]">
                        <span className="text-[#C9A84C]">Requested: </span>
                        {dispute.resolution}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[#555]">{formatDate(dispute.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
