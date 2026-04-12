export const metadata = { title: 'Cookie Policy — zip.tt' }

export default function CookiesPage() {
  const cookieTypes = [
    {
      type: 'Essential Cookies',
      required: true,
      desc: 'These cookies are required for the site to function. They keep you logged in, maintain your shopping cart, and handle security. You cannot opt out of essential cookies.',
      examples: ['Session authentication token', 'Shopping cart contents', 'CSRF protection token'],
    },
    {
      type: 'Analytics Cookies',
      required: false,
      desc: 'These cookies help us understand how visitors use zip.tt so we can improve the experience. All data is anonymised — we cannot identify individual users from analytics data.',
      examples: ['Pages visited', 'Time spent on pages', 'Device and browser type'],
    },
    {
      type: 'Preference Cookies',
      required: false,
      desc: 'These cookies remember your preferences to personalise your experience, such as your selected region or display settings.',
      examples: ['Selected delivery region', 'Currency display preference'],
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#F5F0E8] mb-2">Cookie Policy</h1>
        <p className="text-sm text-[#9A8F7A]">Last updated: January 2025</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-[#F5F0E8]">What Are Cookies?</h2>
        <p className="text-sm text-[#9A8F7A] leading-relaxed">
          Cookies are small text files stored in your browser when you visit a website. They help websites remember information about your visit, such as your login status or shopping cart contents.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#F5F0E8] mb-4">Cookies We Use</h2>
        <div className="space-y-4">
          {cookieTypes.map((c) => (
            <div key={c.type} className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-[#F5F0E8]">{c.type}</p>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.required ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30' : 'bg-[#1A1A1A] text-[#9A8F7A] border border-white/10'}`}>
                  {c.required ? 'Required' : 'Optional'}
                </span>
              </div>
              <p className="text-sm text-[#9A8F7A] leading-relaxed mb-3">{c.desc}</p>
              <div className="flex flex-wrap gap-2">
                {c.examples.map((ex) => (
                  <span key={ex} className="text-xs bg-[#0A0A0A] border border-[#C9A84C]/10 text-[#9A8F7A] px-2.5 py-1 rounded-full">{ex}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-[#F5F0E8]">Third-Party Cookies</h2>
        <p className="text-sm text-[#9A8F7A] leading-relaxed">
          We use WiPay for payment processing. WiPay may set its own cookies on the payment page for security and fraud prevention purposes. These are governed by WiPay's own privacy policy.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-[#F5F0E8]">Managing Cookies</h2>
        <p className="text-sm text-[#9A8F7A] leading-relaxed">
          You can control non-essential cookies through your browser settings. Most browsers allow you to view, delete, and block cookies. Note that blocking essential cookies will prevent you from using core features like your shopping cart and account login.
        </p>
        <p className="text-sm text-[#9A8F7A] leading-relaxed">
          For browser-specific instructions, visit your browser's help documentation. For questions, email <a href="mailto:support@zip.tt" className="text-[#C9A84C] hover:underline">support@zip.tt</a>.
        </p>
      </div>
    </div>
  )
}
