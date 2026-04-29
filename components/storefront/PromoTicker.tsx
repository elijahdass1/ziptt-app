// Always-on horizontal ticker between the navbar and the hero. Same
// trick TV news lower-thirds use: render the content list twice in a
// row so when the track reaches -50% translateX the second copy is
// already in view. Pause on hover so visitors can read a specific
// promo. Animation lives in globals.css (.ziptt-marquee-track).
import { Sparkles, Truck, Wallet, Headphones, Zap, MapPin, Wine } from 'lucide-react'

const ITEMS = [
  { icon: Truck,     text: 'Free delivery on orders over TTD $500' },
  { icon: Sparkles,  text: 'Carnival ready — costumes, glitter, mas boots' },
  { icon: Wallet,    text: 'Cash on Delivery accepted nationwide' },
  { icon: Zap,       text: 'New tech drops weekly — iPhones, JBL, Samsung' },
  { icon: Wine,      text: 'Caribbean spirits — Angostura, Fernandes, Scotch Bonnet' },
  { icon: MapPin,    text: 'Trinidad-wide delivery — POS · Central · South · Tobago' },
  { icon: Headphones,text: '24/7 Zip AI assistant — ask anything' },
]

export function PromoTicker() {
  return (
    <div className="bg-gradient-to-r from-[#0A0A0A] via-[#1A0A0A] to-[#0A0A0A] border-b border-[#C9A84C]/15 overflow-hidden">
      <div className="ziptt-marquee-track py-2">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center gap-8 px-4 shrink-0">
            {ITEMS.map((it, i) => {
              const Icon = it.icon
              return (
                <span key={`${dup}-${i}`} className="flex items-center gap-2 text-xs font-medium text-[#9A8F7A]">
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
