import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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
