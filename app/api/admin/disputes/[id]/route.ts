export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { status, resolution } = await req.json()
  if (!['OPEN', 'IN_REVIEW', 'RESOLVED_CUSTOMER', 'RESOLVED_VENDOR', 'CLOSED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const dispute = await prisma.dispute.update({
    where: { id: params.id },
    data: {
      status,
      ...(resolution && { resolution }),
    },
  })

  return NextResponse.json(dispute)
}
