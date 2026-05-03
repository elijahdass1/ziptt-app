// Facebook-style vendor profile page.
//
// Layout:
//   - Wide cover photo (16:6) at top, falls back to gradient
//   - Logo (round, large) overlapping bottom-left of cover
//   - Store name + verified badge + rating + "Message Seller" CTA on right
//   - Tabs: Top Items | All Products | Reviews | About
//   - Top Items = featured-first slice of the catalogue (visual highlight)
//   - All Products = full filterable + paginated grid (the old behaviour)
//   - Reviews = vendor-level reviews (separate from per-product reviews)
//   - About = bio, region, member since, etc.
//
// Tabs are server-rendered via ?tab= query so deep-linking + SSR work
// without client state. Filters/pagination only apply on the All tab.
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Star, MapPin, Package, ShoppingBag, ArrowLeft, Store, Phone,
  ChevronLeft, ChevronRight, BadgeCheck, Calendar, MessageSquare, Sparkles,
} from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ProductCard } from '@/components/storefront/ProductCard'
import { VendorReviewSection } from '@/components/storefront/VendorReviewSection'
import { ChatWithVendor } from '@/components/storefront/ChatWithVendor'

interface PageProps {
  params: { slug: string }
  searchParams: { page?: string; sort?: string; category?: string; tab?: string }
}

const LIMIT = 24
const TOP_ITEMS_LIMIT = 8

type Tab = 'top' | 'all' | 'reviews' | 'about'

const TABS: { value: Tab; label: string }[] = [
  { value: 'top',     label: 'Top Items' },
  { value: 'all',     label: 'All Products' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'about',   label: 'About' },
]

function parseTab(input: string | undefined): Tab {
  if (input === 'all' || input === 'reviews' || input === 'about') return input
  return 'top'
}

// OG / Twitter metadata for vendor storefront links — drives the
// preview when a customer shares e.g. "/store/d-best-toys" via
// WhatsApp.
export async function generateMetadata({ params }: PageProps): Promise<import('next').Metadata> {
  const v = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    select: { storeName: true, description: true, bio: true, banner: true, coverImage: true, logo: true, region: true },
  })
  if (!v) return { title: 'Store not found' }
  const title = `${v.storeName} on zip.tt`
  const description = (v.bio ?? v.description ?? `${v.storeName}${v.region ? ` — ${v.region}, Trinidad` : ''} on zip.tt`).slice(0, 160)
  const image = v.banner ?? v.coverImage ?? v.logo ?? undefined
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'zip.tt',
      ...(image ? { images: [{ url: image, alt: v.storeName }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function VendorStorePage({ params, searchParams }: PageProps) {
  const tab      = parseTab(searchParams.tab)
  const page     = parseInt(searchParams.page ?? '1')
  const sort     = searchParams.sort ?? 'featured'
  const category = searchParams.category ?? ''

  // Headline data — fetched on every tab so the profile header is consistent.
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    include: {
      _count: { select: { products: { where: { status: 'ACTIVE' } } } },
    },
  })
  if (!vendor) notFound()

  const session = await getServerSession(authOptions)
  const isOwnStore = !!session && vendor.userId === session.user.id

  // For the reviews CTA: the user is eligible only if they have at least one
  // delivered/confirmed order from this vendor.
  let canReview = false
  if (session && !isOwnStore) {
    const eligibleOrder = await prisma.order.findFirst({
      where: {
        customerId: session.user.id,
        vendorId: vendor.id,
        status: { in: ['DELIVERED', 'CONFIRMED'] },
      },
      select: { id: true },
    })
    canReview = !!eligibleOrder
  }

  // Active product count (used in stats and tab badges) is shared across tabs.
  const productCount = vendor._count.products

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    if (tab !== 'top')        p.set('tab', tab)
    if (sort !== 'featured')  p.set('sort', sort)
    if (category)             p.set('category', category)
    if (page > 1)             p.set('page', page.toString())
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    p.delete('page') // a non-page-related change should reset pagination
    const qs = p.toString()
    return qs ? `/store/${params.slug}?${qs}` : `/store/${params.slug}`
  }

  const tabUrl = (t: Tab) => {
    if (t === 'top') return `/store/${params.slug}`
    return `/store/${params.slug}?tab=${t}`
  }

  const memberSince = new Date(vendor.createdAt).toLocaleDateString('en-TT', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen">
      {/* ─── Cover photo + logo (Facebook-style) ─── */}
      <div className="relative w-full">
        {/* Cover */}
        <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden bg-[#0A0A0A]">
          {vendor.coverImage ? (
            <img src={vendor.coverImage} alt="" className="w-full h-full object-cover" />
          ) : vendor.banner ? (
            <img src={vendor.banner} alt="" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1500] via-[#0A0A0A] to-[#1A1500]" />
          )}
          {/* Subtle dark fade so text on top stays legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <Link href="/products" className="flex items-center gap-1.5 text-sm text-[#F5F0E8] hover:text-[#C9A84C] transition-colors bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <ArrowLeft className="h-3.5 w-3.5" /> All Products
            </Link>
          </div>
        </div>

        {/* Identity row — overlapping bottom of cover */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20 relative z-10 pb-4">
            {/* Logo (round, big) */}
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-[#111111] border-4 border-[#0A0A0A] ring-2 ring-[#C9A84C]/40 flex items-center justify-center overflow-hidden shadow-2xl shrink-0">
              {vendor.logo ? (
                <img src={vendor.logo} alt={vendor.storeName} className="h-full w-full object-cover" />
              ) : (
                <Store className="h-14 w-14 text-[#C9A84C]" />
              )}
            </div>

            {/* Name block */}
            <div className="flex-1 min-w-0 md:pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-[#F5F0E8]">{vendor.storeName}</h1>
                {vendor.idVerified && (
                  <BadgeCheck className="h-5 w-5 text-[#C9A84C]" aria-label="Verified seller" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#9A8F7A]">
                {vendor.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" />
                    <span className="font-bold text-[#F5F0E8]">{vendor.rating.toFixed(1)}</span>
                    <span>({vendor.reviewCount} review{vendor.reviewCount !== 1 ? 's' : ''})</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> {productCount.toLocaleString()} product{productCount !== 1 ? 's' : ''}
                </span>
                {vendor.totalSales > 0 && (
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="h-3.5 w-3.5" /> {vendor.totalSales.toLocaleString()}+ sold
                  </span>
                )}
                {vendor.region && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {vendor.region}
                  </span>
                )}
              </div>
            </div>

            {/* Action row */}
            <div className="flex items-center gap-2 md:pb-2">
              <ChatWithVendor
                vendorSlug={vendor.slug}
                vendorName={vendor.storeName}
                vendorLogo={vendor.logo}
                isSignedIn={!!session}
                isOwnStore={isOwnStore}
              />
              {isOwnStore && (
                <Link
                  href="/vendor/settings"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
                >
                  Edit Store
                </Link>
              )}
            </div>
          </div>

          {/* Tabs row — sticky-ish, divides identity from content */}
          <div className="border-b border-[#C9A84C]/15 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 overflow-x-auto">
              {TABS.map((t) => {
                const active = t.value === tab
                return (
                  <Link
                    key={t.value}
                    href={tabUrl(t.value)}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      active
                        ? 'border-[#C9A84C] text-[#C9A84C]'
                        : 'border-transparent text-[#9A8F7A] hover:text-[#F5F0E8]'
                    }`}
                  >
                    {t.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* ─── Tab content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'top' && (
          <TopItemsTab vendorId={vendor.id} vendorSlug={vendor.slug} totalProducts={productCount} />
        )}

        {tab === 'all' && (
          <AllProductsTab
            vendorId={vendor.id}
            vendorSlug={vendor.slug}
            page={page}
            sort={sort}
            category={category}
            buildUrl={buildUrl}
          />
        )}

        {tab === 'reviews' && (
          <ReviewsTab
            vendorId={vendor.id}
            vendorSlug={vendor.slug}
            session={session as { user?: { id?: string; name?: string } } | null}
            canReview={canReview}
            isOwnStore={isOwnStore}
          />
        )}

        {tab === 'about' && (
          <AboutTab vendor={vendor} memberSince={memberSince} productCount={productCount} />
        )}
      </div>
    </div>
  )
}

// ─── Tab: Top Items ──────────────────────────────────────────────────────────
async function TopItemsTab({
  vendorId,
  vendorSlug,
  totalProducts,
}: {
  vendorId: string
  vendorSlug: string
  totalProducts: number
}) {
  const items = await prisma.product.findMany({
    where: { vendorId, status: 'ACTIVE' },
    orderBy: [{ featured: 'desc' }, { soldCount: 'desc' }, { rating: 'desc' }],
    take: TOP_ITEMS_LIMIT,
    include: {
      category: { select: { name: true, slug: true } },
      vendor: { select: { storeName: true, slug: true } },
    },
  })

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <Package className="h-12 w-12 text-[#9A8F7A] mx-auto mb-4" strokeWidth={1.2} />
        <h3 className="text-lg font-semibold text-[#F5F0E8] mb-1">No products yet</h3>
        <p className="text-sm text-[#9A8F7A]">This seller hasn&apos;t listed any items.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#C9A84C]" />
          <h2 className="text-lg font-bold text-[#F5F0E8]">Featured & Best-Sellers</h2>
        </div>
        {totalProducts > items.length && (
          <Link
            href={`/store/${vendorSlug}?tab=all`}
            className="text-xs text-[#C9A84C] hover:text-[#F5F0E8] transition-colors"
          >
            View all {totalProducts} →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}

// ─── Tab: All Products (the original filterable + paginated grid) ────────────
async function AllProductsTab({
  vendorId,
  vendorSlug,
  page,
  sort,
  category,
  buildUrl,
}: {
  vendorId: string
  vendorSlug: string
  page: number
  sort: string
  category: string
  buildUrl: (o: Record<string, string | undefined>) => string
}) {
  const orderBy: any =
    sort === 'price-asc'  ? { price: 'asc' }
    : sort === 'price-desc' ? { price: 'desc' }
    : sort === 'newest'     ? { createdAt: 'desc' }
    : sort === 'rating'     ? { rating: 'desc' }
    : [{ featured: 'desc' }, { soldCount: 'desc' }]

  const where: any = {
    vendorId,
    status: 'ACTIVE',
    ...(category && { category: { slug: category } }),
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where, orderBy,
      skip: (page - 1) * LIMIT,
      take: LIMIT,
      include: {
        category: { select: { name: true, slug: true } },
        vendor: { select: { storeName: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { products: { some: { vendorId, status: 'ACTIVE' } } },
      orderBy: { name: 'asc' },
    }),
  ])
  const pages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-1.5 flex-1">
            <Link
              href={buildUrl({ category: undefined })}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                !category
                  ? 'bg-[#C9A84C] text-[#0A0A0A] border-[#C9A84C] font-semibold'
                  : 'text-[#9A8F7A] border-[#C9A84C]/20 hover:border-[#C9A84C]/50 hover:text-[#F5F0E8]'
              }`}
            >All</Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={buildUrl({ category: cat.slug })}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  category === cat.slug
                    ? 'bg-[#C9A84C] text-[#0A0A0A] border-[#C9A84C] font-semibold'
                    : 'text-[#9A8F7A] border-[#C9A84C]/20 hover:border-[#C9A84C]/50 hover:text-[#F5F0E8]'
                }`}
              >{cat.name}</Link>
            ))}
          </div>
        )}

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
            >{opt.label}</Link>
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
          <p className="text-xs text-[#9A8F7A]">
            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString()} products
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10 mb-6">
              {page > 1 && (
                <Link href={buildUrl({ page: String(page - 1) })} className="p-2 border border-[#C9A84C]/30 rounded-lg hover:bg-[#1A1A1A] text-[#9A8F7A] hover:text-[#F5F0E8] transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              )}
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
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
  )
}

// ─── Tab: Reviews ────────────────────────────────────────────────────────────
async function ReviewsTab({
  vendorId,
  vendorSlug,
  session,
  canReview,
  isOwnStore,
}: {
  vendorId: string
  vendorSlug: string
  // getServerSession's return type is unknown without typed authOptions, so
  // we accept the loose shape that VendorReviewSection consumes.
  session: { user?: { id?: string; name?: string } } | null
  canReview: boolean
  isOwnStore: boolean
}) {
  const reviews = await prisma.vendorReview.findMany({
    where: { vendorId, status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, image: true } } },
  })

  const initialReviews = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    user: { name: r.user.name, image: r.user.image },
  }))

  return (
    <VendorReviewSection
      vendorSlug={vendorSlug}
      initialReviews={initialReviews}
      userSession={session}
      canReview={canReview}
      isOwnStore={isOwnStore}
    />
  )
}

// ─── Tab: About ──────────────────────────────────────────────────────────────
function AboutTab({
  vendor,
  memberSince,
  productCount,
}: {
  vendor: any
  memberSince: string
  productCount: number
}) {
  const facts = [
    vendor.region && { icon: MapPin, label: 'Region', value: vendor.region },
    vendor.phone  && { icon: Phone,  label: 'Phone',  value: vendor.phone },
    { icon: Calendar, label: 'Joined', value: memberSince },
    { icon: Package,  label: 'Products', value: productCount.toLocaleString() },
    vendor.totalSales > 0 && { icon: ShoppingBag, label: 'Total Sales', value: `${vendor.totalSales.toLocaleString()}+` },
    vendor.idVerified && { icon: BadgeCheck, label: 'Verification', value: 'Verified seller' },
  ].filter(Boolean) as { icon: any; label: string; value: string }[]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-6">
          <h2 className="text-lg font-bold text-[#F5F0E8] mb-3">About {vendor.storeName}</h2>
          {vendor.bio ? (
            <p className="text-sm text-[#9A8F7A] leading-relaxed whitespace-pre-wrap">{vendor.bio}</p>
          ) : vendor.description ? (
            <p className="text-sm text-[#9A8F7A] leading-relaxed">{vendor.description}</p>
          ) : (
            <p className="text-sm text-[#666] italic">No bio yet.</p>
          )}
        </div>
      </div>
      <aside className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-6 space-y-3 h-fit">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C9A84C] mb-2">Details</h3>
        {facts.map((f) => (
          <div key={f.label} className="flex items-start gap-2.5">
            <f.icon className="h-4 w-4 text-[#C9A84C] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-[#9A8F7A]">{f.label}</p>
              <p className="text-sm text-[#F5F0E8] truncate">{f.value}</p>
            </div>
          </div>
        ))}
      </aside>
    </div>
  )
}
