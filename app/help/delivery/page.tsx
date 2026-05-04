export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { Truck, Clock, MapPin, Phone } from 'lucide-react'

export const metadata = { title: 'Delivery Info â zip.tt' }

export default function DeliveryInfoPage() {
  const zones = [
    { area: 'Port of Spain & West', detail: 'Woodbrook, Newtown, St. Clair, St. James, Maraval, Westmoorings, Diego Martin, Carenage', eta: '1â2 business days' },
    { area: 'EastâWest Corridor', detail: 'Champ Fleurs, Mt. Hope, Valsayn, Curepe, St. Joseph, Tunapuna, Tacarigua, Trincity, Piarco, Arima', eta: '2â3 business days' },
    { area: 'Central Trinidad', detail: 'Chaguanas, Endeavour, Couva, Preysal, Claxton Bay', eta: '2â3 business days' },
    { area: 'South Trinidad', detail: 'San Fernando, Pleasantville, La Romaine, Gulf City, Corinth', eta: '2â3 business days' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <Truck className="h-5 w-5 text-[#C9A84C]" />
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Delivery Info</h1>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          zip.tt delivers to established residential and commercial areas across Trinidad.
          Free delivery on all orders over <span className="text-[#C9A84C] font-semibold">TTD $500</span>.
        </p>
      </div>

      {/* Free delivery banner */}
      <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-5 flex items-center gap-4">
        <span className="text-3xl">ð</span>
        <div>
          <p className="font-semibold text-[var(--text-primary)]">Free Delivery on Orders Over TTD $500</p>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Standard delivery fee is TTD $50 for orders under $500.</p>
        </div>
      </div>

      {/* Delivery zones */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#C9A84C]" /> Delivery Zones & Times
        </h2>
        <div className="space-y-3">
          {zones.map((z) => (
            <div key={z.area} className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{z.area}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{z.detail}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-3 py-1 rounded-full whitespace-nowrap">
                ð {z.eta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#C9A84C]" /> How Delivery Works
        </h2>
        <ol className="space-y-4">
          {[
            { step: '1', title: 'Place your order', desc: 'Add items to your cart and complete checkout. Choose your delivery address and select Cash on Delivery or online payment.' },
            { step: '2', title: 'Vendor confirms', desc: 'The vendor receives your order and confirms within a few hours. You\'ll get an email notification when confirmed.' },
            { step: '3', title: 'Packed & dispatched', desc: 'Your order is packed and handed to our courier partner for delivery to your address.' },
            { step: '4', title: 'Delivered to your door', desc: 'A courier delivers your package. For Cash on Delivery orders, payment is collected at the door.' },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-[#C9A84C] text-black text-sm font-black flex items-center justify-center shrink-0">{item.step}</div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{item.title}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Notes */}
      <div className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-2xl p-5 space-y-2 text-sm text-[var(--text-secondary)]">
        <p className="font-semibold text-[var(--text-primary)] mb-2">Good to know</p>
        <p>â¢ Delivery times are business days (MondayâFriday, excluding public holidays).</p>
        <p>â¢ Large or bulky items may require additional time to dispatch.</p>
        <p>â¢ You can track your order status in <Link href="/orders" className="text-[#C9A84C] hover:underline">My Orders</Link>.</p>
        <p>â¢ Need delivery to an area not listed? <Link href="/help/contact" className="text-[#C9A84C] hover:underline">Contact us</Link> for special arrangements.</p>
      </div>
    </div>
  )
}
