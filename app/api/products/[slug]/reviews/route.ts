export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const reviews = await prisma.review.findMany({
    where: { productId: product.id, status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, image: true } } },
  })

  return NextResponse.json(
    reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt,
      verified: r.verified,
      user: { name: r.user.name, image: r.user.image },
    }))
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 10 review submissions / hour / user. The eligibility check
  // (must have a delivered order) below already blocks most abuse,
  // but the rate-limit cuts off automated probing for products the
  // user *does* qualify for.
  const { allowed } = rateLimit(`review:${session.user.id}`, 10, 3_600_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many reviews submitted recently.' }, { status: 429 })
  }

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { rating, title, body } = await req.json()

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  // Check the user has a DELIVERED or CONFIRMED order containing this product
  const eligibleOrder = await prisma.order.findFirst({
    where: {
      customerId: session.user.id,
      status: { in: ['DELIVERED', 'CONFIRMED'] },
      items: { some: { productId: product.id } },
    },
  })
  if (!eligibleOrder) {
    return NextResponse.json(
      { error: 'You can only review products from delivered or confirmed orders' },
      { status: 403 }
    )
  }

  // Check the user hasn't already reviewed this product
  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId: product.id, userId: session.user.id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
  }

  const review = await prisma.review.create({
    data: {
      productId: product.id,
      userId: session.user.id,
      rating,
      title: title ?? null,
      body: body ?? null,
      status: 'PENDING',
      verified: true,
    },
  })

  return NextResponse.json(review, { status: 201 })
}
