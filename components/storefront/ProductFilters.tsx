'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface Category { id: string; name: string; slug: string }
interface Vendor   { storeName: string; slug: string }

interface ProductFiltersProps {
  categories: Category[]
  vendors:    Vendor[]
  searchParams: { q?: string; category?: string; vendor?: string; minPrice?: string; maxPrice?: string; sort?: string }
}

export function ProductFilters({ categories, vendors, searchParams }: ProductFiltersProps) {
  const router = useRouter()

  const buildParams = useCallback((overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    if (searchParams.q)        p.set('q',        searchParams.q)
    if (searchParams.category) p.set('category', searchParams.category)
    if (searchParams.vendor)   p.set('vendor',   searchParams.vendor)
    if (searchParams.minPrice) p.set('minPrice', searchParams.minPrice)
    if (searchParams.maxPrice) p.set('maxPrice', searchParams.maxPrice)
    if (searchParams.sort)     p.set('sort',     searchParams.sort)
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    p.delete('page')
    return `/products?${p.toString()}`
  }, [searchParams])

  const hasFilters = searchParams.category || searchParams.vendor || searchParams.minPrice || searchParams.maxPrice

  return (
    <div className="space-y-5">
      {hasFilters && (
        <button
          onClick={() => {
            const p = new URLSearchParams()
            if (searchParams.q) p.set('q', searchParams.q)
            router.push(`/products?${p.toString()}`)
          }}
          className="text-xs text-[#C9A84C] hover:underline font-medium"
        >
          ✕ Clear all filters
        </button>
      )}

      {/* Sort */}
      <div>
        <h3 className="text-xs font-semibold text-[#9A8F7A] uppercase tracking-widest mb-2">Sort By</h3>
        <div className="space-y-0.5">
          {[
            { value: 'featured',   label: 'Featured' },
            { value: 'popular',    label: 'Most Popular' },
            { value: 'newest',     label: 'Newest' },
            { value: 'rating',     label: 'Top Rated' },
            { value: 'price-asc',  label: 'Price: Low → High' },
            { value: 'price-desc', label: 'Price: High → Low' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => router.push(buildParams({ sort: opt.value }))}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                (searchParams.sort ?? 'featured') === opt.value
                  ? 'bg-[#1A1A00] text-[#C9A84C] font-medium border border-[#C9A84C]/30'
                  : 'text-[#9A8F7A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor */}
      <div>
        <h3 className="text-xs font-semibold text-[#9A8F7A] uppercase tracking-widest mb-2">Store</h3>
        <div className="space-y-0.5">
          <button
            onClick={() => router.push(buildParams({ vendor: undefined }))}
            className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
              !searchParams.vendor
                ? 'bg-[#1A1A00] text-[#C9A84C] font-medium border border-[#C9A84C]/30'
                : 'text-[#9A8F7A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8]'
            }`}
          >
            All Stores
          </button>
          {vendors.map((v) => (
            <button
              key={v.slug}
              onClick={() => router.push(buildParams({ vendor: v.slug }))}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                searchParams.vendor === v.slug
                  ? 'bg-[#1A1A00] text-[#C9A84C] font-medium border border-[#C9A84C]/30'
                  : 'text-[#9A8F7A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8]'
              }`}
            >
              {v.storeName}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-[#9A8F7A] uppercase tracking-widest mb-2">Category</h3>
        <div className="space-y-0.5">
          <button
            onClick={() => router.push(buildParams({ category: undefined }))}
            className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
              !searchParams.category
                ? 'bg-[#1A1A00] text-[#C9A84C] font-medium border border-[#C9A84C]/30'
                : 'text-[#9A8F7A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8]'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(buildParams({ category: cat.slug }))}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                searchParams.category === cat.slug
                  ? 'bg-[#1A1A00] text-[#C9A84C] font-medium border border-[#C9A84C]/30'
                  : 'text-[#9A8F7A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-semibold text-[#9A8F7A] uppercase tracking-widest mb-2">Price (TTD)</h3>
        <div className="space-y-0.5">
          {[
            { label: 'Under $100',        min: '0',    max: '100' },
            { label: '$100 – $500',        min: '100',  max: '500' },
            { label: '$500 – $1,500',      min: '500',  max: '1500' },
            { label: '$1,500 – $5,000',    min: '1500', max: '5000' },
            { label: 'Over $5,000',        min: '5000', max: '999999' },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => router.push(buildParams({ minPrice: range.min, maxPrice: range.max }))}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                searchParams.minPrice === range.min && searchParams.maxPrice === range.max
                  ? 'bg-[#1A1A00] text-[#C9A84C] font-medium border border-[#C9A84C]/30'
                  : 'text-[#9A8F7A] hover:bg-[#1A1A1A] hover:text-[#F5F0E8]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
