// Homepage information architecture inspired by Amazon (quad cards +
// horizontal product rails) but kicked up several notches in
// liveliness: animated promo ticker above the hero, drifting glow
// blobs, pulse-ringed "TRENDING NOW" eyebrow, category-colored top
// stripes on each quad card, mid-page diagonal-stripe promo banner,
// and ziptt-lift hover on every card surface so the page feels
// physically responsive when you mouse around.
//
// Data fetchers all exclude any product whose images JSON still
// contains "/api/product-img" — keeps the home page on real photos
// regardless of how new SKUs land.
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import {
  ArrowRight, Star, Store, MapPin,
  Zap, Home, Sparkles, Flame, Gamepad2, Wine,
  TrendingUp, Tag, Clock, Crown, type LucideIcon,
} from 'lucide-react'
import prisma from '@/lib/prisma'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ProductRail } from '@/components/storefront/ProductRail'
import { CategoryQuadCard } from '@/components/storefront/CategoryQuadCard'
import { PromoTicker } from '@/components/storefront/PromoTicker'
import { HeroSpotlight } from '@/components/storefront/HeroSpotlight'
import { VendorMarquee } from '@/components/storefront/VendorMarquee'
import { formatTTD } from '@/lib/utils'

// Slug → accent color (used for the top stripe on each quad card and
// for the hero-pill icon tint). Mirrors the colors in the Navbar so
// the visual identity is consistent.
const CATEGORY_COLOR: Record<string, string> = {
  electronics:    '#4A9EFF',
  fashion:        '#FF7EB3',
  'urban-fashion':'#C9A84C',
  carnival:       '#FF6B35',
  toys:           '#7EC8E3',
  'rum-spirits':  '#B8860B',
  'home-garden':  '#4CAF82',
  appliances:     '#9C88FF',
  groceries:      '#E8B04B',
  beauty:         '#FF7EB3',
  sports:         '#4A9EFF',
  automotive:     '#9C88FF',
  services:       '#9A8F7A',
}

// Friendly headline labels — DB Category.name reads a bit catalog-y.
const CATEGORY_LABEL: Record<string, string> = {
  electronics:    'Latest Electronics',
  fashion:        'Fashion You’ll Love',
  'urban-fashion':'Streetwear Drops',
  carnival:       'Carnival Ready',
  toys:           'Toys & Kids',
  'rum-spirits':  'Caribbean Spirits',
  'home-garden':  'Refresh Your Home',
  appliances:     'Big-Ticket Appliances',
  groceries:      'Trini Pantry',
}

const REAL_PHOTOS = { NOT: { images: { contains: '/api/product-img' } } } as const

async function getCategoriesWithSamples() {
  const cats = await prisma.category.findMany({
    where: { products: { some: { status: 'ACTIVE' } } },
    include: {
      _count: { select: { products: { where: { status: 'ACTIVE' } } } },
      products: {
        where: { status: 'ACTIVE', ...REAL_PHOTOS },
        orderBy: [{ soldCount: 'desc' }, { createdAt: 'desc' }],
        take: 8,
        select: { id: true, slug: true, name: true, images: true },
      },
    },
  })
  return cats
    .sort((a, b) => b._count.products - a._count.products)
    .slice(0, 12)
    .map((c) => ({ ...c, products: c.products.slice(0, 4) }))
}

async function getTrendingProducts() {
  // "Trending" = highest soldCount among ACTIVE products with real
  // photos. Falls back to featured if soldCount is all-zero (seed data
  // bootstrap).
  return prisma.product.findMany({
    where: { status: 'ACTIVE', ...REAL_PHOTOS },
    take: 12,
    include: {
      category: { select: { name: true, slug: true } },
      vendor:   { select: { storeName: true, slug: true } },
    },
    orderBy: [{ soldCount: 'desc' }, { featured: 'desc' }, { rating: 'desc' }],
  })
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { status: 'ACTIVE', featured: true, ...REAL_PHOTOS },
    take: 12,
    include: {
      category: { select: { name: true, slug: true } },
      vendor:   { select: { storeName: true, slug: true } },
    },
    orderBy: { soldCount: 'desc' },
  })
}

async function getDealsProducts() {
  const rows = await prisma.product.findMany({
    where: { status: 'ACTIVE', comparePrice: { not: null, gt: 0 }, ...REAL_PHOTOS },
    take: 50,
    include: {
      category: { select: { name: true, slug: true } },
      vendor:   { select: { storeName: true, slug: true } },
    },
  })
  return rows
    .filter((p) => (p.comparePrice ?? 0) > p.price)
    .sort((a, b) => (b.comparePrice! - b.price) - (a.comparePrice! - a.price))
    .slice(0, 12)
}

async function getNewArrivals() {
  return prisma.product.findMany({
    where: { status: 'ACTIVE', ...REAL_PHOTOS },
    take: 12,
    include: {
      category: { select: { name: true, slug: true } },
      vendor:   { select: { storeName: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

async function getFeaturedVendors() {
  return prisma.vendor.findMany({
    where: { status: 'APPROVED' },
    take: 6,
    orderBy: { totalSales: 'desc' },
    include: { _count: { select: { products: true } } },
  })
}

async function getAllVendorsForMarquee() {
  // Used for the always-on vendor logo strip — pulls every approved
  // vendor and lets the marquee handle wrapping.
  return prisma.vendor.findMany({
    where: { status: 'APPROVED' },
    select: { storeName: true, slug: true, logo: true },
    orderBy: { storeName: 'asc' },
  })
}

async function getFeaturedDigitalProducts() {
  return prisma.digitalProduct.findMany({
    where: { isActive: true, featured: true },
    take: 6,
    orderBy: { soldCount: 'desc' },
  })
}

const HERO_PILLS: { icon: LucideIcon; color: string; label: string; href: string }[] = [
  { icon: Sparkles, color: '#FF6B35', label: 'Carnival',      href: '/products?category=carnival' },
  { icon: Zap,      color: '#4A9EFF', label: 'Electronics',   href: '/products?category=electronics' },
  { icon: Flame,    color: '#C9A84C', label: 'Streetwear',    href: '/products?category=urban-fashion' },
  { icon: Wine,     color: '#B8860B', label: 'Rum & Spirits', href: '/products?category=rum-spirits' },
  { icon: Home,     color: '#4CAF82', label: 'Home & Garden', href: '/products?category=home-garden' },
  { icon: Gamepad2, color: '#7EC8E3', label: 'Toys & Kids',   href: '/products?category=toys' },
]

export default async function HomePage() {
  const [categories, trending, featured, deals, newArrivals, vendors, allVendors, digitalProducts] =
    await Promise.all([
      getCategoriesWithSamples(),
      getTrendingProducts(),
      getFeaturedProducts(),
      getDealsProducts(),
      getNewArrivals(),
      getFeaturedVendors(),
      getAllVendorsForMarquee(),
      getFeaturedDigitalProducts(),
    ])

  const band1 = categories.slice(0, 4)
  const band2 = categories.slice(4, 8)
  const band3 = categories.slice(8, 12)

  // Top 5 trending products feed the auto-rotating spotlight tile.
  const spotlightItems = trending.slice(0, 5)

  return (
    <div className="space-y-10 md:space-y-14 pb-16">
      {/* PROMO TICKER — animated, infinite-scroll lower-third strip */}
      <PromoTicker />

      {/* HERO — bigger and livelier. Drifting radial glow + pulse dot
          on the eyebrow + product spotlight card on the right + a
          field of twinkling sparkles to make the dark background feel
          alive instead of flat. */}
      <section className="relative bg-gradient-to-br from-[var(--bg-primary)] via-[#1A0A0A] to-[var(--bg-primary)] border-b border-[#C9A84C]/15 overflow-hidden -mt-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-[700px] h-[400px] bg-[#C9A84C]/8 rounded-full blur-3xl ziptt-drift" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[#D62828]/6 rounded-full blur-3xl ziptt-drift" style={{ animationDelay: '-9s' }} />
          {/* Twinkling sparkles. Each one gets a hand-tuned position +
              animation-delay so they fire out of sync. */}
          {[
            { top: '12%', left: '8%',  delay: '0s'   },
            { top: '20%', left: '32%', delay: '0.8s' },
            { top: '48%', left: '12%', delay: '1.5s' },
            { top: '68%', left: '24%', delay: '2.2s' },
            { top: '14%', left: '54%', delay: '0.4s' },
            { top: '38%', left: '46%', delay: '3.1s' },
            { top: '78%', left: '40%', delay: '1.1s' },
            { top: '8%',  left: '72%', delay: '2.8s' },
            { top: '32%', left: '88%', delay: '1.8s' },
            { top: '58%', left: '64%', delay: '0.6s' },
            { top: '82%', left: '78%', delay: '3.4s' },
            { top: '24%', left: '94%', delay: '2.4s' },
          ].map((s, i) => (
            <span key={i} className="ziptt-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-bold px-3 py-1.5 rounded-full tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] ziptt-pulse-gold" />
                Trinidad &amp; Tobago&apos;s #1 Marketplace
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-[1.05] text-[var(--text-primary)]">
                Shop Local.<br />
                <span className="gold-shimmer">Ship Fast.</span><br />
                Live Good.
              </h1>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-lg">
                Thousands of products from local vendors — shadow beni to Samsung phones.
                Free delivery on orders over TTD $500.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link href="/products" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-full text-sm shadow-lg shadow-[#C9A84C]/20">
                  Browse all <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/vendor/register" className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-full text-sm">
                  Sell on zip.tt
                </Link>
              </div>
              {/* Hero category pills — bigger, more colorful, snap below
                  the headline so they feel like a featured strip. */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3">
                {HERO_PILLS.map((p) => {
                  const Icon = p.icon
                  return (
                    <Link
                      key={p.href}
                      href={p.href}
                      className="bg-[var(--bg-secondary)]/70 hover:bg-[var(--bg-card)] border border-[#C9A84C]/15 hover:border-[#C9A84C]/45 rounded-xl py-2 px-2 text-center ziptt-lift group"
                    >
                      <div className="flex items-center justify-center mb-1">
                        <span
                          className="h-8 w-8 rounded-full bg-[var(--bg-primary)]/40 border border-white/10 flex items-center justify-center"
                          style={{ color: p.color }}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-[var(--text-primary)] group-hover:text-[#C9A84C] transition-colors">{p.label}</div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Auto-rotating spotlight: cycles through the top 5
                trending SKUs every 4s, pauses on hover. */}
            <HeroSpotlight items={spotlightItems} />
          </div>
        </div>
      </section>

      {/* TRENDING NOW rail — top sellers across the whole catalog,
          flagged with a pulsing red dot in the heading. */}
      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[#D62828] ziptt-pulse-red" />
                <span className="text-[11px] font-black tracking-[2.5px] text-[#D62828]">TRENDING NOW</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-[#C9A84C]" />
                Hot off the shelves
              </h2>
            </div>
            <Link href="/products?sort=popular" className="text-sm text-[#C9A84C] hover:text-[#F0C040] font-medium flex items-center gap-1 transition-colors shrink-0">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto scrollbar-thin -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-2">
            <div className="flex gap-4 snap-x snap-mandatory">
              {trending.map((p) => (
                <div key={p.id} className="snap-start shrink-0 w-[180px] sm:w-[200px] md:w-[220px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="ziptt-divider max-w-5xl mx-auto" />

      {/* CATEGORY QUAD CARDS — band 1 with category-coloured top accents */}
      {band1.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Crown className="h-5 w-5 text-[#C9A84C]" />
              Shop by Category
            </h2>
            <Link href="/products" className="text-sm text-[#C9A84C] hover:text-[#F0C040] font-medium flex items-center gap-1 transition-colors">
              All categories <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {band1.map((c) => (
              <CategoryQuadCard
                key={c.id}
                title={CATEGORY_LABEL[c.slug] ?? c.name}
                href={`/products?category=${c.slug}`}
                cta="Shop now"
                products={c.products}
                accent={CATEGORY_COLOR[c.slug]}
              />
            ))}
          </div>
        </section>
      )}

      {/* PRODUCT RAIL — Featured */}
      <ProductRail
        title="Featured Products"
        subtitle="Handpicked by our team"
        href="/products?sort=featured"
        products={featured}
      />

      {/* MID-PAGE PROMO BANNER — full-bleed diagonal-stripe poster
          look. Big copy, double CTA, plenty of contrast. */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[var(--bg-primary)] via-[#1A0A0A] to-[var(--bg-primary)] border-y border-[#C9A84C]/20">
        <div className="absolute inset-0 ziptt-stripes pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#D62828]/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[#D62828] text-xs font-black tracking-[2px]">
                <Clock className="h-3.5 w-3.5" /> CARNIVAL SEASON
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] leading-tight">
                Get <span className="gold-shimmer">Carnival-ready</span> in days, not weeks.
              </h2>
              <p className="text-sm md:text-base text-[var(--text-secondary)]">
                Costumes, mas boots, body glitter, makeup kits — local vendors, nationwide delivery.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/products?category=carnival" className="btn-primary px-6 py-3 rounded-full text-sm flex items-center gap-2 shadow-lg shadow-[#C9A84C]/25">
                Shop Carnival <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/products?category=rum-spirits" className="btn-secondary px-6 py-3 rounded-full text-sm">
                Caribbean spirits
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY QUAD CARDS — band 2 */}
      {band2.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {band2.map((c) => (
              <CategoryQuadCard
                key={c.id}
                title={CATEGORY_LABEL[c.slug] ?? c.name}
                href={`/products?category=${c.slug}`}
                cta="See more"
                products={c.products}
                accent={CATEGORY_COLOR[c.slug]}
              />
            ))}
          </div>
        </section>
      )}

      {/* DEALS rail with savings eyebrow */}
      {deals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <Tag className="h-3.5 w-3.5 text-[#D62828]" />
                <span className="text-[11px] font-black tracking-[2.5px] text-[#D62828]">TODAY&apos;S DEALS</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">Biggest savings on zip.tt</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">Sorted by absolute TTD discount — limited time</p>
            </div>
            <Link href="/products?sort=newest" className="text-sm text-[#C9A84C] hover:text-[#F0C040] font-medium flex items-center gap-1 transition-colors shrink-0">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto scrollbar-thin -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-2">
            <div className="flex gap-4 snap-x snap-mandatory">
              {deals.map((p) => (
                <div key={p.id} className="snap-start shrink-0 w-[180px] sm:w-[200px] md:w-[220px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORY QUAD CARDS — band 3 */}
      {band3.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {band3.map((c) => (
              <CategoryQuadCard
                key={c.id}
                title={CATEGORY_LABEL[c.slug] ?? c.name}
                href={`/products?category=${c.slug}`}
                cta="Browse"
                products={c.products}
                accent={CATEGORY_COLOR[c.slug]}
              />
            ))}
          </div>
        </section>
      )}

      {/* NEW ARRIVALS rail */}
      <ProductRail
        title="New Arrivals"
        subtitle="Just landed on zip.tt"
        href="/products?sort=newest"
        products={newArrivals}
      />

      {/* FEATURED VENDORS */}
      {vendors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Featured Vendors</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">Top-rated local stores</p>
            </div>
            <Link href="/vendors" className="text-sm text-[#C9A84C] hover:text-[#F0C040] font-medium flex items-center gap-1 transition-colors">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <Link key={vendor.id} href={`/store/${vendor.slug}`}
                className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-xl group p-4 flex items-center gap-3 hover:border-[#C9A84C]/45 ziptt-lift">
                <div className="h-12 w-12 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center shrink-0 overflow-hidden">
                  {vendor.logo ? (
                    <img src={vendor.logo} alt={vendor.storeName} className="h-12 w-12 object-cover rounded-full" />
                  ) : (
                    <Store className="h-5 w-5 text-[#C9A84C]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#C9A84C] transition-colors truncate">{vendor.storeName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-[#F0C040] text-[#F0C040]" />
                    <span className="text-xs text-[var(--text-secondary)]">{vendor.rating.toFixed(1)} &middot; {vendor._count.products} products</span>
                  </div>
                  {vendor.region && (
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate flex items-center gap-1">
                      <MapPin size={10} strokeWidth={1.5} />{vendor.region}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[#C9A84C] shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* VENDOR LOGO STRIP — always-on horizontal marquee of every
          approved vendor. Reads as a Times-Square ribbon under the
          spotlit "Featured Vendors" grid. */}
      <VendorMarquee vendors={allVendors} />

      {/* DIGITAL PRODUCTS */}
      {digitalProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[#C9A84C] ziptt-pulse-gold" />
                <span className="text-[11px] font-black tracking-[2.5px] text-[#C9A84C]">INSTANT DELIVERY</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Digital Products</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">Netflix, Spotify, ChatGPT &amp; more — paid in TTD</p>
            </div>
            <Link href="/digital" className="text-sm text-[#C9A84C] hover:text-[#F0C040] font-medium flex items-center gap-1 transition-colors">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {digitalProducts.map((dp) => (
              <Link key={dp.id} href={`/digital/${dp.slug}`}
                className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-xl overflow-hidden hover:border-[#C9A84C]/45 ziptt-lift group">
                <div className="aspect-square bg-[var(--bg-card)] relative">
                  {dp.thumbnail && <img src={dp.thumbnail} alt={dp.name} className="w-full h-full object-cover" />}
                  <span className="absolute top-2 left-2 bg-[#C9A84C] text-black text-[10px] font-bold px-2 py-0.5 rounded">INSTANT</span>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#C9A84C] line-clamp-2 mb-1 transition-colors">{dp.name}</p>
                  <p className="text-sm text-[#C9A84C] font-bold">{formatTTD(dp.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* VENDOR CTA */}
      <section className="bg-gradient-to-r from-[var(--bg-primary)] via-[#1A0A0A] to-[var(--bg-primary)] border-t border-b border-[#C9A84C]/15 relative overflow-hidden">
        <div className="absolute inset-0 ziptt-stripes opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center">
              <Store className="h-10 w-10 text-[#C9A84C]" strokeWidth={1.2} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">Start selling on <span className="gold-shimmer">zip.tt</span> today</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
              Join hundreds of Trinbagonian vendors reaching customers across Trinidad.
              Only 10% commission. Weekly payouts. Free to list.
            </p>
            <Link href="/vendor/register"
              className="inline-flex items-center gap-2 btn-primary font-bold px-7 py-3 rounded-full mt-1 text-sm shadow-lg shadow-[#C9A84C]/25">
              Become a Vendor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
