export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
  if (!vendor) return NextResponse.json({ error: 'Not a vendor' }, { status: 403 })

  const { storeName, description, phone, address, region } = await req.json()
  if (!storeName?.trim()) return NextResponse.json({ error: 'Store name required' }, { status: 400 })

  const updated = await prisma.vendor.update({
    where: { id: vendor.id },
    data: { storeName, description, phone, address, region },
  })

  return NextResponse.json(updated)
}
