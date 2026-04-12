import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

const WIPAY_SANDBOX = 'https://sandbox.wipayfinancial.com/v1/gateway'
const WIPAY_LIVE = 'https://wipayfinancial.com/v1/gateway'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { orderId, total, description } = await req.json()

    if (!orderId || !total) {
      return Response.json({ error: 'orderId and total are required' }, { status: 400 })
    }

    // Dev fallback — no WiPay keys configured
    if (!process.env.WIPAY_API_KEY || !process.env.WIPAY_ACCOUNT_NUMBER) {
      console.warn('[ziptt] WiPay not configured — returning mock payment URL')
      const mockUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3001'}/api/payments/callback?status=success&order_id=${orderId}&mock=true`
      return Response.json({ paymentUrl: mockUrl, mock: true })
    }

    const accountNumber = process.env.WIPAY_ACCOUNT_NUMBER
    const apiKey = process.env.WIPAY_API_KEY
    const environment = process.env.WIPAY_ENV === 'live' ? 'live' : 'sandbox'
    const endpoint = environment === 'live' ? WIPAY_LIVE : WIPAY_SANDBOX
    const returnUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3001'}/api/payments/callback`

    // Build hash: MD5 of account_number + api_key + total + order_id
    const hashInput = `${accountNumber}${apiKey}${parseFloat(total).toFixed(2)}${orderId}`
    const hash = crypto.createHash('md5').update(hashInput).digest('hex')

    const formData = new URLSearchParams({
      account_number: accountNumber,
      avs: '0',
      data_currency: 'TTD',
      data_description: description ?? `zip.tt Order #${orderId}`,
      environment,
      fee_structure: 'customer_pay',
      method: 'credit_card',
      order_id: String(orderId),
      origin: process.env.NEXTAUTH_URL ?? 'http://localhost:3001',
      return_url: returnUrl,
      total: parseFloat(total).toFixed(2),
      hash,
    })

    const wipayRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    })

    if (!wipayRes.ok) {
      const errText = await wipayRes.text()
      console.error('[ziptt] WiPay error:', errText)
      return Response.json({ error: 'Payment gateway error' }, { status: 502 })
    }

    const data = await wipayRes.json()
    return Response.json({ paymentUrl: data.url ?? data.redirect_url ?? data })
  } catch (e) {
    console.error('[ziptt] WiPay POST error:', e)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
