export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
  if (!vendor || vendor.status !== 'APPROVED') return NextResponse.json({ error: 'Vendor not approved' }, { status: 403 })

  try {
    const body = await req.json()
    // Make slug unique if needed
    let slug = body.slug
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const product = await prisma.product.create({
      data: {
        ...body,
        slug,
        vendorId: vendor.id,
        images: JSON.stringify(Array.isArray(body.images) ? body.images : []),
        tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
