'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { DELIVERY_REGIONS } from '@/lib/utils'
import { Loader2, Save } from 'lucide-react'

interface VendorData {
  id: string
  storeName: string
  description: string | null
  phone: string | null
  address: string | null
  region: string | null
}

export function VendorSettingsForm({ vendor }: { vendor: VendorData }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    storeName: vendor.storeName,
    description: vendor.description ?? '',
    phone: vendor.phone ?? '',
    address: vendor.address ?? '',
    region: vendor.region ?? DELIVERY_REGIONS[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/vendor/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Settings saved!' })
    } catch {
      toast({ title: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const field = (label: string, name: keyof typeof form, opts?: { required?: boolean; type?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {opts?.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={opts?.type ?? 'text'}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        required={opts?.required}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]"
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Store Information</h2>
        {field('Store Name', 'storeName', { required: true })}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder="Tell customers about your store…"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]"
          />
        </div>
        {field('Phone Number', 'phone')}
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Location</h2>
        {field('Business Address', 'address')}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
          <select
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]"
          >
            {DELIVERY_REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="btn-primary flex items-center gap-2 px-6 py-2.5">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </button>
    </form>
  )
}
