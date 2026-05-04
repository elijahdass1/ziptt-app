// Vendor-facing list of digital orders awaiting manual fulfilment.
// Pending orders get a code-entry textarea + "Deliver" button that
// posts to /api/vendor/digital-orders/[id]/deliver. The API marks
// the order delivered and fires the customer email.
//
// Sits alongside /vendor/digital (catalog management). Linked from
// the vendor sidebar via the Orders item.
export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { VendorDeliverDigitalForm } from '@/components/vendor/VendorDeliverDigitalForm'
import Link from 'next/link'

export default async function VendorDigitalOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const vendor = await prisma.vendor.findFirst({
    where: { userId: session.user.id as string },
    select: { id: true, storeName: true },
  })
  if (!vendor) redirect('/vendor/register')

  const orders = await prisma.digitalOrder.findMany({
    where: { vendorId: vendor.id },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      product: { select: { name: true, instructions: true } },
      customer: { select: { name: true, email: true } },
    },
  })

  const pending = orders.filter((o) => o.status !== 'delivered')
  const delivered = orders.filter((o) => o.status === 'delivered')

  return (
    <div className="p-8 text-[var(--text-primary)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Digital Orders</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {pending.length > 0
              ? `${pending.length} pending — paste the access code in the form to deliver.`
              : 'All caught up. New orders show up here as they come in.'}
          </p>
        </div>
        <Link
          href="/vendor/digital"
          className="text-sm text-[#C9A84C] hover:underline"
        >
          Manage catalog →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl">
          <p className="text-[var(--text-secondary)]">
            No digital orders yet.{' '}
            <Link href="/vendor/digital" className="text-[#C9A84C] hover:underline">
              Make sure your products are active →
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[2px] text-[#D62828] mb-3">
                Pending fulfilment ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((o) => (
                  <article
                    key={o.id}
                    className="bg-[var(--bg-secondary)] border border-[#C9A84C]/20 rounded-xl p-5"
                  >
                    <OrderHeader order={o} pending />
                    <VendorDeliverDigitalForm orderId={o.id} />
                  </article>
                ))}
              </div>
            </section>
          )}

          {delivered.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[2px] text-[var(--text-secondary)] mb-3">
                Delivered ({delivered.length})
              </h2>
              <div className="space-y-3">
                {delivered.map((o) => (
                  <article
                    key={o.id}
                    className="bg-[var(--bg-secondary)] border border-[var(--bg-card)] rounded-xl p-5"
                  >
                    <OrderHeader order={o} pending={false} />
                    <p className="text-xs text-[var(--text-secondary)] mt-3">
                      Delivered {o.deliveredAt ? new Date(o.deliveredAt).toLocaleString('en-TT', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function OrderHeader({
  order,
  pending,
}: {
  order: {
    id: string
    pricePaid: number
    createdAt: Date
    product: { name: string; instructions?: string | null }
    customer: { name: string | null; email: string | null }
  }
  pending: boolean
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-[var(--text-primary)]">{order.product.name}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {order.customer.name || 'Unknown'} · {order.customer.email}
        </p>
        {order.product.instructions && (
          <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 italic">
            <span className="text-[#C9A84C]">Redemption notes:</span> {order.product.instructions}
          </p>
        )}
      </div>
      <div className="text-right">
        <span
          className={
            pending
              ? 'inline-block bg-[#D62828]/15 text-[#D62828] border border-[#D62828]/30 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full'
              : 'inline-block bg-[#0F2A1A] text-green-400 border border-green-500/30 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full'
          }
        >
          {pending ? 'Pending' : 'Delivered'}
        </span>
        <p className="text-sm text-[#C9A84C] font-bold mt-1">${order.pricePaid.toFixed(2)} TTD</p>
        <p className="text-[11px] text-[var(--text-secondary)]">
          {new Date(order.createdAt).toLocaleString('en-TT', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>
    </div>
  )
}
