// Admin-side "Fix Product Photos" page — same drag-and-drop workflow as the
// vendor view, but cross-vendor. Lets the admin power-user fix any product's
// images without waiting on individual vendors to log in.
//
// The replace-image API route already accepts ADMIN role for any product,
// so the existing DragDropImageZone component just works.
export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { firstImage } from '@/lib/parseImages'
import { imageProblem } from '@/lib/badImage'
import { AdminNeedsPhotosClient } from '@/components/admin/AdminNeedsPhotosClient'

interface PageProps {
  searchParams: { vendor?: string; problem?: string }
}

export default async function AdminNeedsPhotosPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/auth/login')

  // Build the where clause. Admin can scope to one vendor via ?vendor=<id>
  // and one problem type via ?problem=placeholder|stock-photo|missing.
  const badImageOr = [
    { images: { contains: 'placehold.co' } },
    { images: { contains: 'placeholder.com' } },
    { images: { contains: '/api/product-img' } },
    { images: { contains: 'images.unsplash' } },
    { images: '[]' },
  ]

  let problemFilter = badImageOr
  if (searchParams.problem === 'placeholder') {
    problemFilter = [
      { images: { contains: 'placehold.co' } },
      { images: { contains: 'placeholder.com' } },
      { images: { contains: '/api/product-img' } },
    ]
  } else if (searchParams.problem === 'stock-photo') {
    problemFilter = [{ images: { contains: 'images.unsplash' } }]
  } else if (searchParams.problem === 'missing') {
    problemFilter = [{ images: '[]' }]
  }

  // Pull bad-image products + a per-vendor breakdown for the filter UI.
  const [products, vendorBreakdown] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: problemFilter,
        ...(searchParams.vendor ? { vendorId: searchParams.vendor } : {}),
      },
      orderBy: [{ vendorId: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        status: true,
        stock: true,
        vendor: { select: { id: true, storeName: true } },
        category: { select: { name: true } },
      },
      take: 500, // safety cap so the page never tries to render thousands
    }),
    // Group counts per vendor, used to render the vendor pills filter.
    prisma.product.groupBy({
      by: ['vendorId'],
      where: { OR: badImageOr },
      _count: true,
      orderBy: { _count: { vendorId: 'desc' } },
    }),
  ])

  // Hydrate vendor names in one query
  const vendorIds = vendorBreakdown.map((v) => v.vendorId)
  const vendors = await prisma.vendor.findMany({
    where: { id: { in: vendorIds } },
    select: { id: true, storeName: true },
  })
  const vendorById = new Map(vendors.map((v) => [v.id, v.storeName]))

  const vendorPills = vendorBreakdown.map((row) => ({
    id: row.vendorId,
    name: vendorById.get(row.vendorId) ?? '(unknown)',
    count: row._count,
  }))

  const totalBad = vendorBreakdown.reduce((sum, v) => sum + v._count, 0)

  const enriched = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: firstImage(p.images, ''),
    problem: imageProblem(p.images),
    status: p.status,
    stock: p.stock,
    category: p.category?.name ?? '',
    vendorId: p.vendor.id,
    vendorName: p.vendor.storeName,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products needing real photos</h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalBad} total across all vendors · showing {enriched.length}
          {searchParams.vendor && ` filtered to ${vendorById.get(searchParams.vendor) ?? 'vendor'}`}
        </p>
      </div>

      <AdminNeedsPhotosClient
        products={enriched}
        vendorPills={vendorPills}
        activeVendorId={searchParams.vendor ?? null}
        activeProblem={searchParams.problem ?? null}
      />
    </div>
  )
}
