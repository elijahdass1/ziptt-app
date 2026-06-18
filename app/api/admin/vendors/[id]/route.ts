export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { status } = await req.json()
  if (!['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const vendor = await prisma.vendor.update({
    where: { id: params.id },
    data: { status },
    select: { id: true, userId: true, status: true },
  })

  // When approved: set user role to VENDOR
  // When rejected or suspended: revert user role to CUSTOMER
  if (status === 'APPROVED') {
    await prisma.user.update({
      where: { id: vendor.userId },
      data: { role: 'VENDOR' },
    })
  } else if (status === 'REJECTED' || status === 'SUSPENDED') {
    await prisma.user.update({
      where: { id: vendor.userId },
      data: { role: 'CUSTOMER' },
    })
  }

  return NextResponse.json(vendor)
}
