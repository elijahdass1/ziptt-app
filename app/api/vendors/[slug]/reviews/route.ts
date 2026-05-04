// Vendor-level reviews — separate endpoint from /api/products/[slug]/reviews.
// Customers rate the SELLER (overall service, comms, packaging) here, not a
// specific product. Eligibility: must have at least one DELIVERED or CONFIRMED
// order from this vendor. One review per (customer, vendor) pair.
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const reviews = await prisma.vendorReview.findMany({
    where: { vendorId: vendor.id, status: 'APPROVED' },
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

  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    select: { id: true, userId: true },
  })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  // Vendors can't review themselves.
  if (vendor.userId === session.user.id) {
    return NextResponse.json({ error: 'You cannot review your own store' }, { status: 403 })
  }

  const { rating, title, body } = await req.json()

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  // Eligibility: must have a delivered/confirmed order from this vendor.
  const eligibleOrder = await prisma.order.findFirst({
    where: {
      customerId: session.user.id,
      vendorId: vendor.id,
      status: { in: ['DELIVERED', 'CONFIRMED'] },
    },
    select: { id: true },
  })
  if (!eligibleOrder) {
    return NextResponse.json(
      { error: 'You can only review vendors after a delivered order' },
      { status: 403 }
    )
  }

  const existing = await prisma.vendorReview.findUnique({
    where: { vendorId_userId: { vendorId: vendor.id, userId: session.user.id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'You have already reviewed this vendor' }, { status: 409 })
  }

  const review = await prisma.vendorReview.create({
    data: {
      vendorId: vendor.id,
      userId: session.user.id,
      rating,
      title: title ?? null,
      body: body ?? null,
      // Auto-approve for now to keep the demo flowing; admin can flip to PENDING
      // gate later if abuse appears. Matches Review model behaviour.
      status: 'APPROVED',
    },
  })

  // Recompute aggregate rating + count on the vendor row so the profile
  // header shows fresh numbers without needing a join on every page hit.
  const agg = await prisma.vendorReview.aggregate({
    where: { vendorId: vendor.id, status: 'APPROVED' },
    _avg: { rating: true },
    _count: true,
  })
  await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  })

  return NextResponse.json(review, { status: 201 })
}
