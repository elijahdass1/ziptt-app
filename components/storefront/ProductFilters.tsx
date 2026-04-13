'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Category { id: string; name: string; slug: string }

interface ProductFiltersProps {
  categories: Category[]
  searchParams: { q?: string; category?: string; minPrice?: string; maxPrice?: string; sort?: string }
}

export function ProductFilters({ categories, searchParams }: ProductFiltersProps) {
  const router = useRouter()

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams()
    if (searchParams.q) params.set('q', searchParams.q)
    if (searchParams.category) params.set('category', searchParams.category)
    if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice)
    if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice)
    if (searchParams.sort) params.set('sort', searchParams.sort)

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }, [router, searchParams])

  const clearAll = () => {
    const params = new URLSearchParams()
    if (searchParams.q) params.set('q', searchParams.q)
    router.push(`/products?${params.toString()}`)
  }

  const hasFilters = searchParams.category || searchParams.minPrice || searchParams.maxPrice

  return (
    <div className="space-y-6">
      {hasFilters && (
        <button onClick={clearAll} className="text-xs text-[#C9A84C] hover:underline font-medium">
          Clear all filters
        </button>
      )}

      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold text-[#F5F0E8] mb-3">Sort By</h3>
        <div className="space-y-1.5">
          {[
            { value: 'featured', label: 'Featured' },
            { value: 'popular', label: 'Most Popular' },
            { value: 'newest', label: 'Newest' },
            { value: 'rating', label: 'Top Rated' },
            { value: 'price-asc', label: 'Price: Low to High' },
            { value: 'price-desc', label: 'Price: High to Low' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('sort', opt.value)}
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

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-[#F5F0E8] mb-3">Category</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateFilter('category', '')}
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
              onClick={() => updateFilter('category', cat.slug)}
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
        <h3 className="text-sm font-semibold text-[#F5F0E8] mb-3">Price (TTD)</h3>
        <div className="space-y-2">
          {[
            { label: 'Under $100', min: '0', max: '100' },
            { label: '$100 – $500', min: '100', max: '500' },
            { label: '$500 – $1,500', min: '500', max: '1500' },
            { label: '$1,500 – $5,000', min: '1500', max: '5000' },
            { label: 'Over $5,000', min: '5000', max: '999999' },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => {
                const p = new URLSearchParams()
                if (searchParams.q) p.set('q', searchParams.q)
                if (searchParams.category) p.set('category', searchParams.category)
                if (searchParams.sort) p.set('sort', searchParams.sort)
                p.set('minPrice', range.min)
                p.set('maxPrice', range.max)
                router.push(`/products?${p.toString()}`)
              }}
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
