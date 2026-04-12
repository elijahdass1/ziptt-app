import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function getVendorProduct(productId: string, userId: string) {
  const vendor = await prisma.vendor.findUnique({ where: { userId } })
  if (!vendor) return null
  return prisma.product.findFirst({ where: { id: productId, vendorId: vendor.id } })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await getVendorProduct(params.id, session.user.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const data = { ...body }
  if (Array.isArray(data.images)) data.images = JSON.stringify(data.images)
  if (Array.isArray(data.tags)) data.tags = JSON.stringify(data.tags)
  const updated = await prisma.product.update({ where: { id: params.id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await getVendorProduct(params.id, session.user.id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.product.update({ where: { id: params.id }, data: { status: 'ARCHIVED' } })
  return NextResponse.json({ success: true })
}
