import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Store, ShieldCheck, TrendingUp, Zap, Package, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Sell on zip.tt — Trinidad & Tobago\'s Online Marketplace',
  description: 'Join hundreds of Trinbagonian vendors on zip.tt. Free to list. Only 10% commission. Weekly payouts direct to your bank.',
}

const PERKS = [
  { icon: Store,        title: 'Free to list',        desc: 'No monthly fees or listing charges. You only pay when you sell.' },
  { icon: TrendingUp,   title: '10% commission only', desc: 'The lowest rate of any T&T marketplace. Keep 90% of every sale.' },
  { icon: Zap,          title: 'Weekly payouts',       desc: 'Earnings hit your bank every Friday. No waiting 30 days.' },
  { icon: ShieldCheck,  title: 'Buyer protection',     desc: 'We handle disputes so you focus on selling, not chasing.' },
  { icon: Package,      title: 'Delivery network',     desc: 'Tap into our delivery coverage across Trinidad.' },
  { icon: MessageSquare,'title': 'Built-in messaging', desc: 'Chat directly with customers from your vendor dashboard.' },
]

const STEPS = [
  { n: '01', title: 'Create your account',   desc: 'Sign up in under 2 minutes with your email and phone number.' },
  { n: '02', title: 'Set up your store',     desc: 'Add your store name, logo, and a short description.' },
  { n: '03', title: 'Verify your identity',  desc: 'Upload a valid ID — required for payouts and buyer trust.' },
  { n: '04', title: 'List your products',    desc: 'Upload photos, set prices, and go live immediately.' },
  { n: '05', title: 'Get paid',              desc: 'Customers order, you confirm, we pay you weekly.' },
]

export default function SellPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] border-b border-[#C9A84C]/15 overflow-hidden py-20 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C9A84C]/8 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-full px-4 py-1.5 text-xs font-semibold text-[#C9A84C] tracking-widest uppercase">
              <Store className="h-3.5 w-3.5" /> Become a Seller
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)]" style={{ fontFamily: 'Georgia, serif' }}>
              Sell to all of <span className="text-[#C9A84C]">Trinidad & Tobago</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              zip.tt is T&T's fastest-growing online marketplace. List your products for free,
              reach thousands of customers, and get paid weekly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/vendor/register"
                className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#F0C040] text-black font-bold px-8 py-3.5 rounded-xl text-sm transition-colors"
              >
                Start selling today <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 border border-[#C9A84C]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#C9A84C]/60 px-8 py-3.5 rounded-xl text-sm transition-colors"
              >
                Already have an account?
              </Link>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Free to join · No credit card required · Approval within 24 hours
            </p>
          </div>
        </section>

        {/* Perks */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia, serif' }}>
              Why sell on zip.tt?
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">Built for Trinbagonian sellers, by Trinbagonians.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-2xl p-5 hover:border-[#C9A84C]/35 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[#C9A84C]" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] mb-1">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-[var(--bg-secondary)] border-t border-b border-[#C9A84C]/15 py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia, serif' }}>
                How it works
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">From sign-up to first sale in under an hour.</p>
            </div>
            <div className="space-y-4">
              {STEPS.map(({ n, title, desc }) => (
                <div key={n} className="flex items-start gap-4 bg-[var(--bg-primary)] border border-[#C9A84C]/15 rounded-xl p-4">
                  <span className="text-[#C9A84C] font-black text-lg shrink-0 w-10 text-center">{n}</span>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{title}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What you can sell */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Georgia, serif' }}>
              What can I sell?
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              'Electronics & Gadgets', 'Fashion & Clothing', 'Carnival Costumes',
              'Groceries & Food', 'Home & Garden', 'Rum & Spirits',
              'Toys & Kids', 'Beauty & Health', 'Sports & Fitness',
              'Automotive', 'Services', 'Appliances',
            ].map((cat) => (
              <div key={cat} className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)]">
                <CheckCircle className="h-4 w-4 text-[#C9A84C] shrink-0" />
                {cat}
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-4 text-center">
            Prohibited items include weapons, illegal substances, counterfeit goods, and adult content.{' '}
            <Link href="/terms" className="text-[#C9A84C] hover:underline">See full terms.</Link>
          </p>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] border-t border-[#C9A84C]/15 py-16 px-4 text-center">
          <h2 className="text-3xl font-black text-[var(--text-primary)] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Ready to start selling?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto text-sm">
            Join the zip.tt seller community. Free to join, fast approval, weekly payouts.
          </p>
          <Link
            href="/vendor/register"
            className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#F0C040] text-black font-bold px-10 py-4 rounded-xl text-base transition-colors"
          >
            Create your store <ArrowRight className="h-5 w-5" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
