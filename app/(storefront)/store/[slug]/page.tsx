import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, MapPin, Package, ShoppingBag, ArrowLeft, Store } from 'lucide-react'
import prisma from '@/lib/prisma'
import { ProductCard } from '@/components/storefront/ProductCard'

interface PageProps {
  params: { slug: string }
}

async function getVendor(slug: string) {
  return prisma.vendor.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: 'ACTIVE' },
        include: {
          category: { select: { name: true, slug: true } },
          vendor: { select: { storeName: true, slug: true } },
        },
        orderBy: [{ featured: 'desc' }, { soldCount: 'desc' }],
      },
    },
  })
}

export default async function VendorStorePage({ params }: PageProps) {
  const vendor = await getVendor(params.slug)
  if (!vendor) notFound()

  const totalProducts = vendor.products.length

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-56 md:h-72 overflow-hidden bg-[#0A0A0A]">
        {vendor.banner ? (
          <img src={vendor.banner} alt="" className="w-full h-full object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#111111] to-[#0A0A0A]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-[#9A8F7A] hover:text-[#C9A84C] transition-colors bg-black/40 px-3 py-1.5 rounded-full">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        </div>
        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent" />
      </div>

      {/* Vendor Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-8">
          {/* Logo */}
          <div className="h-24 w-24 rounded-2xl bg-[#111111] border-2 border-[#C9A84C]/40 flex items-center justify-center overflow-hidden shadow-xl shrink-0">
            {vendor.logo ? (
              <img src={vendor.logo} alt={vendor.storeName} className="h-24 w-24 object-cover rounded-2xl" />
            ) : (
              <Store className="h-10 w-10 text-[#C9A84C]" />
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-2xl md:text-3xl font-black text-[#F5F0E8]">{vendor.storeName}</h1>
            {vendor.description && (
              <p className="text-sm text-[#9A8F7A] mt-1 max-w-xl leading-relaxed">{vendor.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-[#F0C040] text-[#F0C040]" />
                <span className="text-sm font-semibold text-[#F5F0E8]">{vendor.rating.toFixed(1)}</span>
                <span className="text-xs text-[#9A8F7A]">rating</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#9A8F7A]">
                <Package className="h-3.5 w-3.5" />
                {totalProducts} products
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#9A8F7A]">
                <ShoppingBag className="h-3.5 w-3.5" />
                {vendor.totalSales}+ sales
              </div>
              {vendor.region && (
                <div className="flex items-center gap-1.5 text-xs text-[#9A8F7A]">
                  <MapPin className="h-3.5 w-3.5" />
                  {vendor.region}
                </div>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div className="shrink-0">
            <div className="flex items-center gap-1.5 bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
              Verified Vendor
            </div>
          </div>
        </div>

        {/* Products */}
        {totalProducts === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-[#F5F0E8] mb-1">No products yet</h3>
            <p className="text-sm text-[#9A8F7A]">This vendor hasn&apos;t listed any products yet.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#F5F0E8]">All Products <span className="text-[#9A8F7A] font-normal text-sm">({totalProducts})</span></h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {vendor.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
