'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { ProductCard } from './ProductCard'

interface Product {
  id: string; name: string; slug: string; price: number; comparePrice?: number | null
  images: string | string[]; rating: number; reviewCount: number; stock: number
  vendorId: string; vendor: { storeName: string; slug: string }
  category: { name: string; slug: string }
}

interface ProductGridProps {
  products: Product[]
  total: number
  pages: number
  currentPage: number
  searchParams: Record<string, string | undefined>
}

export function ProductGrid({ products, total, pages, currentPage, searchParams }: ProductGridProps) {
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([k, v]) => { if (v) params.set(k, v) })
    params.set('page', page.toString())
    return `/products?${params.toString()}`
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="flex items-center justify-center mb-4">
          <Search size={48} className="text-gray-300" strokeWidth={1.2} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No products found</h2>
        <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
        <Link href="/products" className="btn-primary">Browse All Products</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {currentPage > 1 && (
            <Link href={buildPageUrl(currentPage - 1)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
            const page = i + 1
            return (
              <Link key={page} href={buildPageUrl(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage ? 'bg-[#D62828] text-white' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}>
                {page}
              </Link>
            )
          })}
          {currentPage < pages && (
            <Link href={buildPageUrl(currentPage + 1)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
