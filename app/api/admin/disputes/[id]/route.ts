export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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
