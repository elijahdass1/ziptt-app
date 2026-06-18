export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'

// POST /api/admin/users/[id]/remove
//
// Soft-deletes a user: sets deletedAt + status BANNED so the account
// can never sign in again, but the row (and its orders/products/vendor
// relations) stays intact for referential integrity and order history.
// If the user is a vendor, their store and all products are suspended
// out of public storefront queries too.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const session = guard.session

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true, vendor: { select: { id: true } } },
  })
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  if (target.role === 'ADMIN') {
    return NextResponse.json({ error: 'Cannot remove another admin' }, { status: 403 })
  }
  if (target.id === session.user.id) {
    return NextResponse.json({ error: 'Cannot remove your own account' }, { status: 403 })
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { status: 'BANNED', deletedAt: new Date() },
  })

  if (target.vendor) {
    await prisma.vendor.update({
      where: { id: target.vendor.id },
      data: { status: 'SUSPENDED' },
    })
    await prisma.product.updateMany({
      where: { vendorId: target.vendor.id },
      data: { status: 'ARCHIVED' },
    })
  }

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: 'REMOVE',
      targetUserId: params.id,
    },
  })

  return NextResponse.json(user)
}
