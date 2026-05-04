// "Fix Product Photos" page — shows ONLY this vendor's products that
// currently have a placeholder or stock-photo image, and lets them
// drag-and-drop a replacement straight onto each row.
//
// Server component: queries the bad-image set with raw SQL (cleaner than
// pulling every product and filtering in JS for vendors with hundreds of SKUs)
// and hands the list to the client component.
export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { firstImage } from '@/lib/parseImages'
import { imageProblem } from '@/lib/badImage'
import { NeedsPhotosClient } from '@/components/vendor/NeedsPhotosClient'
import Link from 'next/link'
import { ArrowLeft, ImageIcon } from 'lucide-react'

export default async function NeedsPhotosPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login?callbackUrl=/vendor/products/needs-photos')

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
  if (!vendor) redirect('/vendor/register')

  // Pull every product for this vendor that has a bad image. We use Prisma's
  // OR/contains rather than $queryRaw so the result is fully typed.
  const products = await prisma.product.findMany({
    where: {
      vendorId: vendor.id,
      OR: [
        { images: { contains: 'placehold.co' } },
        { images: { contains: 'placeholder.com' } },
        { images: { contains: '/api/product-img' } },
        { images: { contains: 'images.unsplash' } },
        { images: '[]' },
      ],
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      status: true,
      stock: true,
      category: { select: { name: true } },
    },
  })

  const enriched = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: firstImage(p.images, ''),
    problem: imageProblem(p.images),
    status: p.status,
    stock: p.stock,
    category: p.category?.name ?? '',
  }))

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[#C9A84C] mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All products
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Fix Product Photos</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {enriched.length === 0
            ? 'All your products have real photos. '
            : `${enriched.length} product${enriched.length === 1 ? '' : 's'} still on a placeholder or stock photo. `}
          Drag a real photo onto any tile to replace it instantly.
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="rounded-xl border border-[#C9A84C]/20 bg-[#111] p-12 text-center">
          <ImageIcon className="h-10 w-10 text-[#C9A84C] mx-auto mb-3" />
          <p className="text-[var(--text-primary)] font-semibold">Nothing to fix.</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            All your listings already have real photos. New listings created with
            placeholders will show up here automatically.
          </p>
        </div>
      ) : (
        <NeedsPhotosClient products={enriched} />
      )}
    </div>
  )
}
