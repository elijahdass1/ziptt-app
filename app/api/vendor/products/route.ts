export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
  if (!vendor) return NextResponse.json({ error: 'Not a vendor' }, { status: 403 })

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { name: true } } },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 403 })

  try {
    const body = await req.json()

    // Make slug unique
    let slug = body.slug || body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'product'
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    // Resolve category: body.category is a name string, find or use first
    let categoryId = body.categoryId
    if (!categoryId && body.category) {
      const cat = await prisma.category.findFirst({ where: { name: body.category } })
      if (cat) categoryId = cat.id
    }
    if (!categoryId) {
      const cat = await prisma.category.findFirst()
      categoryId = cat?.id
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description || body.name,
        price: body.price,
        comparePrice: body.comparePrice || null,
        stock: body.stock ?? 0,
        status: body.status || 'ACTIVE',
        images: typeof body.images === 'string' ? body.images : JSON.stringify(Array.isArray(body.images) ? body.images : []),
        tags: JSON.stringify([]),
        vendorId: vendor.id,
        categoryId,
        featured: false,
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || 'Failed to create product' }, { status: 500 })
  }
}
