export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'
import { revalidateStorefront } from '@/lib/revalidateStorefront'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const body = await req.json()

  // Status-only update (used by AdminProductActions)
  if (Object.keys(body).length === 1 && body.status) {
    if (!['ACTIVE', 'ARCHIVED', 'DRAFT'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    const product = await prisma.product.update({ where: { id: params.id }, data: { status: body.status } })
    revalidateStorefront({ productSlug: product.slug })
    return NextResponse.json(product)
  }

  // Full update from admin product form
  try {
    let slug = body.slug
    if (body.name && !slug) {
      slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }
    if (slug) {
      const existing = await prisma.product.findFirst({ where: { slug, NOT: { id: params.id } } })
      if (existing) slug = `${slug}-${Date.now()}`
    }

    const data: Record<string, unknown> = {}
    if (body.name) data.name = body.name
    if (slug) data.slug = slug
    if (body.description !== undefined) data.description = body.description
    if (body.price !== undefined) data.price = parseFloat(body.price)
    if (body.comparePrice !== undefined) data.comparePrice = body.comparePrice ? parseFloat(body.comparePrice) : null
    if (body.stock !== undefined) data.stock = parseInt(body.stock) || 0
    if (body.sku !== undefined) data.sku = body.sku || null
    if (body.status) data.status = body.status
    if (body.categoryId) data.categoryId = body.categoryId
    if (body.vendorId) data.vendorId = body.vendorId
    if (body.images !== undefined) data.images = JSON.stringify(Array.isArray(body.images) ? body.images : [])
    if (body.tags !== undefined) data.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : [])
    if (body.featured !== undefined) data.featured = body.featured

    const product = await prisma.product.update({ where: { id: params.id }, data })
    revalidateStorefront({ productSlug: product.slug })
    return NextResponse.json(product)
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  await prisma.product.delete({ where: { id: params.id } })
  revalidateStorefront()
  return NextResponse.json({ ok: true })
}
