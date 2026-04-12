export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { DollarSign, Calendar, Percent, CheckCircle } from 'lucide-react'

export const metadata = { title: 'Fees & Commission â zip.tt' }

export default function VendorFeesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <DollarSign className="h-5 w-5 text-[#C9A84C]" />
          </div>
          <h1 className="text-3xl font-black text-[#F5F0E8]">Fees & Commission</h1>
        </div>
        <p className="text-[#9A8F7A] leading-relaxed">
          Simple, transparent pricing. You only pay when you sell â no monthly fees, no listing fees, no surprises.
        </p>
      </div>

      {/* Key numbers */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: CheckCircle, value: 'Free', label: 'To join & list', desc: 'No signup fee. No listing fee. Add unlimited products.' },
          { icon: Percent,     value: '10%',  label: 'Commission',    desc: 'zip.tt takes 10% of each sale. That\'s all.' },
          { icon: Calendar,    value: 'Friday', label: 'Payout day',   desc: 'Weekly payouts every Friday directly to your account.' },
        ].map((item) => (
          <div key={item.label} className="bg-[#111111] border border-[#C9A84C]/20 rounded-2xl p-5 text-center">
            <div className="flex justify-center mb-2">
              <item.icon className="h-5 w-5 text-[#C9A84C]" />
            </div>
            <p className="text-3xl font-black text-[#C9A84C]">{item.value}</p>
            <p className="text-sm font-semibold text-[#F5F0E8] mt-1">{item.label}</p>
            <p className="text-xs text-[#9A8F7A] mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Commission breakdown */}
      <div>
        <h2 className="text-xl font-bold text-[#F5F0E8] mb-4">How Commission Works</h2>
        <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#C9A84C]/15">
                <th className="text-left px-5 py-3 text-[#C9A84C] font-semibold">Example Sale</th>
                <th className="text-right px-5 py-3 text-[#C9A84C] font-semibold">You Receive</th>
              </tr>
            </thead>
            <tbody>
              {[
                { sale: 'TTD $100 product', vendor: 'TTD $90.00' },
                { sale: 'TTD $500 product', vendor: 'TTD $450.00' },
                { sale: 'TTD $1,000 product', vendor: 'TTD $900.00' },
                { sale: 'TTD $5,000 product', vendor: 'TTD $4,500.00' },
              ].map((row, i) => (
                <tr key={row.sale} className={`border-b border-[#C9A84C]/10 ${i % 2 === 0 ? '' : 'bg-[#0A0A0A]/40'}`}>
                  <td className="px-5 py-3 text-[#9A8F7A]">{row.sale}</td>
                  <td className="px-5 py-3 text-right font-semibold text-[#F5F0E8]">{row.vendor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#9A8F7A] mt-2 px-1">Commission is deducted before payout. Delivery fees (if applicable) are separate and go to the courier.</p>
      </div>

      {/* Payout schedule */}
      <div>
        <h2 className="text-xl font-bold text-[#F5F0E8] mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#C9A84C]" /> Payout Schedule
        </h2>
        <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-5 space-y-3 text-sm text-[#9A8F7A]">
          <p>â¢ Payouts are processed every <span className="text-[#F5F0E8] font-semibold">Friday</span> for all orders fulfilled and delivered that week.</p>
          <p>â¢ Funds are transferred directly to your registered bank account or WiPay wallet.</p>
          <p>â¢ Orders must be in <span className="text-[#F5F0E8]">Delivered</span> status by Wednesday midnight to qualify for that week's payout.</p>
          <p>â¢ A payout statement is emailed to you every Friday detailing each transaction.</p>
          <p>â¢ Minimum payout amount: <span className="text-[#F5F0E8] font-semibold">TTD $50</span>. Balances below this roll over to the following week.</p>
        </div>
      </div>

      {/* No hidden fees */}
      <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-5">
        <p className="font-semibold text-[#F5F0E8] mb-3">â No Hidden Fees â Ever</p>
        <div className="grid sm:grid-cols-2 gap-2 text-sm text-[#9A8F7A]">
          {['No monthly subscription', 'No listing fee', 'No setup fee', 'No withdrawal fee', 'No featured listing upsell', 'No per-photo charges'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/vendor/register"
          className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A0A0A] font-bold px-8 py-3 rounded-full hover:bg-[#F0C040] transition-colors">
          Start Selling Free â
        </Link>
      </div>
    </div>
  )
}
