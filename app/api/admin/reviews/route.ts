export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const reviews = await prisma.review.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
  })

  return NextResponse.json(reviews)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, status } = await req.json()
  if (!id || !['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const review = await prisma.review.update({
    where: { id },
    data: { status },
  })

  // If approved, update the product's rating and reviewCount
  if (status === 'APPROVED') {
    const approvedReviews = await prisma.review.findMany({
      where: { productId: review.productId, status: 'APPROVED' },
      select: { rating: true },
    })
    const avgRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0
    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: avgRating, reviewCount: approvedReviews.length },
    })
  }

  return NextResponse.json(review)
}
