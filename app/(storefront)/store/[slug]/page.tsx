export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, MapPin, Package, ShoppingBag, ArrowLeft, Store, Phone, ChevronLeft, ChevronRight } from 'lucide-react'
import prisma from '@/lib/prisma'
import { ProductCard } from '@/components/storefront/ProductCard'

interface PageProps {
  params: { slug: string }
  searchParams: { page?: string; sort?: string; category?: string }
}

const LIMIT = 24

async function getVendorData(slug: string, page: number, sort: string, category: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug },
    include: {
      _count: { select: { products: { where: { status: 'ACTIVE' } } } },
    },
  })
  if (!vendor) return null

  const orderBy: any =
    sort === 'price-asc'  ? { price: 'asc' }
    : sort === 'price-desc' ? { price: 'desc' }
    : sort === 'newest'     ? { createdAt: 'desc' }
    : sort === 'rating'     ? { rating: 'desc' }
    : [{ featured: 'desc' }, { soldCount: 'desc' }]

  const where: any = {
    vendorId: vendor.id,
    status: 'ACTIVE',
    ...(category && { category: { slug: category } }),
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * LIMIT,
      take: LIMIT,
      include: {
        category: { select: { name: true, slug: true } },
        vendor: { select: { storeName: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { products: { some: { vendorId: vendor.id, status: 'ACTIVE' } } },
      orderBy: { name: 'asc' },
    }),
  ])

  return { vendor, products, total, pages: Math.ceil(total / LIMIT), categories }
}

export default async function VendorStorePage({ params, searchParams }: PageProps) {
  const page     = parseInt(searchParams.page ?? '1')
  const sort     = searchParams.sort ?? 'featured'
  const category = searchParams.category ?? ''

  const data = await getVendorData(params.slug, page, sort, category)
  if (!data) notFound()

  const { vendor, products, total, pages, categories } = data

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    if (sort !== 'featured')  p.set('sort', sort)
    if (category)             p.set('category', category)
    if (page > 1)             p.set('page', page.toString())
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    p.delete('page')
    return `/store/${params.slug}?${p.toString()}`
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-52 md:h-64 overflow-hidden bg-[#0A0A0A]">
        {vendor.banner ? (
          <img src={vendor.banner} alt="" className="w-full h-full object-cover opacity-35" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A1500] to-[#0A0A0A]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link href="/products" className="flex items-center gap-1.5 text-sm text-[#9A8F7A] hover:text-[#C9A84C] transition-colors bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <ArrowLeft className="h-3.5 w-3.5" /> All Products
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Vendor Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-14 relative z-10 mb-8">
          <div className="h-24 w-24 rounded-2xl bg-[#111111] border-2 border-[#C9A84C]/40 flex items-center justify-center overflow-hidden shadow-2xl shrink-0">
            {vendor.logo ? (
              <img src={vendor.logo} alt={vendor.storeName} className="h-24 w-24 object-cover rounded-2xl" />
            ) : (
              <Store className="h-10 w-10 text-[#C9A84C]" />
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black text-[#F5F0E8]">{vendor.storeName}</h1>
              <div className="flex items-center gap-1.5 bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Verified
              </div>
            </div>
            {vendor.description && (
              <p className="text-sm text-[#9A8F7A] mt-1.5 max-w-xl leading-relaxed">{vendor.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-[#F0C040] text-[#F0C040]" />
                <span className="text-sm font-bold text-[#F5F0E8]">{vendor.rating.toFixed(1)}</span>
                <span className="text-xs text-[#9A8F7A]">rating</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#9A8F7A]">
                <Package className="h-3.5 w-3.5" />
                {total.toLocaleString()} products
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#9A8F7A]">
                <ShoppingBag className="h-3.5 w-3.5" />
                {vendor.totalSales.toLocaleString()}+ sales
              </div>
              {vendor.region && (
                <div className="flex items-center gap-1.5 text-xs text-[#9A8F7A]">
                  <MapPin className="h-3.5 w-3.5" />
                  {vendor.region}
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center gap-1.5 text-xs text-[#9A8F7A]">
                  <Phone className="h-3.5 w-3.5" />
                  {vendor.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-8 p-4 bg-[#111111] rounded-xl border border-[#C9A84C]/15">
          <div className="text-center">
            <div className="text-xl font-black text-[#C9A84C]">{vendor.rating.toFixed(1)}</div>
            <div className="text-xs text-[#9A8F7A]">Avg Rating</div>
          </div>
          <div className="text-center border-x border-[#C9A84C]/10">
            <div className="text-xl font-black text-[#C9A84C]">{total.toLocaleString()}</div>
            <div className="text-xs text-[#9A8F7A]">Products</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-[#C9A84C]">{vendor.totalSales.toLocaleString()}+</div>
            <div className="text-xs text-[#9A8F7A]">Sales</div>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {/* Category pills */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5 flex-1">
              <Link
                href={buildUrl({ category: undefined })}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  !category
                    ? 'bg-[#C9A84C] text-[#0A0A0A] border-[#C9A84C] font-semibold'
                    : 'text-[#9A8F7A] border-[#C9A84C]/20 hover:border-[#C9A84C]/50 hover:text-[#F5F0E8]'
                }`}
              >
                All
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={buildUrl({ category: cat.slug })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    category === cat.slug
                      ? 'bg-[#C9A84C] text-[#0A0A0A] border-[#C9A84C] font-semibold'
                      : 'text-[#9A8F7A] border-[#C9A84C]/20 hover:border-[#C9A84C]/50 hover:text-[#F5F0E8]'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Sort */}
          <div className="flex items-center gap-1 shrink-0">
            {[
              { value: 'featured',   label: 'Featured' },
              { value: 'newest',     label: 'New' },
              { value: 'price-asc',  label: '$ ↑' },
              { value: 'price-desc', label: '$ ↓' },
            ].map(opt => (
              <Link
                key={opt.value}
                href={buildUrl({ sort: opt.value })}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  sort === opt.value
                    ? 'bg-[#1A1A00] text-[#C9A84C] border-[#C9A84C]/40 font-semibold'
                    : 'text-[#9A8F7A] border-[#C9A84C]/15 hover:border-[#C9A84C]/40 hover:text-[#F5F0E8]'
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <div className="text-center py-24">
            <Package className="h-12 w-12 text-[#9A8F7A] mx-auto mb-4" strokeWidth={1.2} />
            <h3 className="text-lg font-semibold text-[#F5F0E8] mb-1">No products found</h3>
            <p className="text-sm text-[#9A8F7A]">Try a different filter.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#9A8F7A] mb-4">
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString()} products
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 mb-6">
                {page > 1 && (
                  <Link href={buildUrl({ page: String(page - 1) })} className="p-2 border border-[#C9A84C]/30 rounded-lg hover:bg-[#1A1A1A] text-[#9A8F7A] hover:text-[#F5F0E8] transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                )}
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  // Show smart range around current page
                  let p: number
                  if (pages <= 7) p = i + 1
                  else if (page <= 4) p = i + 1
                  else if (page >= pages - 3) p = pages - 6 + i
                  else p = page - 3 + i
                  return (
                    <Link key={p} href={buildUrl({ page: String(p) })}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-[#C9A84C] text-[#0A0A0A] font-bold'
                          : 'border border-[#C9A84C]/20 text-[#9A8F7A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8]'
                      }`}>
                      {p}
                    </Link>
                  )
                })}
                {page < pages && (
                  <Link href={buildUrl({ page: String(page + 1) })} className="p-2 border border-[#C9A84C]/30 rounded-lg hover:bg-[#1A1A1A] text-[#9A8F7A] hover:text-[#F5F0E8] transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
