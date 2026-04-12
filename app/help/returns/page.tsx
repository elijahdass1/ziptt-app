export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react'

export const metadata = { title: 'Returns & Refunds â zip.tt' }

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <RotateCcw className="h-5 w-5 text-[#C9A84C]" />
          </div>
          <h1 className="text-3xl font-black text-[#F5F0E8]">Returns & Refunds</h1>
        </div>
        <p className="text-[#9A8F7A] leading-relaxed">
          We want you to be happy with every purchase. If something isn't right, here's how we can help.
        </p>
      </div>

      {/* Return window */}
      <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-5 flex items-center gap-4">
        <Clock className="h-8 w-8 text-[#C9A84C] shrink-0" />
        <div>
          <p className="font-semibold text-[#F5F0E8]">7-Day Return Window</p>
          <p className="text-sm text-[#9A8F7A] mt-0.5">You have 7 days from the delivery date to request a return.</p>
        </div>
      </div>

      {/* Eligible / not eligible */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-green-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="font-semibold text-[#F5F0E8]">Eligible for return</p>
          </div>
          <ul className="space-y-2 text-sm text-[#9A8F7A]">
            <li>â¢ Item arrived damaged or defective</li>
            <li>â¢ Wrong item received</li>
            <li>â¢ Item significantly different from description</li>
            <li>â¢ Unopened items in original packaging (within 7 days)</li>
          </ul>
        </div>
        <div className="bg-[#111111] border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-5 w-5 text-red-400" />
            <p className="font-semibold text-[#F5F0E8]">Not eligible</p>
          </div>
          <ul className="space-y-2 text-sm text-[#9A8F7A]">
            <li>â¢ Items returned after 7 days</li>
            <li>â¢ Used or opened consumable items</li>
            <li>â¢ Items damaged by the buyer</li>
            <li>â¢ Digital products or download codes</li>
            <li>â¢ Custom or personalised items</li>
          </ul>
        </div>
      </div>

      {/* How to return */}
      <div>
        <h2 className="text-xl font-bold text-[#F5F0E8] mb-4">How to Request a Return</h2>
        <ol className="space-y-4">
          {[
            { step: '1', title: 'Go to My Orders', desc: 'Sign in and navigate to My Account â Orders. Find the order containing the item you want to return.' },
            { step: '2', title: 'Click "Request Return"', desc: 'Select the item and choose your return reason. Upload a photo if the item is damaged or incorrect.' },
            { step: '3', title: 'Vendor reviews your request', desc: 'The vendor has 48 hours to approve or dispute your return request.' },
            { step: '4', title: 'Ship the item back', desc: 'Once approved, you\'ll receive return shipping instructions. For damaged/wrong items, the vendor covers return shipping.' },
            { step: '5', title: 'Refund processed', desc: 'Once the vendor receives and inspects the item, your refund is processed within 5â7 business days.' },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-[#C9A84C] text-[#0A0A0A] text-sm font-black flex items-center justify-center shrink-0">{item.step}</div>
              <div>
                <p className="font-semibold text-[#F5F0E8]">{item.title}</p>
                <p className="text-sm text-[#9A8F7A] mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Refund timeline */}
      <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-5 space-y-2 text-sm text-[#9A8F7A]">
        <p className="font-semibold text-[#F5F0E8] mb-2">Refund Timeline</p>
        <p>â¢ <span className="text-[#F5F0E8]">Cash on Delivery orders:</span> Refund issued via WiPay or online bank transfer within 5â7 business days.</p>
        <p>â¢ <span className="text-[#F5F0E8]">Card/Linx payments:</span> Refund returned to your original payment method within 5â7 business days.</p>
        <p>â¢ <span className="text-[#F5F0E8]">Online banking:</span> Refund sent directly to your bank account within 5â7 business days.</p>
      </div>

      <div className="text-center pt-2">
        <p className="text-[#9A8F7A] text-sm">Still have questions? <Link href="/help/contact" className="text-[#C9A84C] hover:underline font-medium">Contact our support team</Link></p>
      </div>
    </div>
  )
}
