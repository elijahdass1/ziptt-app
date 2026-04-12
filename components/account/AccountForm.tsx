'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { Loader2, Save, MapPin, Plus, Trash2 } from 'lucide-react'
import { DELIVERY_REGIONS, type DeliveryRegion } from '@/lib/utils'

interface Address {
  id: string
  label: string
  street: string
  city: string
  region: string
  isDefault: boolean
}

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  addresses: Address[]
}

export function AccountForm({ user }: { user: User }) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.name ?? '')
  const [addresses, setAddresses] = useState<Address[]>(user.addresses)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddr, setNewAddr] = useState<{ label: string; street: string; city: string; region: DeliveryRegion }>(
    { label: 'Home', street: '', city: '', region: DELIVERY_REGIONS[0] }
  )

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Profile updated!' })
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddr),
      })
      if (!res.ok) throw new Error()
      const addr = await res.json()
      setAddresses([...addresses, addr])
      setShowAddAddress(false)
      setNewAddr({ label: 'Home', street: '', city: '', region: DELIVERY_REGIONS[0] as DeliveryRegion })
      toast({ title: 'Address added!' })
    } catch {
      toast({ title: 'Failed to add address', variant: 'destructive' })
    }
  }

  const deleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setAddresses(addresses.filter((a) => a.id !== id))
      toast({ title: 'Address removed' })
    } catch {
      toast({ title: 'Failed to remove address', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Profile Information</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              value={user.email ?? ''}
              disabled
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile
          </button>
        </form>
      </div>

      {/* Addresses */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Saved Addresses</h2>
          <button onClick={() => setShowAddAddress(!showAddAddress)}
            className="text-sm text-[#D62828] hover:underline flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Address
          </button>
        </div>

        {showAddAddress && (
          <form onSubmit={addAddress} className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
              <input
                value={newAddr.label}
                onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                placeholder="Home, Work…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Street Address *</label>
              <input
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                required
                placeholder="123 Main St, Woodbrook"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                <input
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  required
                  placeholder="Port of Spain"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Region *</label>
                <select
                  value={newAddr.region}
                  onChange={(e) => setNewAddr({ ...newAddr, region: e.target.value as DeliveryRegion })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]"
                >
                  {DELIVERY_REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm px-4 py-2">Add</button>
              <button type="button" onClick={() => setShowAddAddress(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            No saved addresses yet
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">{addr.label}</p>
                    <p className="text-gray-900">{addr.street}</p>
                    <p className="text-gray-500">{addr.city}, {addr.region}</p>
                    {addr.isDefault && (
                      <span className="text-xs text-[#D62828] font-medium">Default</span>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteAddress(addr.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
