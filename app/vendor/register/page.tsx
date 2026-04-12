'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Upload, CheckCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { slugify, DELIVERY_REGIONS } from '@/lib/utils'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'

const BANK_NAMES = [
  'Republic Bank',
  'First Citizens Bank',
  'Scotiabank',
  'RBC Royal Bank',
  'JMMB Bank',
  'Citibank',
  'Other',
]

export default function VendorRegisterPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1 fields
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    description: '',
    phone: '',
    address: '',
    region: 'Port of Spain',
  })

  // Step 2 KYB fields
  const [kybForm, setKybForm] = useState({
    legalName: '',
    idDocumentType: '',
    idNumber: '',
    businessRegNumber: '',
    bankAccountName: '',
    bankName: '',
  })
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File) => void,
    setPreview: (url: string) => void
  ) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeForm.storeName || !storeForm.description || !storeForm.phone) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' })
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) { router.push('/auth/login?callbackUrl=/vendor/register'); return }

    if (!kybForm.legalName || !kybForm.idDocumentType || !kybForm.idNumber) {
      toast({ title: 'Please fill in all required identity fields', variant: 'destructive' })
      return
    }
    if (!idFile) {
      toast({ title: 'Please upload a photo of your ID', variant: 'destructive' })
      return
    }
    if (!selfieFile) {
      toast({ title: 'Please upload a selfie with your ID', variant: 'destructive' })
      return
    }
    if (!kybForm.bankAccountName || !kybForm.bankName) {
      toast({ title: 'Please fill in bank account details', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      // Build FormData to send files + all fields
      const formData = new FormData()
      formData.append('storeName', storeForm.storeName)
      formData.append('slug', slugify(storeForm.storeName))
      formData.append('description', storeForm.description)
      formData.append('phone', storeForm.phone)
      formData.append('address', storeForm.address)
      formData.append('region', storeForm.region)
      formData.append('legalName', kybForm.legalName)
      formData.append('idDocumentType', kybForm.idDocumentType)
      formData.append('idNumber', kybForm.idNumber)
      formData.append('businessRegNumber', kybForm.businessRegNumber)
      formData.append('bankAccountName', kybForm.bankAccountName)
      formData.append('bankName', kybForm.bankName)
      formData.append('idFile', idFile)
      formData.append('selfieFile', selfieFile)

      const res = await fetch('/api/vendor/register', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error ?? 'Failed to register', variant: 'destructive' })
        return
      }
      toast({ title: 'Application submitted!', description: 'Our team will review your application within 24–48 hours.' })
      router.push('/vendor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏪</div>
          <h1 className="text-3xl font-bold text-[#F5F0E8]">Start Selling on zip.tt</h1>
          <p className="text-[#9A8F7A] mt-2">Join our community of Trinbagonian vendors and reach customers across T&T</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: '✅', title: 'Free to List', desc: 'No upfront costs' },
            { icon: '💰', title: '10% Commission', desc: 'Only on sales' },
            { icon: '📅', title: 'Weekly Payouts', desc: 'Every Friday' },
          ].map((f) => (
            <div key={f.title} className="bg-[#111111] border border-[#C9A84C]/15 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="font-semibold text-[#F5F0E8] text-sm">{f.title}</p>
              <p className="text-xs text-[#9A8F7A]">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s < step ? 'bg-[#C9A84C] text-[#0A0A0A]' :
                s === step ? 'bg-[#C9A84C] text-[#0A0A0A] ring-4 ring-[#C9A84C]/25' :
                'bg-[#1A1A1A] text-[#9A8F7A] border border-[#C9A84C]/20'
              }`}>
                {s < step ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 2 && <div className={`h-px w-16 transition-all ${s < step ? 'bg-[#C9A84C]' : 'bg-[#1A1A1A]'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-[#111111] border border-[#C9A84C]/15 rounded-2xl p-6">
          {/* Step 1: Store Details */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold text-[#F5F0E8] mb-1">Store Details</h2>
              <p className="text-sm text-[#9A8F7A] mb-6">Tell us about your store</p>
              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Store Name *</label>
                  <input
                    value={storeForm.storeName}
                    onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                    placeholder="e.g. Trini Tech Hub, Sasha's Kitchen, D'Mas Camp"
                    required
                    className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                  />
                  {storeForm.storeName && (
                    <p className="text-xs text-[#9A8F7A] mt-1">URL: zip.tt/vendor/{slugify(storeForm.storeName)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Store Description *</label>
                  <textarea
                    value={storeForm.description}
                    onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                    rows={3}
                    placeholder="Tell customers what you sell and what makes your store special..."
                    required
                    className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Phone Number *</label>
                    <input
                      value={storeForm.phone}
                      onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                      placeholder="+1-868-xxx-xxxx"
                      required
                      className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Region</label>
                    <select
                      value={storeForm.region}
                      onChange={(e) => setStoreForm({ ...storeForm, region: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                    >
                      {DELIVERY_REGIONS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Business Address</label>
                  <input
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    placeholder="Your store or pickup address"
                    className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#C9A84C] hover:bg-[#F0C040] text-[#0A0A0A] font-bold rounded-xl transition-colors"
                >
                  Continue to Identity Verification →
                </button>
              </form>
            </>
          )}

          {/* Step 2: KYB / Identity Verification */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-bold text-[#F5F0E8] mb-1">Identity Verification</h2>
              <p className="text-sm text-[#9A8F7A] mb-6">
                Required by law to sell on zip.tt. Your documents are encrypted and never shared with customers.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Identity section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wide">Personal Identity</h3>

                  <div>
                    <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Full Legal Name *</label>
                    <input
                      value={kybForm.legalName}
                      onChange={e => setKybForm({ ...kybForm, legalName: e.target.value })}
                      placeholder="As shown on your ID document"
                      required
                      className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#F5F0E8] mb-1">ID Document Type *</label>
                      <select
                        value={kybForm.idDocumentType}
                        onChange={e => setKybForm({ ...kybForm, idDocumentType: e.target.value })}
                        required
                        className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                      >
                        <option value="">Select type...</option>
                        <option value="national_id">National ID Card</option>
                        <option value="drivers_permit">Driver's Permit</option>
                        <option value="passport">Passport</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#F5F0E8] mb-1">ID Number *</label>
                      <input
                        value={kybForm.idNumber}
                        onChange={e => setKybForm({ ...kybForm, idNumber: e.target.value })}
                        placeholder="e.g. 1234567"
                        required
                        className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Upload ID */}
                  <div>
                    <label className="block text-sm font-medium text-[#F5F0E8] mb-2">Upload ID Photo *</label>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#C9A84C]/30 rounded-xl cursor-pointer hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/5 transition-all">
                      {idPreview ? (
                        <img src={idPreview} alt="ID preview" className="h-full w-full object-contain rounded-xl p-1" />
                      ) : (
                        <div className="text-center">
                          <Upload className="h-5 w-5 text-[#C9A84C] mx-auto mb-1" />
                          <p className="text-sm text-[#9A8F7A]">Front of ID (JPG, PNG — max 5MB)</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={e => handleFileChange(e, setIdFile, setIdPreview)} className="hidden" />
                    </label>
                  </div>

                  {/* Upload Selfie with ID */}
                  <div>
                    <label className="block text-sm font-medium text-[#F5F0E8] mb-2">Selfie Holding ID *</label>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#C9A84C]/30 rounded-xl cursor-pointer hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/5 transition-all">
                      {selfiePreview ? (
                        <img src={selfiePreview} alt="Selfie preview" className="h-full w-full object-contain rounded-xl p-1" />
                      ) : (
                        <div className="text-center">
                          <Upload className="h-5 w-5 text-[#C9A84C] mx-auto mb-1" />
                          <p className="text-sm text-[#9A8F7A]">Photo of you holding the ID (JPG, PNG)</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={e => handleFileChange(e, setSelfieFile, setSelfiePreview)} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Business section */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wide">Business Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Business Registration Number <span className="text-[#9A8F7A] font-normal">(optional)</span></label>
                    <input
                      value={kybForm.businessRegNumber}
                      onChange={e => setKybForm({ ...kybForm, businessRegNumber: e.target.value })}
                      placeholder="e.g. TT-123456 (if registered)"
                      className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Bank section */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-semibold text-[#C9A84C] uppercase tracking-wide">Payout Details</h3>

                  <div>
                    <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Bank Account Name *</label>
                    <input
                      value={kybForm.bankAccountName}
                      onChange={e => setKybForm({ ...kybForm, bankAccountName: e.target.value })}
                      placeholder="Name on your bank account"
                      required
                      className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#9A8F7A] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F5F0E8] mb-1">Bank Name *</label>
                    <select
                      value={kybForm.bankName}
                      onChange={e => setKybForm({ ...kybForm, bankName: e.target.value })}
                      required
                      className="w-full bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
                    >
                      <option value="">Select your bank...</option>
                      {BANK_NAMES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-[#C9A84C]/5 border border-[#C9A84C]/15 rounded-xl p-3">
                  <CheckCircle className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#9A8F7A]">
                    Your documents are encrypted and reviewed only by our compliance team. They are never shared with customers or other vendors.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/8 font-semibold rounded-xl transition-colors text-sm"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-[#C9A84C] hover:bg-[#F0C040] disabled:bg-[#1A1A1A] disabled:text-[#9A8F7A] text-[#0A0A0A] font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? 'Submitting...' : 'Submit Vendor Application'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
