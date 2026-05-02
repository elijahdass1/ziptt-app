export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import prisma from '@/lib/prisma'

// Shape of a single cart item the client POSTs.
// NOTE: any `price` field on this object is IGNORED — server recomputes
// from the canonical Product row. Never trust the client for money.
type IncomingItem = {
  productId: string
  quantity: number
  // price?: number  ← intentionally ignored
  // vendorId?: string ← intentionally ignored, derived from product
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: { select: { name: true, images: true } } },
      },
      vendor: { select: { storeName: true } },
    },
  })

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Per-user throttle on order placement: 20 orders / minute. The
  // in-memory rateLimit is best-effort across serverless instances —
  // for production-grade enforcement migrate to @upstash/ratelimit
  // backed by Upstash Redis (see SECURITY.md).
  const { allowed: orderRateOk } = rateLimit(`orders:${session.user.id}`, 20, 60_000)
  if (!orderRateOk) {
    return NextResponse.json(
      { error: 'Too many orders. Please wait a minute and try again.' },
      { status: 429 }
    )
  }

  let body: {
    items?: IncomingItem[]
    addressId?: string
    paymentMethod?: string
    notes?: string
    phone?: string
    instructions?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { items, addressId, paymentMethod, notes, phone, instructions } = body

  // ── Validate phone + instructions (required for delivery) ─────────────────
  // The client-side checkout enforces these too, but we re-validate here so
  // direct API callers can't bypass the requirement.
  const phoneClean = typeof phone === 'string' ? phone.trim() : ''
  const phoneDigits = phoneClean.replace(/\D/g, '')
  const phoneValid =
    phoneDigits.length === 7 ||
    (phoneDigits.length === 10 && phoneDigits.startsWith('868')) ||
    (phoneDigits.length === 11 && phoneDigits.startsWith('1868'))
  if (!phoneValid) {
    return NextResponse.json(
      { error: 'A valid Trinidad & Tobago phone number is required' },
      { status: 400 }
    )
  }
  const instructionsClean = typeof instructions === 'string' ? instructions.trim() : ''
  if (instructionsClean.length < 3) {
    return NextResponse.json(
      { error: 'Delivery instructions are required so the driver can find you' },
      { status: 400 }
    )
  }
  if (instructionsClean.length > 500) {
    return NextResponse.json(
      { error: 'Delivery instructions are too long (500 character max)' },
      { status: 400 }
    )
  }

  // ── Input validation ──────────────────────────────────────────────────────
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }
  if (items.length > 100) {
    return NextResponse.json({ error: 'Too many items in one order' }, { status: 400 })
  }
  for (const i of items) {
    if (!i || typeof i.productId !== 'string' || !i.productId) {
      return NextResponse.json({ error: 'Invalid item: missing productId' }, { status: 400 })
    }
    if (!Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 999) {
      return NextResponse.json({ error: 'Invalid item quantity' }, { status: 400 })
    }
  }
  // While the Tunapuna–Piarco–Trincity pilot is running we only honor
  // Cash on Delivery — see lib/paymentMethods.ts for the canonical
  // list. Anything else gets coerced server-side so a stale client or
  // a direct API caller can't sneak through a disabled method.
  const { ENABLED_METHODS } = await import('@/lib/paymentMethods')
  const finalPaymentMethod = paymentMethod && ENABLED_METHODS.has(paymentMethod as 'CASH_ON_DELIVERY')
    ? paymentMethod
    : 'CASH_ON_DELIVERY'

  // De-duplicate productIds (collapse repeats by summing quantity).
  // Prevents ambiguous double-decrement and lets us do a single atomic update per product.
  const qtyByProduct = new Map<string, number>()
  for (const i of items) {
    qtyByProduct.set(i.productId, (qtyByProduct.get(i.productId) ?? 0) + i.quantity)
  }
  const productIds = Array.from(qtyByProduct.keys())

  try {
    // ── Verify addressId ownership (if provided) ────────────────────────────
    if (addressId) {
      const addr = await prisma.address.findFirst({
        where: { id: addressId, userId: session.user.id },
        select: { id: true },
      })
      if (!addr) {
        return NextResponse.json({ error: 'Invalid delivery address' }, { status: 400 })
      }
    }

    // ── Capture device info for risk scoring ────────────────────────────────
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '0.0.0.0'
    const ua = req.headers.get('user-agent') || ''
    const fingerprint = Buffer.from(ip + ua).toString('base64').slice(0, 32)

    // ── Load canonical products + vendors from DB ───────────────────────────
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        status: true,
        vendorId: true,
        vendor: { select: { id: true, status: true } },
      },
    })

    if (products.length !== productIds.length) {
      const found = new Set(products.map((p) => p.id))
      const missing = productIds.filter((id) => !found.has(id))
      return NextResponse.json(
        { error: 'One or more products are no longer available', missing },
        { status: 400 }
      )
    }

    // Verify product + vendor status. ACTIVE products only.
    // Vendors: APPROVED or ACTIVE both treated as ok (storefront uses both).
    const VENDOR_OK = new Set(['APPROVED', 'ACTIVE'])
    for (const p of products) {
      if (p.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: `"${p.name}" is no longer available` },
          { status: 400 }
        )
      }
      if (!VENDOR_OK.has(p.vendor.status)) {
        return NextResponse.json(
          { error: `"${p.name}" is from a vendor that's currently unavailable` },
          { status: 400 }
        )
      }
    }

    // Pre-flight stock check (cheap fail-fast before transaction).
    // Real authoritative check happens inside the transaction via updateMany.
    for (const p of products) {
      const want = qtyByProduct.get(p.id)!
      if (p.stock < want) {
        return NextResponse.json(
          { error: `"${p.name}" only has ${p.stock} in stock`, productId: p.id, available: p.stock },
          { status: 409 }
        )
      }
    }

    // ── Compute server-side totals from canonical prices ────────────────────
    const productById = new Map(products.map((p) => [p.id, p]))
    let orderTotal = 0
    for (const [pid, qty] of qtyByProduct) {
      orderTotal += productById.get(pid)!.price * qty
    }

    // ── Risk scoring (uses authoritative orderTotal) ────────────────────────
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    let riskScore = 0
    if ((user?.totalOrders ?? 0) === 0) riskScore += 30
    if (orderTotal > 3000) riskScore += 25
    if ((user?.chargebackCount ?? 0) > 0) riskScore += 50
    if (!user?.phoneVerified) riskScore += 20
    if (!user?.idVerified && orderTotal > 2000) riskScore += 35
    if (user?.idVerified) riskScore -= 30
    if ((user?.totalOrders ?? 0) > 5) riskScore -= 20
    riskScore = Math.max(0, riskScore)

    if (riskScore > 80) {
      console.log('[zip.tt] HIGH RISK ORDER BLOCKED:', { userId: session.user.id, orderTotal, riskScore })
      return NextResponse.json({ error: 'Order flagged for review. Contact support@zip.tt' }, { status: 403 })
    }

    // ── Group by vendor (using authoritative product → vendor mapping) ──────
    type GroupedItem = { productId: string; quantity: number; price: number }
    const vendorGroups: Record<string, GroupedItem[]> = {}
    for (const [pid, qty] of qtyByProduct) {
      const p = productById.get(pid)!
      if (!vendorGroups[p.vendorId]) vendorGroups[p.vendorId] = []
      vendorGroups[p.vendorId].push({ productId: pid, quantity: qty, price: p.price })
    }

    // ── Create orders + decrement stock atomically ──────────────────────────
    // Prisma $transaction rolls back ALL writes if any throw, including stock
    // decrements. We use updateMany with `stock: { gte: qty }` as the
    // condition — if 0 rows match, another concurrent order beat us to it,
    // and we throw to roll the whole transaction back.
    const created = await prisma.$transaction(async (tx) => {
      const orders = []
      for (const [vendorId, vItems] of Object.entries(vendorGroups)) {
        const subtotal = vItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
        const deliveryFee = subtotal >= 500 ? 0 : 50
        const total = subtotal + deliveryFee

        const order = await tx.order.create({
          data: {
            customerId: session.user.id,
            vendorId,
            addressId: addressId || null,
            paymentMethod: finalPaymentMethod,
            subtotal,
            deliveryFee,
            total,
            notes: notes ?? null,
            phone: phoneClean,
            instructions: instructionsClean,
            ipAddress: ip,
            userAgent: ua,
            deviceFingerprint: fingerprint,
            riskScore,
            idVerifiedOrder: user?.idVerified ?? false,
            items: {
              create: vItems.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                price: i.price,
                total: i.price * i.quantity,
              })),
            },
          },
        })
        orders.push(order)

        // Atomic conditional decrement: only succeeds if stock is still
        // sufficient at the moment of update. Prevents overselling under
        // concurrent checkout.
        for (const i of vItems) {
          const res = await tx.product.updateMany({
            where: { id: i.productId, stock: { gte: i.quantity } },
            data: {
              stock: { decrement: i.quantity },
              soldCount: { increment: i.quantity },
            },
          })
          if (res.count === 0) {
            // Stock changed between pre-flight and update → throw to roll back.
            throw new Error(`OUT_OF_STOCK:${i.productId}`)
          }
        }
      }

      // Increment user totalOrders inside the same transaction.
      // Also backfill the user's phone if they didn't have one — repeat
      // checkouts can then auto-fill from User.phone.
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          totalOrders: { increment: 1 },
          ...(user?.phone ? {} : { phone: phoneClean }),
        },
      })

      return orders
    })

    return NextResponse.json({ orders: created }, { status: 201 })
  } catch (e: any) {
    if (typeof e?.message === 'string' && e.message.startsWith('OUT_OF_STOCK:')) {
      const pid = e.message.split(':')[1]
      return NextResponse.json(
        { error: 'An item just sold out — please review your cart and try again', productId: pid },
        { status: 409 }
      )
    }
    console.error('[zip.tt API Error]:', e)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
