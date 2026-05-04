export const dynamic = 'force-dynamic'
export const metadata = { title: 'Privacy Policy â zip.tt' }

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-secondary)]">Last updated: January 2025</p>
      </div>

      {[
        {
          title: '1. Who We Are',
          body: 'zip.tt is an online marketplace operating in Trinidad & Tobago. We connect local vendors with customers across the country. References to "we", "us", or "zip.tt" in this policy refer to the zip.tt platform and its operators.',
        },
        {
          title: '2. Information We Collect',
          body: 'We collect information you provide directly when you create an account (name, email address, phone number, delivery address), place an order (order details, payment method type â we do not store card numbers), or contact our support team. We also collect basic usage data such as pages visited, browser type, and device type to improve the platform.',
        },
        {
          title: '3. How We Use Your Information',
          body: 'We use your information to process and deliver your orders, send order confirmations and updates, provide customer support, improve the zip.tt platform, and detect and prevent fraud. We do not sell your personal information to third parties.',
        },
        {
          title: '4. Sharing Your Information',
          body: 'We share your name and delivery address with the vendor fulfilling your order and with our courier partners for delivery purposes. We do not share your contact details with vendors for marketing purposes. We may disclose information where required by law.',
        },
        {
          title: '5. Payment Security',
          body: 'Card payments are processed by WiPay, a PCI-compliant payment gateway. zip.tt never stores your card number, CVV, or PIN. For Cash on Delivery orders, no payment data is transmitted online.',
        },
        {
          title: '6. Cookies',
          body: 'We use essential cookies to keep you logged in and maintain your cart. We use analytics cookies to understand how visitors use the site. You can manage cookie preferences at any time. See our Cookie Policy for details.',
        },
        {
          title: '7. Data Retention',
          body: 'We retain your account information for as long as your account is active. Order records are retained for 7 years for legal and financial compliance. You may request deletion of your account by emailing support@zip.tt.',
        },
        {
          title: '8. Your Rights',
          body: 'You have the right to access the personal data we hold about you, request corrections to inaccurate data, and request deletion of your account and associated data. To exercise these rights, email support@zip.tt.',
        },
        {
          title: '9. Contact',
          body: 'For any privacy-related queries, email support@zip.tt. We aim to respond within 5 business days.',
        },
      ].map((section) => (
        <div key={section.title} className="space-y-2">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{section.title}</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{section.body}</p>
        </div>
      ))}
    </div>
  )
}
