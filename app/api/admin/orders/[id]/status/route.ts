export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'

// POST /api/admin/orders/[id]/status  body: { status: string }
// Admin overrides order status. Allowed values aligned with the rest of
// the codebase (which stores status as a free-form string).
const ALLOWED = new Set([
  'PENDING',
  'PROCESSING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
])

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  let body: { status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const status = body.status
  if (!status || !ALLOWED.has(status)) {
    return NextResponse.json(
      { error: 'Invalid status', allowed: Array.from(ALLOWED) },
      { status: 400 }
    )
  }

  // Side effects: stamp deliveredAt when transitioning to DELIVERED.
  const data: any = { status }
  if (status === 'DELIVERED') data.deliveredAt = new Date()

  const res = await prisma.order.updateMany({
    where: { id: params.id },
    data,
  })
  if (res.count === 0) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
