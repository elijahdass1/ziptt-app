import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const status = params.get('status')
  const orderId = params.get('order_id')
  const mock = params.get('mock')

  // Mock dev flow
  if (mock === 'true') {
    if (status === 'success' && orderId) {
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED', paymentMethod: 'WIPAY' },
        })
      } catch (e) {
        console.error('[ziptt] Mock callback order update error:', e)
      }
    }
    redirect(status === 'success' ? '/orders?payment=success' : '/checkout?payment=failed')
  }

  // Real WiPay callback verification
  if (!process.env.WIPAY_API_KEY || !process.env.WIPAY_ACCOUNT_NUMBER) {
    redirect('/checkout?payment=failed')
  }

  const receivedHash = params.get('hash') ?? ''
  const total = params.get('total') ?? ''
  const accountNumber = process.env.WIPAY_ACCOUNT_NUMBER!
  const apiKey = process.env.WIPAY_API_KEY!

  const hashInput = `${accountNumber}${apiKey}${total}${orderId}`
  const expectedHash = crypto.createHash('md5').update(hashInput).digest('hex')

  if (receivedHash !== expectedHash) {
    console.warn('[ziptt] WiPay hash mismatch — possible tampered callback')
    redirect('/checkout?payment=failed')
  }

  if (status === 'success' && orderId) {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED', paymentMethod: 'WIPAY' },
      })
    } catch (e) {
      console.error('[ziptt] Callback order update error:', e)
      redirect('/checkout?payment=failed')
    }
    redirect('/orders?payment=success')
  }

  redirect('/checkout?payment=failed')
}
