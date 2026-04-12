export const dynamic = 'force-dynamic'
export const metadata = { title: 'Terms of Service â zip.tt' }

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#F5F0E8] mb-2">Terms of Service</h1>
        <p className="text-sm text-[#9A8F7A]">Last updated: January 2025. By using zip.tt, you agree to these terms.</p>
      </div>

      {[
        {
          title: '1. Acceptance of Terms',
          body: 'By accessing or using zip.tt, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform. These terms apply to all users including customers, vendors, and visitors.',
        },
        {
          title: '2. User Accounts',
          body: 'You must be at least 18 years old to create an account. You are responsible for maintaining the security of your account credentials. You must provide accurate information when registering. zip.tt reserves the right to suspend or terminate accounts that violate these terms.',
        },
        {
          title: '3. Buying on zip.tt',
          body: 'When you place an order, you are entering into a contract with the vendor â not with zip.tt directly. zip.tt facilitates the transaction but is not the seller. Prices are listed in Trinidad & Tobago Dollars (TTD). Orders are subject to vendor confirmation and product availability.',
        },
        {
          title: '4. Returns & Refunds',
          body: 'Our return policy allows returns within 7 days of delivery for eligible items. Damaged or incorrectly delivered items are fully covered. See our full Returns & Refunds policy at /help/returns for details.',
        },
        {
          title: '5. Selling on zip.tt',
          body: 'Vendors must apply for and receive approval before listing products. Vendors are solely responsible for the accuracy of their listings, the quality of their products, and timely fulfillment of orders. zip.tt charges a 10% commission on completed sales. Vendors must not list counterfeit, illegal, or prohibited items.',
        },
        {
          title: '6. Prohibited Content & Conduct',
          body: 'You may not use zip.tt to sell or purchase illegal goods or services, post false or misleading product listings, harass other users or vendors, attempt to circumvent the platform\'s payment systems, or engage in any activity that violates Trinidad & Tobago law.',
        },
        {
          title: '7. Intellectual Property',
          body: 'The zip.tt name, logo, and platform design are the property of zip.tt. Vendors retain ownership of their product images and descriptions but grant zip.tt a license to display them on the platform.',
        },
        {
          title: '8. Limitation of Liability',
          body: 'zip.tt acts as a marketplace facilitator and is not liable for the quality, safety, or legality of products sold by vendors. To the extent permitted by law, zip.tt\'s total liability shall not exceed the value of the transaction in dispute.',
        },
        {
          title: '9. Governing Law',
          body: 'These Terms are governed by the laws of the Republic of Trinidad & Tobago. Any disputes shall be subject to the jurisdiction of the courts of Trinidad & Tobago.',
        },
        {
          title: '10. Changes to Terms',
          body: 'We may update these terms from time to time. Continued use of zip.tt after changes are posted constitutes acceptance of the new terms. Significant changes will be communicated by email.',
        },
        {
          title: '11. Contact',
          body: 'For questions about these Terms, email support@zip.tt.',
        },
      ].map((section) => (
        <div key={section.title} className="space-y-2">
          <h2 className="text-lg font-bold text-[#F5F0E8]">{section.title}</h2>
          <p className="text-sm text-[#9A8F7A] leading-relaxed">{section.body}</p>
        </div>
      ))}
    </div>
  )
}
