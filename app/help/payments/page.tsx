export const dynamic = 'force-dynamic'
import { CreditCard, Banknote, Building2, ShieldCheck } from 'lucide-react'

export const metadata = { title: 'Payment Options â zip.tt' }

export default function PaymentsPage() {
  const methods = [
    {
      icon: Banknote,
      emoji: 'ðµ',
      title: 'Cash on Delivery',
      subtitle: 'Pay when you receive',
      desc: 'Our most popular payment method. Pay in cash when the courier delivers your order â no card or bank account needed. Available on all orders across our delivery zones.',
      notes: ['Pay in TTD cash at your door', 'No minimum order amount', 'Available on all delivery areas'],
    },
    {
      icon: CreditCard,
      emoji: 'ð³',
      title: 'Linx / WiPay',
      subtitle: 'Local debit card',
      desc: 'Pay securely online using your Linx debit card through WiPay, Trinidad\'s leading local payment gateway. Your card details are never stored by zip.tt.',
      notes: ['All major local bank cards accepted', 'Powered by WiPay â local & trusted', 'Instant payment confirmation'],
    },
    {
      icon: Building2,
      emoji: 'ð¦',
      title: 'Online Banking',
      subtitle: 'Direct bank transfer',
      desc: 'Transfer directly from your online banking account. Once your transfer is confirmed, your order is processed immediately.',
      notes: ['Works with all T&T banks', 'No additional fees', 'Confirmation sent by email'],
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <CreditCard className="h-5 w-5 text-[#C9A84C]" />
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Payment Options</h1>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          zip.tt offers three convenient ways to pay â all secure, all local.
        </p>
      </div>

      {/* Security badge */}
      <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-5 flex items-center gap-4">
        <ShieldCheck className="h-8 w-8 text-[#C9A84C] shrink-0" />
        <div>
          <p className="font-semibold text-[var(--text-primary)]">Buyer Protection on Every Order</p>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">All payments are fully protected. If your order doesn't arrive or doesn't match the description, you're covered.</p>
        </div>
      </div>

      {/* Payment methods */}
      <div className="space-y-4">
        {methods.map((m) => (
          <div key={m.title} className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{m.emoji}</span>
              <div>
                <p className="font-bold text-[var(--text-primary)]">{m.title}</p>
                <p className="text-xs text-[#C9A84C]">{m.subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">{m.desc}</p>
            <ul className="space-y-1">
              {m.notes.map((n) => (
                <li key={n} className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-2xl p-5 space-y-3 text-sm">
        <p className="font-semibold text-[var(--text-primary)]">Frequently Asked</p>
        <div>
          <p className="text-[var(--text-primary)] font-medium">Is my payment information secure?</p>
          <p className="text-[var(--text-secondary)] mt-1">Yes. zip.tt never stores card numbers. Online card payments are processed entirely by WiPay on their secure servers.</p>
        </div>
        <div>
          <p className="text-[var(--text-primary)] font-medium">Can I change my payment method after ordering?</p>
          <p className="text-[var(--text-secondary)] mt-1">You can't change the payment method after placing an order. If you need help, contact support@zip.tt within 1 hour of ordering.</p>
        </div>
        <div>
          <p className="text-[var(--text-primary)] font-medium">What currency does zip.tt use?</p>
          <p className="text-[var(--text-secondary)] mt-1">All prices are in Trinidad & Tobago Dollars (TTD). No foreign currency conversions apply.</p>
        </div>
      </div>
    </div>
  )
}
