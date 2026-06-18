export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response
  const session = guard.session

  const { status } = await req.json()
  if (!['ACTIVE', 'BANNED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true },
  })
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  if (target.role === 'ADMIN') {
    return NextResponse.json({ error: 'Cannot modify another admin' }, { status: 403 })
  }
  if (target.id === session.user.id) {
    return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 403 })
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { status },
  })

  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: status === 'BANNED' ? 'BAN' : 'UNBAN',
      targetUserId: params.id,
    },
  })

  return NextResponse.json(user)
}
