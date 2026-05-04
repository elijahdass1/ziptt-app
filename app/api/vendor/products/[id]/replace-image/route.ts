// Vendor-scoped endpoint to replace a product's image set with one fresh URL.
// Used by the drag-and-drop "Fix Product Photos" workflow: the client uploads
// to UploadThing, then POSTs the resulting URL here.
//
// Two operations are supported:
//   POST { url, position?: 'replace' | 'prepend' }
//     - replace (default): images = [url]
//     - prepend: images = [url, ...existing]
//
// The vendor must own the product. Admins can also use this route for any
// vendor's product (handy for the admin needs-photos view).
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { parseImages } from '@/lib/parseImages'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const product = await prisma.product.findUnique({ where: { id: params.id } })
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Authorisation: must be ADMIN or the owning vendor.
  if (session.user.role !== 'ADMIN') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
    if (!vendor || vendor.id !== product.vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body.url !== 'string' || !body.url.startsWith('http')) {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }
  const url: string = body.url
  const position: 'replace' | 'prepend' = body.position === 'prepend' ? 'prepend' : 'replace'

  let nextImages: string[]
  if (position === 'replace') {
    nextImages = [url]
  } else {
    const existing = parseImages(product.images).filter((u) => u !== url)
    nextImages = [url, ...existing]
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { images: JSON.stringify(nextImages) },
    select: { id: true, images: true },
  })

  return NextResponse.json({
    id: updated.id,
    images: parseImages(updated.images),
  })
}
