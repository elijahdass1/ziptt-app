export const dynamic = 'force-dynamic'
import { Mail, MessageSquare, Clock, Phone } from 'lucide-react'

export const metadata = { title: 'Contact Us â zip.tt' }

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <MessageSquare className="h-5 w-5 text-[#C9A84C]" />
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Contact Us</h1>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          We're here to help. Reach out through any of the channels below and we'll get back to you quickly.
        </p>
      </div>

      {/* Contact methods */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[#C9A84C]/10">
              <Mail className="h-5 w-5 text-[#C9A84C]" />
            </div>
            <p className="font-bold text-[var(--text-primary)]">Email Support</p>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Send us an email and we'll respond within 24 hours on business days.</p>
          <a href="mailto:support@zip.tt"
            className="inline-block text-sm font-semibold text-[#C9A84C] hover:text-[#F0C040] transition-colors">
            support@zip.tt
          </a>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[#C9A84C]/10">
              <MessageSquare className="h-5 w-5 text-[#C9A84C]" />
            </div>
            <p className="font-bold text-[var(--text-primary)]">Live Chat (Zip AI)</p>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Get instant answers from our AI assistant â available 24/7 on any page.</p>
          <p className="text-xs text-[var(--text-secondary)]">Click the chat bubble in the bottom-right corner to start.</p>
        </div>
      </div>

      {/* Response times */}
      <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-5 flex items-start gap-4">
        <Clock className="h-6 w-6 text-[#C9A84C] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[var(--text-primary)]">Support Hours</p>
          <div className="text-sm text-[var(--text-secondary)] mt-1 space-y-1">
            <p>Monday â Friday: 8:00 AM â 6:00 PM (AST)</p>
            <p>Saturday: 9:00 AM â 2:00 PM (AST)</p>
            <p>Sunday & Public Holidays: Email only (next business day response)</p>
          </div>
        </div>
      </div>

      {/* Common topics */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Before You Reach Out</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">These help pages may already have the answer you need:</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/help/tracking',  label: 'ð¦ Track my order' },
            { href: '/help/returns',   label: 'ð Returns & refunds' },
            { href: '/help/delivery',  label: 'ð Delivery info' },
            { href: '/help/payments',  label: 'ð³ Payment options' },
            { href: '/help/vendor-fees',  label: 'ð° Vendor fees' },
            { href: '/help/vendor-guide', label: 'ðª Seller guide' },
          ].map((link) => (
            <a key={link.href} href={link.href}
              className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 hover:border-[#C9A84C]/40 rounded-xl px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-[#C9A84C] transition-colors">
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Vendor disputes */}
      <div className="bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-2xl p-5 text-sm text-[var(--text-secondary)]">
        <p className="font-semibold text-[var(--text-primary)] mb-2">Dispute with a Vendor?</p>
        <p>If you have an unresolved issue with a vendor, you can open a formal dispute from <a href="/account/disputes" className="text-[#C9A84C] hover:underline">My Account â Disputes</a>. Our team reviews all disputes and mediates within 3â5 business days.</p>
      </div>
    </div>
  )
}
