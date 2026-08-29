export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'
import { PROMO_SLOTS, sanitizePromo } from '@/lib/promos'

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const promos = await prisma.promo.findMany({
    orderBy: [{ slot: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(promos)
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const body = await req.json().catch(() => ({}))
  if (!PROMO_SLOTS.includes(body.slot)) {
    return NextResponse.json({ error: 'Invalid slot' }, { status: 400 })
  }

  const promo = await prisma.promo.create({
    data: {
      slot: body.slot,
      active: body.active !== undefined ? Boolean(body.active) : true,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Math.trunc(Number(body.sortOrder)) : 0,
      ...sanitizePromo(body),
    },
  })
  return NextResponse.json(promo, { status: 201 })
}
