// Auto-rotating spotlight tile in the hero. Cycles through the top
// trending products every 4 seconds with a crossfade. Pauses while the
// tab is hidden (visibilitychange) so we don't burn cycles in
// background tabs, and on hover so visitors can read a card they
// notice. The conic-gradient ring keeps spinning under the image
// regardless of which slide is active.
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { firstImage } from '@/lib/parseImages'
import { formatTTD } from '@/lib/utils'

type Item = {
  id: string
  slug: string
  name: string
  price: number
  comparePrice?: number | null
  images: string | string[]
  vendor: { storeName: string; slug: string }
}

interface Props {
  items: Item[]
  intervalMs?: number
}

export function HeroSpotlight({ items, intervalMs = 4000 }: Props) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (items.length <= 1 || paused) return
    const tick = () => {
      // Skip if the tab is hidden — saves ~15 ticks/min on background tabs.
      if (document.hidden) return
      setIdx((i) => (i + 1) % items.length)
    }
    const t = setInterval(tick, intervalMs)
    return () => clearInterval(t)
  }, [items.length, intervalMs, paused])

  if (items.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="hidden md:block w-[320px] shrink-0 group relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute -inset-1 rounded-2xl ziptt-conic-ring opacity-60 blur-md group-hover:opacity-90 transition-opacity" />
      <div className="relative bg-[#111111] rounded-2xl overflow-hidden border border-[#C9A84C]/30">
        <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 bg-[#0A0A0A]/85 backdrop-blur px-2.5 py-1 rounded-full border border-[#C9A84C]/30">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D62828] ziptt-pulse-red" />
          <span className="text-[10px] font-bold tracking-wide text-[#F5F0E8]">TRENDING</span>
        </div>

        {/* Stack each item absolute and crossfade between them. The
            currently-active one gets opacity-100, the rest opacity-0. */}
        <div className="relative aspect-[4/5] bg-[#1A1A1A] overflow-hidden">
          {items.map((p, i) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              aria-hidden={i !== idx}
              tabIndex={i === idx ? 0 : -1}
              className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img
                src={firstImage(p.images)}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </Link>
          ))}
        </div>

        {/* Active product copy — also crossfades. */}
        <div className="p-4 space-y-1 relative">
          {items.map((p, i) => (
            <div
              key={p.id}
              aria-hidden={i !== idx}
              className={`${i === idx ? 'block' : 'hidden'}`}
            >
              <p className="text-[11px] text-[#C9A84C] font-medium uppercase tracking-wide truncate">{p.vendor.storeName}</p>
              <Link
                href={`/products/${p.slug}`}
                className="block text-sm font-bold text-[#F5F0E8] hover:text-[#C9A84C] line-clamp-2 leading-tight transition-colors"
              >
                {p.name}
              </Link>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-base font-black text-[#C9A84C]">{formatTTD(p.price)}</span>
                {p.comparePrice && p.comparePrice > p.price && (
                  <span className="text-xs text-[#9A8F7A] line-through">{formatTTD(p.comparePrice)}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Slide indicators — clickable so visitors can manually pin
            a slide if they want. Sit just below the price line. */}
        {items.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Show product ${i + 1}`}
                onClick={() => { setIdx(i); setPaused(true) }}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-[#C9A84C]' : 'w-1.5 bg-[#C9A84C]/30 hover:bg-[#C9A84C]/60'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
