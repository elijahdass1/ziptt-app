// /digital — instant-delivery store. Catalog of digital products
// (Netflix, Spotify, ChatGPT etc.) with a category tab strip on top.
//
// Note on icons: previous version embedded raw emoji directly in the
// source ("⚡ INSTANT", "📺 Streaming", etc.) but the file got saved
// with a non-UTF-8 encoding at some point so production rendered the
// mojibake `â¡`, `ðº`, `ð»`. Switched to Lucide React icons
// everywhere — they're SVG components so encoding can never break
// them.
export const dynamic = 'force-dynamic'

import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import {
  Zap, Tv, Code, Gamepad2, GraduationCap, ShieldCheck, Mail, ArrowRight,
} from 'lucide-react'

type CategoryKey = '' | 'streaming' | 'software' | 'gaming' | 'education'

const CATEGORIES: { key: CategoryKey; label: string; Icon: typeof Tv | null }[] = [
  { key: '',          label: 'All',        Icon: null },
  { key: 'streaming', label: 'Streaming',  Icon: Tv },
  { key: 'software',  label: 'Software',   Icon: Code },
  { key: 'gaming',    label: 'Gaming',     Icon: Gamepad2 },
  { key: 'education', label: 'Education',  Icon: GraduationCap },
]

const TRUST_BADGES: { Icon: typeof Zap; label: string }[] = [
  { Icon: Zap,         label: 'Instant Delivery' },
  { Icon: ShieldCheck, label: 'Secure Checkout' },
  { Icon: Mail,        label: 'Email Delivery' },
  { Icon: Zap,         label: 'TTD Prices' },
]

export default async function DigitalPage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category as CategoryKey | undefined

  const products = await prisma.digitalProduct.findMany({
    where: {
      isActive: true,
      ...(category ? { categoryTag: category } : {}),
    },
    include: {
      vendor: { select: { storeName: true, rating: true } },
      _count: { select: { codes: { where: { isUsed: false } } } },
    },
    orderBy: [{ featured: 'desc' }, { soldCount: 'desc' }],
  })

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)]">
      {/* Hero */}
      <div className="px-6 py-14 text-center border-b border-[var(--bg-card)]">
        <div className="inline-flex items-center gap-2 text-[#C9A84C] text-xs font-bold tracking-[2px] mb-3">
          <Zap className="h-3.5 w-3.5" />
          INSTANT DELIVERY
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: 'Georgia,serif' }}>
          Digital Products
        </h1>
        <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-6">
          Netflix, Spotify, ChatGPT &amp; more — paid in TTD, delivered instantly.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          {TRUST_BADGES.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full px-4 py-1.5 text-xs text-[var(--text-secondary)]"
            >
              <b.Icon className="h-3.5 w-3.5 text-[#C9A84C]" />
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-6 py-5 flex gap-2 overflow-x-auto border-b border-[var(--bg-card)] scrollbar-thin">
        {CATEGORIES.map((c) => {
          const active = category === c.key || (!category && !c.key)
          const Icon = c.Icon
          return (
            <Link
              key={c.key}
              href={`/digital${c.key ? `?category=${c.key}` : ''}`}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
                active
                  ? 'bg-[#C9A84C] text-black border-[#C9A84C] font-semibold'
                  : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[#C9A84C]/50'
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {c.label}
            </Link>
          )
        })}
      </div>

      {/* Product grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/digital/${product.slug}`}
              className="group bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:border-[#C9A84C]/45 transition-colors"
            >
              <div className="relative h-44 bg-[var(--bg-card)]">
                {product.thumbnail && (
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    sizes="(max-width: 600px) 50vw, 240px"
                    style={{ objectFit: 'cover' }}
                  />
                )}
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-[#C9A84C] text-black text-[11px] font-bold px-2 py-0.5 rounded">
                  <Zap className="h-3 w-3" />
                  INSTANT
                </span>
              </div>
              <div className="p-4">
                <p className="text-xs text-[var(--text-secondary)] mb-1.5">{product.vendor.storeName}</p>
                <h3 className="text-[15px] font-semibold leading-tight mb-2">{product.name}</h3>
                <p
                  className={`text-xs mb-3 ${
                    product._count.codes < 5 ? 'text-red-500' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {product._count.codes} codes available
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-[#C9A84C]">${product.price.toFixed(2)}</span>
                    {product.comparePrice && (
                      <span className="text-xs text-[var(--text-secondary)] line-through ml-2">
                        ${product.comparePrice.toFixed(2)}
                      </span>
                    )}
                    <span className="block text-[11px] text-[var(--text-secondary)]">TTD</span>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-[#C9A84C] text-black text-xs font-bold px-3 py-1.5 rounded-md group-hover:bg-[#F0C040] transition-colors">
                    Buy <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
