export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { ProductFilters } from '@/components/storefront/ProductFilters'
import { ProductGrid } from '@/components/storefront/ProductGrid'
import prisma from '@/lib/prisma'

interface PageProps {
  searchParams: { q?: string; category?: string; vendor?: string; minPrice?: string; maxPrice?: string; sort?: string; page?: string }
}

async function getProducts(searchParams: PageProps['searchParams']) {
  const q = searchParams.q ?? ''
  const category = searchParams.category ?? ''
  const vendorSlug = searchParams.vendor ?? ''
  const minPrice = parseFloat(searchParams.minPrice ?? '0')
  const maxPrice = parseFloat(searchParams.maxPrice ?? '99999')
  const sort = searchParams.sort ?? 'featured'
  const page = parseInt(searchParams.page ?? '1')
  const limit = 12

  const where: any = {
    status: 'ACTIVE',
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { vendor: { storeName: { contains: q, mode: 'insensitive' } } },
        { tags: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...(category && { category: { slug: category } }),
    ...(vendorSlug && { vendor: { slug: vendorSlug } }),
    price: { gte: minPrice, lte: maxPrice },
  }

  const orderBy: any =
    sort === 'price-asc' ? { price: 'asc' }
    : sort === 'price-desc' ? { price: 'desc' }
    : sort === 'newest' ? { createdAt: 'desc' }
    : sort === 'rating' ? { rating: 'desc' }
    : sort === 'popular' ? { soldCount: 'desc' }
    : { featured: 'desc' }

  const [products, total, categories, vendors] = await Promise.all([
    prisma.product.findMany({
      where, orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        vendor: { select: { storeName: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { products: { some: { status: 'ACTIVE' } } },
      orderBy: { name: 'asc' },
    }),
    prisma.vendor.findMany({
      where: { status: 'APPROVED', products: { some: { status: 'ACTIVE' } } },
      select: { storeName: true, slug: true },
      orderBy: { storeName: 'asc' },
    }),
  ])

  return { products, total, pages: Math.ceil(total / limit), categories, vendors }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { products, total, pages, categories, vendors } = await getProducts(searchParams)
  const currentCategory = categories.find((c) => c.slug === searchParams.category)
  const currentVendor = vendors.find((v) => v.slug === searchParams.vendor)

  const heading = currentVendor
    ? currentVendor.storeName
    : currentCategory
    ? currentCategory.name
    : searchParams.q
    ? `Results for "${searchParams.q}"`
    : 'All Products'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F5F0E8]">{heading}</h1>
        <p className="text-sm text-[#9A8F7A] mt-1">{total} products found</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-56 shrink-0">
          <ProductFilters categories={categories} vendors={vendors} searchParams={searchParams} />
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            total={total}
            pages={pages}
            currentPage={parseInt(searchParams.page ?? '1')}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  )
}
