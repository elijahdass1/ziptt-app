// Mid-page full-bleed promo banner (the poster-style slot). Admin-managed via
// slot=BANNER in the Promo table. When no active banner promo exists it renders
// the original hardcoded "Carnival Season" design unchanged, so the homepage
// looks identical until an admin sets one.
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { getPromoIcon } from '@/lib/promoIcons'
import type { PromoRow } from '@/lib/promos'

export function PromoBanner({ promo }: { promo?: PromoRow | null }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] border-y border-[#C9A84C]/20">
      <div className="absolute inset-0 ziptt-stripes pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#D62828]/10 blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {promo ? (
            <PromoContent promo={promo} />
          ) : (
            <DefaultContent />
          )}
        </div>
      </div>
    </section>
  )
}

function PromoContent({ promo }: { promo: PromoRow }) {
  const accent = promo.accent || '#D62828'
  const Icon = getPromoIcon(promo.icon)
  return (
    <>
      <div className="space-y-2 max-w-2xl">
        {promo.eyebrow && (
          <div className="inline-flex items-center gap-2 text-xs font-black tracking-[2px]" style={{ color: accent }}>
            <Icon className="h-3.5 w-3.5" /> {promo.eyebrow}
          </div>
        )}
        {promo.title && (
          <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] leading-tight">
            {promo.title}{' '}
            {promo.titleAccent && <span className="gold-shimmer">{promo.titleAccent}</span>}
          </h2>
        )}
        {promo.subtitle && (
          <p className="text-sm md:text-base text-[var(--text-secondary)]">{promo.subtitle}</p>
        )}
      </div>
      {(promo.ctaLabel || promo.cta2Label) && (
        <div className="flex flex-wrap gap-3">
          {promo.ctaLabel && promo.ctaHref && (
            <Link href={promo.ctaHref} className="btn-primary px-6 py-3 rounded-full text-sm flex items-center gap-2 shadow-lg shadow-[#C9A84C]/25">
              {promo.ctaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {promo.cta2Label && promo.cta2Href && (
            <Link href={promo.cta2Href} className="btn-secondary px-6 py-3 rounded-full text-sm">
              {promo.cta2Label}
            </Link>
          )}
        </div>
      )}
    </>
  )
}

function DefaultContent() {
  return (
    <>
      <div className="space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-[#D62828] text-xs font-black tracking-[2px]">
          <Clock className="h-3.5 w-3.5" /> CARNIVAL SEASON
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] leading-tight">
          Get <span className="gold-shimmer">Carnival-ready</span> in days, not weeks.
        </h2>
        <p className="text-sm md:text-base text-[var(--text-secondary)]">
          Costumes, mas boots, body glitter, makeup kits — local vendors, nationwide delivery.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/products?category=carnival" className="btn-primary px-6 py-3 rounded-full text-sm flex items-center gap-2 shadow-lg shadow-[#C9A84C]/25">
          Shop Carnival <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/products?category=rum-spirits" className="btn-secondary px-6 py-3 rounded-full text-sm">
          Caribbean spirits
        </Link>
      </div>
    </>
  )
}
