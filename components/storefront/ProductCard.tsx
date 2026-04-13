'use client'

import Link from 'next/link'
import { Star, ShoppingCart } from 'lucide-react'
import { formatTTD } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { toast } from '@/components/ui/use-toast'
import { firstImage, parseImages } from '@/lib/parseImages'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number | null
    images: string | string[]
    rating: number
    reviewCount: number
    stock: number
    vendorId: string
    vendor: { storeName: string; slug: string }
    category: { name: string; slug: string }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0
  const imgUrl = firstImage(product.images)
  const allImages = parseImages(product.images)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: imgUrl,
      vendorId: product.vendorId,
      vendorName: product.vendor.storeName,
      stock: product.stock,
    })
    toast({ title: 'Added to cart!', description: product.name })
  }

  return (
    // Outer wrapper is a div — avoids <a> inside <a> hydration error.
    // The product link is stretched across the whole card via absolute inset-0.
    // The vendor link and cart button sit above it with relative z-10.
    <div className="product-card group flex flex-col relative">
      {/* Stretched product link covers the entire card */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-0"
        aria-label={product.name}
      />

      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-[#1A1A1A]">
        <img
          src={imgUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600' }}
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-[#C9A84C] text-[#0A0A0A] text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </div>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 right-2 bg-[#8B6914] text-[#F0C040] text-xs font-medium px-2 py-0.5 rounded-full">
            Only {product.stock} left
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-[#111111] text-[#9A8F7A] text-sm font-bold px-3 py-1 rounded-full border border-[#C9A84C]/20">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Vendor link — relative z-10 so it sits above the stretched product link */}
        <Link
          href={`/products?vendor=${product.vendor.slug}`}
          className="relative z-10 text-xs text-[#C9A84C] hover:text-[#F0C040] truncate transition-colors"
        >
          {product.vendor.storeName}
        </Link>
        <h3 className="text-sm font-semibold text-[#F5F0E8] line-clamp-2 leading-tight">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${star <= Math.round(product.rating) ? 'fill-[#F0C040] text-[#F0C040]' : 'text-[#1A1A1A]'}`}
              />
            ))}
          </div>
          <span className="text-xs text-[#9A8F7A]">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-base font-bold text-[#C9A84C]">{formatTTD(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-[#9A8F7A] line-through">{formatTTD(product.comparePrice)}</span>
          )}
        </div>

        {/* Add to cart — relative z-10 so it sits above the stretched product link */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="relative z-10 mt-2 w-full flex items-center justify-center gap-2 py-2 bg-[#C9A84C] hover:bg-[#F0C040] disabled:bg-[#1A1A1A] disabled:cursor-not-allowed text-[#0A0A0A] disabled:text-[#9A8F7A] text-sm font-semibold rounded-lg transition-colors"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
