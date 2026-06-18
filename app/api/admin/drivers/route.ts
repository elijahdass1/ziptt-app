export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'

// GET /api/admin/drivers
// Returns the list of users with role DRIVER for use in admin order
// assignment dropdowns.
export async function GET(_req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const drivers = await prisma.user.findMany({
    where: { role: 'DRIVER', status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true, phone: true },
  })

  return NextResponse.json({ drivers })
}
