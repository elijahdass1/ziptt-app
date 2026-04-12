export const dynamic = 'force-dynamic'
export default function BuyerProtectionPage() {
  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', color: '#F5F0E8', padding: '60px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>ð¡ï¸</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: 'bold', marginBottom: '12px' }}>
            Buyer Protection
          </h1>
          <p style={{ color: '#9A8F7A', fontSize: '18px' }}>
            Shop with confidence on zip.tt â we have your back.
          </p>
        </div>

        {/* What is covered */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '22px', color: '#C9A84C', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
              â What is Covered
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: 'ð¦', title: 'Item Not Received', desc: 'If your order does not arrive within the estimated delivery window, you are eligible for a full refund.' },
                { icon: 'â', title: 'Item Not as Described', desc: 'If the product you received is significantly different from what was listed on the product page, we will cover a return and refund.' },
                { icon: 'ð¨', title: 'Damaged on Arrival', desc: 'Items that arrive visibly damaged or broken are covered. Keep the original packaging and photograph the damage.' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: '16px', padding: '16px', background: '#0A0A0A', borderRadius: '8px' }}>
                  <span style={{ fontSize: '28px', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <strong style={{ color: '#F5F0E8', display: 'block', marginBottom: '4px' }}>{item.title}</strong>
                    <p style={{ color: '#9A8F7A', fontSize: '14px', lineHeight: '1.5' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What is NOT covered */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '22px', color: '#ef4444', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
              â What is NOT Covered
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Changed your mind after receiving the item',
                'Wrong size ordered (check size guides before purchasing)',
                'Digital products once the code has been revealed',
                'Items damaged after delivery (user error)',
                'Perishable or consumable goods once opened',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <span style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }}>â</span>
                  <p style={{ color: '#9A8F7A', fontSize: '14px' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Digital Products Policy */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ background: '#1A1000', border: '1px solid #5a4000', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '22px', color: '#C9A84C', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              â¡ Digital Products
            </h2>
            <p style={{ color: '#9A8F7A', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
              Digital products (Netflix, Spotify, game codes, software licenses, etc.) are <strong style={{ color: '#F5F0E8' }}>non-refundable once the code has been revealed</strong>. This policy exists because digital codes cannot be "returned" â once seen, they may have been used.
            </p>
            <p style={{ color: '#9A8F7A', fontSize: '14px', lineHeight: '1.6' }}>
              If a digital code does not work, contact <a href="mailto:support@zip.tt" style={{ color: '#C9A84C' }}>support@zip.tt</a> within 24 hours and we will investigate and provide a replacement code if the original was invalid.
            </p>
          </div>
        </section>

        {/* Dispute Process */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ background: '#111111', border: '1px solid #C9A84C', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '22px', color: '#C9A84C', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              ð How to Dispute
            </h2>
            <p style={{ color: '#9A8F7A', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
              <strong style={{ color: '#F5F0E8' }}>IMPORTANT:</strong> Contact zip.tt support FIRST before contacting your bank or card provider. We can resolve most issues within 1â2 business days.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { step: '1', text: 'Go to My Orders and click on the affected order' },
                { step: '2', text: 'Click "Request Return / Dispute" and describe the issue' },
                { step: '3', text: 'Our team will review within 24â48 hours' },
                { step: '4', text: 'Approved refunds are processed within 5â7 business days' },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <span style={{ background: '#C9A84C', color: '#0A0A0A', fontSize: '12px', fontWeight: 'bold', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.step}</span>
                  <p style={{ color: '#9A8F7A', fontSize: '14px', lineHeight: '1.5', paddingTop: '2px' }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Legal Notice */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ background: '#1a0000', border: '1px solid #5a0000', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', color: '#ef4444', marginBottom: '12px' }}>
              â ï¸ Fraudulent Chargebacks
            </h2>
            <p style={{ color: '#fca5a5', fontSize: '13px', lineHeight: '1.6' }}>
              Fraudulent chargebacks â where a customer files a chargeback despite receiving their item â are taken extremely seriously. zip.tt maintains detailed records of all transactions, deliveries, and customer interactions. Fraudulent chargebacks may be reported to the Trinidad and Tobago Police Service (TTPS) under the <strong>Computer Misuse Act, 2000</strong> and the <strong>Cybercrime Act, 2015</strong>. We cooperate fully with law enforcement on all fraud investigations.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px', fontFamily: 'Georgia, serif' }}>Need Help?</h2>
            <p style={{ color: '#9A8F7A', fontSize: '14px', marginBottom: '16px' }}>
              Our support team is available MondayâFriday, 8amâ6pm (AST)
            </p>
            <a href="mailto:support@zip.tt" style={{ display: 'inline-block', background: '#C9A84C', color: '#0A0A0A', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}>
              ð§ support@zip.tt
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
