export const dynamic = 'force-dynamic'
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
  const data: Record<string, any> = {}

  if (body.name !== undefined) data.name = body.name
  if (body.price !== undefined) data.price = body.price
  if (body.comparePrice !== undefined) data.comparePrice = body.comparePrice
  if (body.stock !== undefined) data.stock = body.stock
  if (body.description !== undefined) data.description = body.description
  if (body.status !== undefined) data.status = body.status
  if (body.images !== undefined) {
    data.images = typeof body.images === 'string' ? body.images : JSON.stringify(Array.isArray(body.images) ? body.images : [])
  }
  if (body.tags !== undefined) {
    data.tags = typeof body.tags === 'string' ? body.tags : JSON.stringify(Array.isArray(body.tags) ? body.tags : [])
  }
  // Handle category name → categoryId
  if (body.category && !body.categoryId) {
    const cat = await prisma.category.findFirst({ where: { name: body.category } })
    if (cat) data.categoryId = cat.id
  } else if (body.categoryId) {
    data.categoryId = body.categoryId
  }

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
