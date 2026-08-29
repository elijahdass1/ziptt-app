// Always-on horizontal ticker between the navbar and the hero. Same
// trick TV news lower-thirds use: render the content list twice in a
// row so when the track reaches -50% translateX the second copy is
// already in view. Pause on hover so visitors can read a specific
// promo. Animation lives in globals.css (.ziptt-marquee-track).
//
// Content is admin-managed (slot=TICKER in the Promo table). When no active
// ticker promos exist, we fall back to DEFAULT_ITEMS so the strip is never empty.
import { Truck, Sparkles, Wallet, Zap, Wine, MapPin, Headphones } from 'lucide-react'
import { getPromoIcon } from '@/lib/promoIcons'
import type { PromoRow } from '@/lib/promos'

const DEFAULT_ITEMS = [
  { icon: Truck,     text: 'Free delivery on orders over TTD $500' },
  { icon: Sparkles,  text: 'Carnival ready — costumes, glitter, mas boots' },
  { icon: Wallet,    text: 'Cash on Delivery accepted nationwide' },
  { icon: Zap,       text: 'New tech drops weekly — iPhones, JBL, Samsung' },
  { icon: Wine,      text: 'Caribbean spirits — Angostura, Fernandes, Scotch Bonnet' },
  // Tobago is intentionally NOT listed — we don't deliver there yet.
  // Don't add it back without updating /help/delivery and the
  // checkout zone validation first.
  { icon: MapPin,    text: 'Trinidad-wide delivery — POS · Chaguanas · San Fernando · Arima · Couva' },
  { icon: Headphones,text: '24/7 Zip AI assistant — ask anything' },
]

export function PromoTicker({ items }: { items?: PromoRow[] }) {
  // Map admin-managed rows (icon name + title) to renderable items; ignore rows
  // with no text. Fall back to the defaults when nothing usable is configured.
  const configured = (items ?? [])
    .filter((p) => p.title && p.title.trim())
    .map((p) => ({ icon: getPromoIcon(p.icon), text: p.title as string }))
  const list = configured.length > 0 ? configured : DEFAULT_ITEMS

  return (
    <div className="bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] border-b border-[#C9A84C]/15 overflow-hidden">
      <div className="ziptt-marquee-track py-2">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center gap-8 px-4 shrink-0">
            {list.map((it, i) => {
              const Icon = it.icon
              return (
                <span key={`${dup}-${i}`} className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                  <Icon className="h-3.5 w-3.5 text-[#C9A84C]" />
                  <span>{it.text}</span>
                  <span className="h-1 w-1 rounded-full bg-[#C9A84C]/40 mx-1" />
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
