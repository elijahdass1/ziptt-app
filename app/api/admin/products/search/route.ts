export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'
import { liveVendorProductWhere } from '@/lib/vendorVisibility'

// Product typeahead for the Homepage Ads picker. Returns only purchasable
// products (ACTIVE + live vendor) — the same set that could actually render in
// an ad slot — so the admin can't pick something that would silently not show.
export async function GET(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const q = (new URL(req.url).searchParams.get('q') ?? '').trim()
  if (!q) return NextResponse.json({ products: [] })

  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      ...liveVendorProductWhere,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 8,
    orderBy: { soldCount: 'desc' },
    select: { id: true, name: true, slug: true, images: true, price: true },
  })
  return NextResponse.json({ products })
}
