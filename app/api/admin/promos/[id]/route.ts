export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'
import { sanitizePromo } from '@/lib/promos'
import { revalidateHome } from '@/lib/revalidateStorefront'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const body = await req.json().catch(() => ({}))
  const data = sanitizePromo(body)
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    const promo = await prisma.promo.update({ where: { id: params.id }, data })
    revalidateHome()
    return NextResponse.json(promo)
  } catch {
    return NextResponse.json({ error: 'Promo not found' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    await prisma.promo.delete({ where: { id: params.id } })
    revalidateHome()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Promo not found' }, { status: 404 })
  }
}
