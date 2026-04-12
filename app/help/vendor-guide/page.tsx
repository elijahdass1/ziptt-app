import Link from 'next/link'
import { Store, Package, Camera, TrendingUp, Star, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Seller Guide — zip.tt' }

export default function VendorGuidePage() {
  const steps = [
    {
      step: '01',
      icon: Store,
      title: 'Create Your Store',
      desc: 'Sign up at /vendor/register. Fill in your store name, description, and location. Upload a logo (recommended: 400×400px square image). Your application is reviewed within 1–2 business days.',
    },
    {
      step: '02',
      icon: Package,
      title: 'List Your Products',
      desc: 'Go to Vendor Dashboard → Products → Add New. Fill in product name, description, price in TTD, stock quantity, and category. The better your description, the more you sell.',
    },
    {
      step: '03',
      icon: Camera,
      title: 'Add Great Photos',
      desc: 'Products with clear, well-lit photos get significantly more clicks. Use natural light. Show the product from multiple angles. Minimum recommended size: 800×800px. No watermarks.',
    },
    {
      step: '04',
      icon: TrendingUp,
      title: 'Manage Orders',
      desc: 'When a customer places an order, you\'ll get an email notification. Go to Vendor Dashboard → Orders to confirm, process, and mark items as shipped. Respond within 24 hours to avoid cancellations.',
    },
    {
      step: '05',
      icon: Star,
      title: 'Build Your Reputation',
      desc: 'Customers can leave reviews after receiving their orders. Fast dispatch, accurate descriptions, and good packaging lead to 5-star reviews which drive more sales.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <Store className="h-5 w-5 text-[#C9A84C]" />
          </div>
          <h1 className="text-3xl font-black text-[#F5F0E8]">Seller Guide</h1>
        </div>
        <p className="text-[#9A8F7A] leading-relaxed">
          Everything you need to set up and run a successful store on zip.tt.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: '2,800+', label: 'Active products' },
          { value: '10%',    label: 'Commission only' },
          { value: 'Friday', label: 'Weekly payouts' },
        ].map((s) => (
          <div key={s.label} className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-4 text-center">
            <p className="text-xl font-black text-[#C9A84C]">{s.value}</p>
            <p className="text-xs text-[#9A8F7A] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div>
        <h2 className="text-xl font-bold text-[#F5F0E8] mb-6">Getting Started — Step by Step</h2>
        <div className="space-y-5">
          {steps.map((s) => (
            <div key={s.step} className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-5 flex gap-5">
              <div className="shrink-0">
                <div className="h-10 w-10 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-[#C9A84C]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-[#C9A84C]/60">{s.step}</span>
                  <p className="font-bold text-[#F5F0E8]">{s.title}</p>
                </div>
                <p className="text-sm text-[#9A8F7A] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div>
        <h2 className="text-xl font-bold text-[#F5F0E8] mb-4">Pro Tips 🇹🇹</h2>
        <div className="space-y-3 text-sm text-[#9A8F7A]">
          {[
            'Set competitive prices — browse similar products on zip.tt to gauge the market.',
            'Carnival season (January–February) is the busiest time of year. Stock up and list early.',
            'Respond to customer messages within a few hours. Fast responses build trust.',
            'Offer Cash on Delivery — it\'s the most popular payment method in T&T.',
            'Keep stock counts accurate to avoid overselling and order cancellations.',
            'Feature your best-selling products — featured items appear on the zip.tt homepage.',
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-3">
              <span className="text-[#C9A84C] mt-0.5 shrink-0">→</span>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div className="bg-[#111111] border border-red-500/20 rounded-2xl p-5 text-sm">
        <p className="font-semibold text-[#F5F0E8] mb-3">Vendor Rules</p>
        <div className="space-y-2 text-[#9A8F7A]">
          <p>• All listings must be accurate — misrepresenting products results in account suspension.</p>
          <p>• No counterfeit, illegal, or prohibited items (firearms, drugs, etc.).</p>
          <p>• Orders must be confirmed within 24 hours of placement.</p>
          <p>• Vendors are responsible for accurate stock counts to prevent overselling.</p>
          <p>• Disputes must be responded to within 48 hours of being raised.</p>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link href="/vendor/register"
          className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A0A0A] font-bold px-8 py-3 rounded-full hover:bg-[#F0C040] transition-colors">
          Apply to Sell <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-[#9A8F7A] mt-3">Questions? Email <a href="mailto:support@zip.tt" className="text-[#C9A84C] hover:underline">support@zip.tt</a></p>
      </div>
    </div>
  )
}
