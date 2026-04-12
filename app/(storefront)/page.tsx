import Link from 'next/link'
import { ArrowRight, Star, Truck, Shield, HeadphonesIcon, CreditCard, Store } from 'lucide-react'
import prisma from '@/lib/prisma'
import { ProductCard } from '@/components/storefront/ProductCard'
import { formatTTD } from '@/lib/utils'

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { status: 'ACTIVE', featured: true },
    take: 8,
    include: {
      category: { select: { name: true, slug: true } },
      vendor: { select: { storeName: true, slug: true } },
    },
    orderBy: { soldCount: 'desc' },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    take: 10,
    orderBy: { name: 'asc' },
  })
}

async function getFeaturedVendors() {
  return prisma.vendor.findMany({
    where: { status: 'APPROVED' },
    take: 6,
    orderBy: { totalSales: 'desc' },
    include: {
      _count: { select: { products: true } },
    },
  })
}

async function getFeaturedDigitalProducts() {
  return prisma.digitalProduct.findMany({
    where: { isActive: true, featured: true },
    take: 6,
    orderBy: { soldCount: 'desc' },
  })
}

export default async function HomePage() {
  const [featured, categories, vendors, digitalProducts] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getFeaturedVendors(),
    getFeaturedDigitalProducts(),
  ])

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#0A0A0A] border-b border-[#C9A84C]/15">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C9A84C]/4 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide">
                🇹🇹 Trinidad & Tobago&apos;s #1 Marketplace
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight text-[#F5F0E8]">
                Shop Local.<br />
                <span className="gold-shimmer">Ship Fast.</span><br />
                Live Good.
              </h1>
              <p className="text-base text-[#9A8F7A] leading-relaxed max-w-md">
                Discover thousands of products from local vendors — from shadow beni to Samsung phones.
                Free delivery on orders over TTD $500.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-full">
                  Browse All Products <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/vendor/register" className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-full">
                  Sell on zip.tt
                </Link>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3">
              {[
                { emoji: '📱', label: 'Electronics', href: '/products?category=electronics' },
                { emoji: '🏠', label: 'Home & Garden', href: '/products?category=home-garden' },
                { emoji: '🎭', label: 'Carnival', href: '/products?category=carnival' },
                { emoji: '🧢', label: 'Streetwear', href: '/products?category=urban-fashion' },
                { emoji: '🧸', label: 'Toys', href: '/products?category=toys' },
                { emoji: '🥃', label: 'Rum & Spirits', href: '/products?category=rum-spirits' },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="bg-[#C9A84C]/8 hover:bg-[#C9A84C]/15 border border-[#C9A84C]/15 hover:border-[#C9A84C]/35 backdrop-blur-sm rounded-2xl p-5 text-center transition-all group">
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="text-sm font-semibold text-[#F5F0E8] group-hover:text-[#C9A84C] transition-colors">{item.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: 'Nationwide Delivery', desc: 'Trinidad & Tobago' },
            { icon: Shield, title: 'Secure Shopping', desc: 'Buyer protection' },
            { icon: CreditCard, title: 'Cash on Delivery', desc: 'Pay when you receive' },
            { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Zip AI assistant' },
          ].map((item) => (
            <div key={item.title} className="card p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20">
                <item.icon className="h-5 w-5 text-[#C9A84C]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F5F0E8]">{item.title}</p>
                <p className="text-xs text-[#9A8F7A]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#F5F0E8]">Shop by Category</h2>
          <Link href="/products" className="text-sm text-[#C9A84C] hover:text-[#F0C040] font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-square bg-[#111111] hover:scale-[1.02] transition-transform border border-[#C9A84C]/10 hover:border-[#C9A84C]/30">
              {cat.image && (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60 group-hover:opacity-75" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-2xl mb-0.5">{cat.icon}</div>
                <div className="text-sm font-semibold text-[#F5F0E8] group-hover:text-[#C9A84C] transition-colors">{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#F5F0E8]">Featured Products</h2>
            <p className="text-sm text-[#9A8F7A] mt-0.5">Handpicked by our team 🇹🇹</p>
          </div>
          <Link href="/products?sort=featured" className="text-sm text-[#C9A84C] hover:text-[#F0C040] font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Featured Vendors */}
      {vendors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#F5F0E8]">Featured Vendors</h2>
              <p className="text-sm text-[#9A8F7A] mt-0.5">Top stores on zip.tt</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendors.map((vendor) => (
              <Link key={vendor.id} href={`/store/${vendor.slug}`}
                className="card group p-5 flex items-center gap-4 hover:border-[#C9A84C]/40 transition-all">
                <div className="h-14 w-14 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center shrink-0 overflow-hidden">
                  {vendor.logo ? (
                    <img src={vendor.logo} alt={vendor.storeName} className="h-14 w-14 object-cover rounded-full" />
                  ) : (
                    <Store className="h-6 w-6 text-[#C9A84C]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#F5F0E8] group-hover:text-[#C9A84C] transition-colors truncate">{vendor.storeName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-[#F0C040] text-[#F0C040]" />
                    <span className="text-xs text-[#9A8F7A]">{vendor.rating.toFixed(1)} · {vendor._count.products} products</span>
                  </div>
                  {vendor.region && (
                    <p className="text-xs text-[#9A8F7A] mt-0.5 truncate">📍 {vendor.region}</p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-[#9A8F7A] group-hover:text-[#C9A84C] shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Digital Products Section */}
      {digitalProducts.length > 0 && (
        <section style={{ padding: '60px 0', borderTop: '1px solid #1A1A1A' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '32px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#C9A84C', marginBottom: '8px', letterSpacing: '2px' }}>⚡ INSTANT DELIVERY</div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: '#F5F0E8' }}>Digital Products</h2>
                <p style={{ color: '#9A8F7A', marginTop: '8px' }}>Netflix, Spotify, ChatGPT & more — paid in TTD</p>
              </div>
              <a href="/digital" style={{ color: '#C9A84C', textDecoration: 'none', fontSize: '14px' }}>See all →</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {digitalProducts.map((dp) => (
                <a key={dp.id} href={`/digital/${dp.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '120px', background: '#1A1A1A', position: 'relative' }}>
                      {dp.thumbnail && <img src={dp.thumbnail} alt={dp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#C9A84C', color: '#0A0A0A', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '3px' }}>⚡</span>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.3', color: '#F5F0E8' }}>{dp.name}</p>
                      <p style={{ fontSize: '15px', color: '#C9A84C', fontWeight: 'bold' }}>${dp.price.toFixed(2)} <span style={{ fontSize: '11px', color: '#9A8F7A' }}>TTD</span></p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vendor CTA Banner */}
      <section className="bg-gradient-to-r from-[#0A0A0A] via-[#111111] to-[#0A0A0A] border-t border-b border-[#C9A84C]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center space-y-4">
            <div className="text-4xl">🏪</div>
            <h2 className="text-3xl font-bold text-[#F5F0E8]">Start Selling on zip.tt Today</h2>
            <p className="text-[#9A8F7A] max-w-xl mx-auto">
              Join hundreds of Trinbagonian vendors reaching customers across Trinidad.
              Only 10% commission. Weekly payouts. Free to list.
            </p>
            <Link href="/vendor/register"
              className="inline-flex items-center gap-2 btn-primary font-bold px-8 py-3 rounded-full mt-2">
              Become a Vendor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
