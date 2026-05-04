// Vendor manually delivers a digital order by typing in the access
// code / instructions. Used for products where the auto-assign code
// pool is empty or where the vendor wants per-order control over the
// payload (e.g. one-off subscription invites, redemption links).
//
// Auth: vendor must own the order's vendorId. Admin can also deliver
// any order (handy for support flows).
//
// Side effects:
//   - DigitalOrder.deliveredCode = code, status = 'delivered',
//     deliveredAt = now()
//   - Fires the same digitalDeliveryEmail Resend template the
//     auto-assign path uses, so the customer experience is identical
//     regardless of which fulfilment path delivered the code.
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Light per-user throttle so a fat-fingered double-click doesn't
  // double-fire the customer email.
  const { allowed } = rateLimit(`digital-deliver:${session.user.id}`, 30, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests, slow down a moment.' }, { status: 429 })
  }

  let body: { code?: string } = {}
  try { body = await req.json() } catch {}
  const code = (body.code ?? '').trim()
  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 })
  if (code.length > 1000) return NextResponse.json({ error: 'Code is too long (1000 char max)' }, { status: 400 })

  const order = await prisma.digitalOrder.findUnique({
    where: { id: params.id },
    include: {
      product: { select: { name: true, instructions: true, vendorId: true } },
      customer: { select: { email: true, name: true } },
    },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Authorize: admin OR the order's vendor.
  const isAdmin = session.user.role === 'ADMIN'
  if (!isAdmin) {
    const vendor = await prisma.vendor.findFirst({
      where: { userId: session.user.id as string },
      select: { id: true },
    })
    if (!vendor || vendor.id !== order.vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Idempotency: if already delivered, return 409 unless the operator
  // explicitly opts in via ?force=1 (admin support tool).
  const force = new URL(req.url).searchParams.get('force') === '1'
  if (order.status === 'delivered' && !force) {
    return NextResponse.json(
      { error: 'Order already delivered. Pass ?force=1 to overwrite.' },
      { status: 409 }
    )
  }

  await prisma.digitalOrder.update({
    where: { id: order.id },
    data: { deliveredCode: code, status: 'delivered', deliveredAt: new Date() },
  })

  // Fire the same email template the auto-assign path uses so the
  // customer never sees two different "delivered" experiences. Best-
  // effort — failure logs but the API succeeds (the code is on
  // /orders/digital regardless).
  if (order.customer?.email) {
    void (async () => {
      const { sendEmail } = await import('@/lib/email')
      const { digitalDeliveryEmail } = await import('@/lib/emailTemplates')
      const tpl = digitalDeliveryEmail({
        customerName: order.customer.name ?? '',
        productName: order.product.name,
        code,
        instructions: order.product.instructions ?? null,
        orderId: order.id,
      })
      await sendEmail({ to: order.customer.email!, subject: tpl.subject, html: tpl.html })
        .catch((err) => console.warn('[digital-deliver] email failed:', err))
    })()
  }

  return NextResponse.json({ ok: true, orderId: order.id })
}
