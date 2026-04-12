'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, ShoppingCart, Minus, Plus, Package, Truck, Shield, ChevronRight } from 'lucide-react'
import { formatTTD, getDeliveryEstimate } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { toast } from '@/components/ui/use-toast'
import { parseImages } from '@/lib/parseImages'

interface Review {
  id: string; rating: number; title?: string | null; body?: string | null
  createdAt: Date; verified: boolean
  user: { name?: string | null; image?: string | null }
}

interface Product {
  id: string; name: string; slug: string; description: string
  price: number; comparePrice?: number | null; images: string | string[]
  stock: number; rating: number; reviewCount: number; soldCount: number
  tags: string | string[]; vendorId: string; sku?: string | null
  vendor: { storeName: string; slug: string; rating: number; description?: string | null }
  category: { name: string; slug: string }
  reviews: Review[]
}

export function ProductDetail({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState<'desc' | 'reviews'>('desc')
  const addItem = useCartStore((s) => s.addItem)

  const images = parseImages(product.images)
  const tags = Array.isArray(product.tags) ? product.tags : (() => { try { return JSON.parse(product.tags as string) } catch { return [] } })()

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: images[0] ?? 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
        vendorId: product.vendorId,
        vendorName: product.vendor.storeName,
        stock: product.stock,
      })
    }
    toast({ title: `${quantity}× added to cart!`, description: product.name })
  }

  const avgRating = product.rating

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[#9A8F7A] mb-6">
        <Link href="/" className="hover:text-[#C9A84C] transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-[#C9A84C] transition-colors">Products</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#C9A84C] transition-colors">{product.category.name}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[#F5F0E8] font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#1A1A1A] border border-[#C9A84C]/10">
            <img
              src={images[selectedImage] ?? 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600'}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600' }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-[#C9A84C]' : 'border-[#C9A84C]/10 hover:border-[#C9A84C]/40'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <Link href={`/store/${product.vendor.slug}`} className="text-sm text-[#C9A84C] hover:underline font-medium">
              {product.vendor.storeName}
            </Link>
            <h1 className="text-2xl font-bold text-[#F5F0E8] mt-1">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-[#2A2A2A]'}`} />
              ))}
            </div>
            <span className="text-sm text-[#F5F0E8] font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-[#9A8F7A]">({product.reviewCount} reviews)</span>
            <span className="text-sm text-[#9A8F7A]">• {product.soldCount} sold</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-[#F5F0E8]">{formatTTD(product.price)}</span>
            {product.comparePrice && (
              <>
                <span className="text-lg text-[#9A8F7A] line-through">{formatTTD(product.comparePrice)}</span>
                <span className="badge-red">Save {discount}%</span>
              </>
            )}
          </div>

          {/* Stock */}
          {product.stock > 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
              <Package className="h-4 w-4" />
              {product.stock <= 10 ? `Only ${product.stock} in stock — order soon!` : 'In Stock'}
            </div>
          ) : (
            <div className="text-sm text-red-400 font-medium">Out of Stock</div>
          )}

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#F5F0E8]">Quantity:</span>
              <div className="flex items-center border border-[#C9A84C]/20 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-[#1A1A1A] transition-colors text-[#F5F0E8]">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center text-[#F5F0E8]">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-[#1A1A1A] transition-colors text-[#F5F0E8]">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#C9A84C] hover:bg-[#F0C040] disabled:bg-[#1A1A1A] disabled:cursor-not-allowed text-[#0A0A0A] disabled:text-[#9A8F7A] font-bold rounded-xl transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>
            <Link href="/cart"
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[#C9A84C] text-[#C9A84C] font-bold rounded-xl hover:bg-[#C9A84C]/10 transition-colors">
              Buy Now
            </Link>
          </div>

          {/* Delivery info */}
          <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#F5F0E8]">Delivery</p>
                <p className="text-xs text-[#9A8F7A]">
                  {getDeliveryEstimate('Port of Spain')} (Port of Spain). Free on orders over TTD $500.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-[#C9A84C] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#F5F0E8]">Buyer Protection</p>
                <p className="text-xs text-[#9A8F7A]">7-day return policy if item is not as described.</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-[#1A1A1A] border border-[#C9A84C]/15 text-[#9A8F7A] px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}
          {product.sku && <p className="text-xs text-[#9A8F7A]/60">SKU: {product.sku}</p>}
        </div>
      </div>

      {/* Tabs: Description / Reviews */}
      <div className="mt-10">
        <div className="border-b border-[#C9A84C]/15">
          <div className="flex gap-6">
            {(['desc', 'reviews'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${tab === t ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-transparent text-[#9A8F7A] hover:text-[#F5F0E8]'}`}>
                {t === 'desc' ? 'Description' : `Reviews (${product.reviewCount})`}
              </button>
            ))}
          </div>
        </div>

        <div className="py-6">
          {tab === 'desc' ? (
            <div className="text-sm text-[#9A8F7A] leading-relaxed whitespace-pre-line">{product.description}</div>
          ) : (
            <div className="space-y-4">
              {product.reviews.length === 0 ? (
                <p className="text-[#9A8F7A]">No reviews yet. Be the first!</p>
              ) : (
                product.reviews.map((review) => (
                  <div key={review.id} className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-sm font-bold text-[#C9A84C] shrink-0">
                        {review.user.name?.[0] ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#F5F0E8]">{review.user.name ?? 'Anonymous'}</span>
                          {review.verified && <span className="badge-green text-xs">Verified Purchase</span>}
                          <span className="text-xs text-[#9A8F7A]/60 ml-auto">
                            {new Date(review.createdAt).toLocaleDateString('en-TT')}
                          </span>
                        </div>
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-[#2A2A2A]'}`} />
                          ))}
                        </div>
                        {review.title && <p className="text-sm font-medium text-[#F5F0E8] mt-2">{review.title}</p>}
                        {review.body && <p className="text-sm text-[#9A8F7A] mt-1">{review.body}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
