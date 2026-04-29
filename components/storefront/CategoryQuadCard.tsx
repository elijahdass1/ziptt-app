// Amazon-style "category quad" card: a small box with a title, a 2x2
// grid of product thumbnails, and a "Shop more" link. Sits in a 4-wide
// grid on the homepage so the catalog reads as browseable rather than
// just a search box.
//
// Each thumb in the 2x2 deep-links to the product (so the card surfaces
// 4 SKUs simultaneously instead of just one hero shot per category).
//
// Marked 'use client' because we need an inline onError fallback so any
// stragglers that 404 mid-page don't render as a broken-image icon.
'use client'

import Link from 'next/link'
import { firstImage } from '@/lib/parseImages'

type Thumb = {
  id: string
  slug: string
  name: string
  images: string | string[]
}

interface Props {
  title: string
  href: string
  cta?: string
  products: Thumb[]
}

// Fallback image for any thumbnail that fails to load. Chosen to read as
// "carnival/Trinidad" so a broken image at least looks intentional.
const FALLBACK = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80'

export function CategoryQuadCard({ title, href, cta = 'See more', products }: Props) {
  // Pad to exactly 4 tiles so the grid stays balanced when a category
  // is sparse — empty tiles render as dim plates rather than collapsing.
  const tiles = products.slice(0, 4)
  while (tiles.length < 4) tiles.push(null as unknown as Thumb)

  return (
    <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-lg p-4 flex flex-col">
      <h3 className="text-base font-bold text-[#F5F0E8] mb-3 truncate">{title}</h3>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {tiles.map((t, i) =>
          t ? (
            <Link
              key={t.id}
              href={`/products/${t.slug}`}
              className="aspect-square bg-[#1A1A1A] rounded overflow-hidden group/tile relative"
            >
              <img
                src={firstImage(t.images)}
                alt={t.name}
                className="w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  if (img.src !== FALLBACK) img.src = FALLBACK
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                <p className="text-[10px] text-[#F5F0E8] line-clamp-1 leading-tight">{t.name}</p>
              </div>
            </Link>
          ) : (
            <div key={`empty-${i}`} className="aspect-square bg-[#1A1A1A] rounded" />
          )
        )}
      </div>
      <Link
        href={href}
        className="text-xs text-[#C9A84C] hover:text-[#F0C040] font-medium mt-auto transition-colors"
      >
        {cta} &rarr;
      </Link>
    </div>
  )
}
