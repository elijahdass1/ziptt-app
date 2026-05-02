export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Please sign in to purchase.' }, { status: 401 })

  const { allowed } = rateLimit(`digital-buy:${session.user.id}`, 5, 3_600_000)
  if (!allowed) return Response.json({ error: 'Too many purchases. Try again later.' }, { status: 429 })

  try {
    const { digitalProductId } = await req.json()
    if (!digitalProductId) return Response.json({ error: 'Invalid product.' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: session.user.id as string } })
    if (!user) return Response.json({ error: 'User not found.' }, { status: 404 })
    if (!user.phoneVerified) return Response.json({ error: 'Please verify your phone number before purchasing digital products.' }, { status: 403 })

    const product = await prisma.digitalProduct.findUnique({ where: { id: digitalProductId } })
    if (!product || !product.isActive) return Response.json({ error: 'Product not found.' }, { status: 404 })

    const code = await prisma.digitalCode.findFirst({ where: { digitalProductId, isUsed: false } })
    if (!code) return Response.json({ error: 'Out of stock â check back soon or contact support@zip.tt' }, { status: 400 })

    const commission = product.price * 0.15
    const vendorEarnings = product.price * 0.85
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'

    const order = await prisma.digitalOrder.create({
      data: {
        customerId: session.user.id as string,
        digitalProductId,
        vendorId: product.vendorId,
        codeId: code.id,
        status: 'pending',
        pricePaid: product.price,
        commission,
        vendorEarnings,
        ipAddress: ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    })

    await prisma.digitalCode.update({
      where: { id: code.id },
      data: { isUsed: true, usedAt: new Date(), usedByOrderId: order.id }
    })

    await prisma.digitalOrder.update({
      where: { id: order.id },
      data: { status: 'delivered', deliveredCode: code.code, deliveredAt: new Date() }
    })

    await prisma.digitalProduct.update({
      where: { id: digitalProductId },
      data: { soldCount: { increment: 1 } }
    })

    console.log('[digital]', product.name, '->', user.email, ':', code.code)

    if (user.email) {
      void (async () => {
        const { sendEmail } = await import('@/lib/email')
        const { digitalDeliveryEmail } = await import('@/lib/emailTemplates')
        const tpl = digitalDeliveryEmail({
          customerName: user.name ?? '',
          productName: product.name,
          code: code.code,
          instructions: product.instructions ?? null,
          orderId: order.id,
        })
        await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html })
          .catch((err) => console.warn('[digital] email failed:', err))
      })()
    }

    return Response.json({ success: true, orderId: order.id, code: code.code })
  } catch (error) {
    console.error('[digital/purchase]', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
