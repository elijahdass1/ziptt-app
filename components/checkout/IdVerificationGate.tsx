'use client'

import { useState } from 'react'
import { Loader2, Shield, Upload, CheckCircle } from 'lucide-react'

interface Props {
  onVerified: () => void
}

export function IdVerificationGate({ onVerified }: Props) {
  const [docType, setDocType] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !docType) { setError('Please select document type and upload a photo'); return }
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('idFile', file)
      form.append('idDocumentType', docType)
      const res = await fetch('/api/account/verify-id', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); return }
      onVerified()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-[var(--bg-secondary)] border border-[#C9A84C]/20 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <Shield className="h-5 w-5 text-[#C9A84C]" />
          </div>
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">Identity Verification Required</h2>
            <p className="text-xs text-[var(--text-secondary)]">Orders over TTD $2,000 require a one-time ID check</p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          This takes less than 2 minutes and only needs to be done once. Your ID is encrypted and only used for fraud prevention — it will never be shared with vendors.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Document Type</label>
            <select value={docType} onChange={e => setDocType(e.target.value)} required
              className="w-full bg-[var(--bg-card)] border border-[#C9A84C]/20 rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]">
              <option value="">Select document type...</option>
              <option value="national_id">National ID Card</option>
              <option value="drivers_permit">Driver&apos;s Permit</option>
              <option value="passport">Passport</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Upload ID Photo</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#C9A84C]/30 rounded-xl cursor-pointer hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/5 transition-all">
              {preview ? (
                <img src={preview} alt="ID preview" className="h-full w-full object-contain rounded-xl p-1" />
              ) : (
                <div className="text-center">
                  <Upload className="h-6 w-6 text-[#C9A84C] mx-auto mb-1" />
                  <p className="text-sm text-[var(--text-secondary)]">Click to upload (JPG, PNG — max 5MB)</p>
                </div>
              )}
              <input type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
            </label>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex items-start gap-2 bg-[#C9A84C]/5 border border-[#C9A84C]/15 rounded-xl p-3">
            <CheckCircle className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-secondary)]">Your document is encrypted and securely stored. Only our fraud prevention team has access — vendors never see your ID.</p>
          </div>

          <button type="submit" disabled={loading || !file || !docType}
            className="w-full py-3 bg-[#C9A84C] hover:bg-[#F0C040] disabled:bg-[var(--bg-card)] disabled:text-[var(--text-secondary)] text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Uploading...' : 'Continue to Checkout →'}
          </button>
        </form>
      </div>
    </div>
  )
}
