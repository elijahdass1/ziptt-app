import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const minPrice = parseFloat(searchParams.get('minPrice') ?? '0')
  const maxPrice = parseFloat(searchParams.get('maxPrice') ?? '999999')
  const sort = searchParams.get('sort') ?? 'featured'
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '12')

  const where: any = {
    status: 'ACTIVE',
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
      ],
    }),
    ...(category && { category: { slug: category } }),
    price: { gte: minPrice, lte: maxPrice },
  }

  const orderBy: any =
    sort === 'price-asc' ? { price: 'asc' }
    : sort === 'price-desc' ? { price: 'desc' }
    : sort === 'newest' ? { createdAt: 'desc' }
    : sort === 'rating' ? { rating: 'desc' }
    : sort === 'popular' ? { soldCount: 'desc' }
    : { featured: 'desc' }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        vendor: { select: { storeName: true, slug: true, rating: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({ products, total, pages: Math.ceil(total / limit) })
}
