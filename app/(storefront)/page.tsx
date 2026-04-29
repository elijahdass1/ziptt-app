// Homepage information architecture inspired by Amazon: a hero, then
// alternating bands of category quad-cards (4-up grids of small cards
// that show 4 product thumbs each) and horizontal product rails. The
// dense layout gives visitors many entry points into the catalog
// instead of forcing them through search/category nav alone.
//
// We pick the categories to surface based on which buckets actually
// have inventory (sorted by ACTIVE product count desc). Featured /
// new arrivals / deals are ordered server-side and rendered as rails.
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import {
  ArrowRight, Star, Truck, Shield, HeadphonesIcon, CreditCard, Store, MapPin,
  Zap, Home, Sparkles, Flame, Gamepad2, Wine, Shirt, Plug, ShoppingBasket,
  type LucideIcon,
} from 'lucide-react'
import prisma from '@/lib/prisma'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ProductRail } from '@/components/storefront/ProductRail'
import { CategoryQuadCard } from '@/components/storefront/CategoryQuadCard'
import { formatTTD } from '@/lib/utils'

// Slug → Lucide icon for the small bullet-icons we render next to each
// category quad title (the actual quad uses real product photos, but
// the icon ties the card to the rest of the gold-on-black design).
const CATEGORY_ICON: Record<string, LucideIcon> = {
  electronics:    Zap,
  fashion:        Shirt,
  'urban-fashion': Flame,
  carnival:       Sparkles,
  toys:           Gamepad2,
  'rum-spirits':  Wine,
  'home-garden':  Home,
  appliances:     Plug,
  groceries:      ShoppingBasket,
}

// Friendly headline labels — DB Category.name reads a bit catalog-y
// ("Toys, Games & Kids", "Urban Fashion & Streetwear"). Where we have a
// punchier public label we use it; otherwise we fall back to .name.
const CATEGORY_LABEL: Record<string, string> = {
  electronics:    'Latest Electronics',
  fashion:        'Fashion You’ll Love',
  'urban-fashion': 'Streetwear Drops',
  carnival:       'Carnival Ready',
  toys:           'Toys & Kids',
  'rum-spirits':  'Caribbean Spirits',
  'home-garden':  'Refresh Your Home',
  appliances:     'Big-Ticket Appliances',
  groceries:      'Trini Pantry',
}

async function getCategoriesWithSamples() {
  // Fetch categories with at least one ACTIVE product, plus 4 thumb
  // products each (highest soldCount first so the quad shows the
  // category's bestsellers).
  const cats = await prisma.category.findMany({
    where: { products: { some: { status: 'ACTIVE' } } },
    include: {
      _count: { select: { products: { where: { status: 'ACTIVE' } } } },
      products: {
        where: { status: 'ACTIVE' },
        orderBy: [{ soldCount: 'desc' }, { createdAt: 'desc' }],
        take: 4,
        select: { id: true, slug: true, name: true, images: true },
      },
    },
  })
  return cats
    .sort((a, b) => b._count.products - a._count.products)
    .slice(0, 12)
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { status: 'ACTIVE', featured: true },
    take: 12,
    include: {
      category: { select: { name: true, slug: true } },
      vendor:   { select: { storeName: true, slug: true } },
    },
    orderBy: { soldCount: 'desc' },
  })
}

async function getDealsProducts() {
  // "Deals" = anything with a comparePrice higher than current price.
  // Sorted by largest absolute saving so the most striking discounts
  // surface first.
  const rows = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      comparePrice: { not: null, gt: 0 },
    },
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
    where: { status: 'ACTIVE' },
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
  const [categories, featured, deals, newArrivals, vendors, digitalProducts] =
    await Promise.all([
      getCategoriesWithSamples(),
      getFeaturedProducts(),
      getDealsProducts(),
      getNewArrivals(),
      getFeaturedVendors(),
      getFeaturedDigitalProducts(),
    ])

  // Split categories into bands of 4 so we can interleave them with
  // product rails (Amazon's pattern: card row, scroll row, card row).
  const band1 = categories.slice(0, 4)
  const band2 = categories.slice(4, 8)
  const band3 = categories.slice(8, 12)

  return (
    <div className="space-y-8 md:space-y-10 pb-16">
      {/* HERO — compact promo strip with category quick-pills.
          We deliberately keep the hero short so the card grid below is
          visible above the fold on most screens. */}
      <section className="relative bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#0A0A0A] border-b border-[#C9A84C]/15">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#C9A84C]/4 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
                Trinidad &amp; Tobago&apos;s #1 Marketplace
              </div>
              <h1 className="text-3xl md:text-4xl font-black leading-tight text-[#F5F0E8]">
                Shop Local. <span className="gold-shimmer">Ship Fast.</span> Live Good.
              </h1>
              <p className="text-sm text-[#9A8F7A] leading-relaxed max-w-xl">
                Thousands of products from local vendors — shadow beni to Samsung phones.
                Free delivery on orders over TTD $500.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/products" className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-full text-sm">
                  Browse all <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/vendor/register" className="btn-secondary flex items-center gap-2 px-5 py-2.5 rounded-full text-sm">
                  Sell on zip.tt
                </Link>
              </div>
            </div>
            {/* Hero category pills — at-a-glance entry points to the
                top categories. Smaller than the big quads below so the
                card grid still owns most of the screen. */}
            <div className="grid grid-cols-3 gap-2 md:w-[420px] shrink-0">
              {HERO_PILLS.map((p) => {
                const Icon = p.icon
                return (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="bg-[#C9A84C]/8 hover:bg-[#C9A84C]/15 border border-[#C9A84C]/15 hover:border-[#C9A84C]/35 rounded-xl p-3 text-center transition-all group"
                  >
                    <div className="flex items-center justify-center mb-1">
                      <span
                        className="h-9 w-9 rounded-full bg-[#0A0A0A]/40 border border-white/10 flex items-center justify-center"
                        style={{ color: p.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#F5F0E8] group-hover:text-[#C9A84C] transition-colors">{p.label}</div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES — compact strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Truck, title: 'Nationwide Delivery', desc: 'Trinidad & Tobago' },
            { icon: Shield, title: 'Secure Shopping', desc: 'Buyer protection' },
            { icon: CreditCard, title: 'Cash on Delivery', desc: 'Pay when you receive' },
            { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Zip AI assistant' },
          ].map((item) => (
            <div key={item.title} className="bg-[#111111] border border-[#C9A84C]/10 rounded-lg p-3 flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 shrink-0">
                <item.icon className="h-4 w-4 text-[#C9A84C]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F5F0E8] truncate">{item.title}</p>
                <p className="text-[11px] text-[#9A8F7A] truncate">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY QUAD CARDS — band 1 (top 4 categories by inventory) */}
      {band1.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {band1.map((c) => (
              <CategoryQuadCard
                key={c.id}
                title={CATEGORY_LABEL[c.slug] ?? c.name}
                href={`/products?category=${c.slug}`}
                cta="Shop now"
                products={c.products}
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
              />
            ))}
          </div>
        </section>
      )}

      {/* PRODUCT RAIL — Deals */}
      {deals.length > 0 && (
        <ProductRail
          title="Today’s Best Deals"
          subtitle="Biggest savings across the catalog"
          href="/products?sort=newest"
          products={deals}
        />
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
              />
            ))}
          </div>
        </section>
      )}

      {/* PRODUCT RAIL — New arrivals */}
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
              <h2 className="text-xl md:text-2xl font-bold text-[#F5F0E8]">Featured Vendors</h2>
              <p className="text-sm text-[#9A8F7A] mt-0.5">Top stores on zip.tt</p>
            </div>
            <Link href="/vendors" className="text-sm text-[#C9A84C] hover:text-[#F0C040] font-medium flex items-center gap-1 transition-colors">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <Link key={vendor.id} href={`/store/${vendor.slug}`}
                className="bg-[#111111] border border-[#C9A84C]/15 rounded-lg group p-4 flex items-center gap-3 hover:border-[#C9A84C]/40 transition-all">
                <div className="h-12 w-12 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center shrink-0 overflow-hidden">
                  {vendor.logo ? (
                    <img src={vendor.logo} alt={vendor.storeName} className="h-12 w-12 object-cover rounded-full" />
                  ) : (
                    <Store className="h-5 w-5 text-[#C9A84C]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F5F0E8] group-hover:text-[#C9A84C] transition-colors truncate">{vendor.storeName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-[#F0C040] text-[#F0C040]" />
                    <span className="text-xs text-[#9A8F7A]">{vendor.rating.toFixed(1)} &middot; {vendor._count.products} products</span>
                  </div>
                  {vendor.region && (
                    <p className="text-[11px] text-[#9A8F7A] mt-0.5 truncate flex items-center gap-1">
                      <MapPin size={10} strokeWidth={1.5} />{vendor.region}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-[#9A8F7A] group-hover:text-[#C9A84C] shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* DIGITAL PRODUCTS — instant delivery section */}
      {digitalProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-xs text-[#C9A84C] tracking-[2px] mb-1">INSTANT DELIVERY</p>
              <h2 className="text-xl md:text-2xl font-bold text-[#F5F0E8]">Digital Products</h2>
              <p className="text-sm text-[#9A8F7A] mt-0.5">Netflix, Spotify, ChatGPT &amp; more — paid in TTD</p>
            </div>
            <Link href="/digital" className="text-sm text-[#C9A84C] hover:text-[#F0C040] font-medium flex items-center gap-1 transition-colors">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {digitalProducts.map((dp) => (
              <Link key={dp.id} href={`/digital/${dp.slug}`}
                className="bg-[#111111] border border-[#C9A84C]/15 rounded-lg overflow-hidden hover:border-[#C9A84C]/40 transition-all group">
                <div className="aspect-square bg-[#1A1A1A] relative">
                  {dp.thumbnail && <img src={dp.thumbnail} alt={dp.name} className="w-full h-full object-cover" />}
                  <span className="absolute top-2 left-2 bg-[#C9A84C] text-[#0A0A0A] text-[10px] font-bold px-2 py-0.5 rounded">INSTANT</span>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-[#F5F0E8] group-hover:text-[#C9A84C] line-clamp-2 mb-1 transition-colors">{dp.name}</p>
                  <p className="text-sm text-[#C9A84C] font-bold">{formatTTD(dp.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* VENDOR CTA */}
      <section className="bg-gradient-to-r from-[#0A0A0A] via-[#111111] to-[#0A0A0A] border-t border-b border-[#C9A84C]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center">
              <Store className="h-9 w-9 text-[#C9A84C]" strokeWidth={1.2} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#F5F0E8]">Start Selling on zip.tt Today</h2>
            <p className="text-sm text-[#9A8F7A] max-w-xl mx-auto">
              Join hundreds of Trinbagonian vendors reaching customers across Trinidad.
              Only 10% commission. Weekly payouts. Free to list.
            </p>
            <Link href="/vendor/register"
              className="inline-flex items-center gap-2 btn-primary font-bold px-7 py-2.5 rounded-full mt-1 text-sm">
              Become a Vendor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
