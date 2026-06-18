export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const body = await req.json()

    if (!body.name || !body.price || !body.vendorId || !body.categoryId) {
      return NextResponse.json({ error: 'name, price, vendorId, and categoryId are required' }, { status: 400 })
    }

    let slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description || body.name,
        price: parseFloat(body.price),
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        stock: parseInt(body.stock) || 0,
        sku: body.sku || null,
        status: body.status || 'ACTIVE',
        images: JSON.stringify(Array.isArray(body.images) ? body.images : []),
        tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
        vendorId: body.vendorId,
        categoryId: body.categoryId,
        featured: body.featured ?? false,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || 'Failed to create product' }, { status: 500 })
  }
}
