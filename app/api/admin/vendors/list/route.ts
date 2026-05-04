// Admin-only minimal vendor list — feeds the vendor filter dropdown
// on /admin/orders. Tiny payload (id + storeName + status) so we can
// safely fetch on every page load without paying for the full vendor
// row each time.
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const vendors = await prisma.vendor.findMany({
    select: { id: true, storeName: true, status: true },
    orderBy: { storeName: 'asc' },
  })

  return NextResponse.json({ vendors })
}
