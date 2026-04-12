export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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

  try {
    const { items, addressId, paymentMethod, notes } = await req.json()
    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

    // Capture device info for risk scoring
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '0.0.0.0'
    const ua = req.headers.get('user-agent') || ''
    const fingerprint = Buffer.from(ip + ua).toString('base64').slice(0, 32)

    // Calculate order total
    const orderTotal = items.reduce((acc: number, i: any) => acc + i.price * i.quantity, 0)

    // Fetch user for risk calculation
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    // Risk scoring
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

    // Group by vendor
    const vendorGroups: Record<string, typeof items> = {}
    for (const item of items) {
      if (!vendorGroups[item.vendorId]) vendorGroups[item.vendorId] = []
      vendorGroups[item.vendorId].push(item)
    }

    const orders = []
    for (const [vendorId, vendorItems] of Object.entries(vendorGroups)) {
      const subtotal = (vendorItems as any[]).reduce((acc: number, i: any) => acc + i.price * i.quantity, 0)
      const deliveryFee = subtotal >= 500 ? 0 : 50
      const total = subtotal + deliveryFee

      const order = await prisma.order.create({
        data: {
          customerId: session.user.id,
          vendorId,
          addressId: addressId || null,
          paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
          subtotal,
          deliveryFee,
          total,
          notes,
          ipAddress: ip,
          userAgent: ua,
          deviceFingerprint: fingerprint,
          riskScore,
          idVerifiedOrder: user?.idVerified ?? false,
          items: {
            create: (vendorItems as any[]).map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
            })),
          },
        },
      })
      orders.push(order)

      // Decrement stock
      for (const item of vendorItems as any[]) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
        })
      }
    }

    // Increment user totalOrders
    await prisma.user.update({
      where: { id: session.user.id },
      data: { totalOrders: { increment: 1 } },
    })

    return NextResponse.json({ orders }, { status: 201 })
  } catch (e) {
    console.error('[zip.tt API Error]:', e)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
