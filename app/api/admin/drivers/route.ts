export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/admin/drivers
// Returns the list of users with role DRIVER for use in admin order
// assignment dropdowns.
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const drivers = await prisma.user.findMany({
    where: { role: 'DRIVER', status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true, phone: true },
  })

  return NextResponse.json({ drivers })
}
