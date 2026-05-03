// Customer-initiated order cancellation. Only works while the order
// is still PENDING — once the vendor confirms or ships, the customer
// has to go through the dispute flow instead.
//
// On success:
//   1. Order.status flips to CANCELLED
//   2. Stock for every line item is restored (atomic with the update)
//   3. Customer gets a confirmation email
//   4. Vendor gets a heads-up email so they don't pack a cancelled order
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 10 cancellations / hour / user — defends against scripted spam
  // toggling orders rapidly. Real users will never hit this.
  const { allowed } = rateLimit(`cancel:${session.user.id}`, 10, 3_600_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many cancellations recently. Try again later.' }, { status: 429 })
  }

  const order = await prisma.order.findFirst({
    where: { id: params.id, customerId: session.user.id },
    include: {
      items: { include: { product: { select: { id: true, name: true } } } },
      customer: { select: { name: true, email: true } },
      vendor:   { select: { storeName: true, user: { select: { email: true } } } },
      address:  { select: { street: true, city: true, region: true } },
    },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'This order is already being processed and can no longer be cancelled. Open a dispute instead.' },
      { status: 409 }
    )
  }

  // Flip status + restore stock atomically. If anything goes wrong
  // mid-restore the whole thing rolls back and the order stays PENDING.
  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity }, soldCount: { decrement: item.quantity } },
      })
    }
  })

  // Fire-and-forget cancellation emails. Failure logs but doesn't
  // block the response — the order is already cancelled in the DB.
  void (async () => {
    const { sendEmail, emailLayout } = await import('@/lib/email')
    const { formatTTD } = await import('@/lib/utils')

    const itemsList = order.items
      .map((i) => `<li style="margin-bottom:4px;">${i.product.name} × ${i.quantity}</li>`).join('')

    const customerHtml = emailLayout({
      heading: `Order #${order.orderNumber} cancelled`,
      preheader: `Your order has been cancelled and stock returned.`,
      body: `<p>We've cancelled your order from ${escapeHtml(order.vendor.storeName)} as requested.</p>
             <ul style="padding-left:18px;color:#9A8F7A;font-size:13px;">${itemsList}</ul>
             <p style="margin-top:16px;color:#9A8F7A;font-size:13px;">Order total: <strong style="color:#C9A84C;">${formatTTD(order.total)}</strong></p>
             <p style="font-size:13px;margin-top:18px;">No payment was taken — Cash on Delivery orders settle on delivery. If you change your mind you can reorder anytime.</p>`,
      cta: { label: 'Browse zip.tt', url: 'https://ziptt-prod.vercel.app/products' },
    })
    if (order.customer?.email) {
      await sendEmail({
        to: order.customer.email,
        subject: `Order #${order.orderNumber} cancelled`,
        html: customerHtml,
      }).catch((err) => console.warn('[cancel] customer email failed:', err))
    }

    const vendorHtml = emailLayout({
      heading: `Order #${order.orderNumber} cancelled by customer`,
      preheader: `Don't pack this one — the customer cancelled.`,
      body: `<p><strong style="color:#F5F0E8;">${escapeHtml(order.customer?.name ?? 'A customer')}</strong> cancelled order #${escapeHtml(order.orderNumber)} before fulfilment.</p>
             <ul style="padding-left:18px;color:#9A8F7A;font-size:13px;">${itemsList}</ul>
             <p style="margin-top:16px;color:#9A8F7A;font-size:13px;">Stock for these items has been restored automatically.</p>`,
      cta: { label: 'Open vendor dashboard', url: 'https://ziptt-prod.vercel.app/vendor/orders' },
    })
    if (order.vendor.user?.email) {
      await sendEmail({
        to: order.vendor.user.email,
        subject: `Cancelled: order #${order.orderNumber}`,
        html: vendorHtml,
      }).catch((err) => console.warn('[cancel] vendor email failed:', err))
    }
  })()

  return NextResponse.json({ ok: true, orderId: order.id })
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
