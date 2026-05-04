'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { Loader2, X, ImagePlus, Trash2 } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { UploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'

interface Category { id: string; name: string }

interface ProductFormProps {
  categories: Category[]
  vendorId: string
  product?: {
    id: string; name: string; description: string; price: number; comparePrice?: number | null
    images: string[]; stock: number; sku?: string | null; tags: string[]; categoryId: string; status: string
  }
}

export function ProductForm({ categories, vendorId, product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    comparePrice: product?.comparePrice?.toString() ?? '',
    imageUrls: product?.images ?? [] as string[],
    images: product?.images?.join('\n') ?? '',
    stock: product?.stock?.toString() ?? '0',
    sku: product?.sku ?? '',
    tags: product?.tags ?? [] as string[],
    categoryId: product?.categoryId ?? categories[0]?.id ?? '',
    status: product?.status ?? 'ACTIVE',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.description || !form.price || !form.categoryId) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const body = {
        name: form.name,
        slug: slugify(form.name),
        description: form.description,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        images: form.imageUrls.length > 0 ? form.imageUrls : form.images.split('\n').map((s) => s.trim()).filter(Boolean),
        stock: parseInt(form.stock) || 0,
        sku: form.sku || null,
        tags: form.tags,
        categoryId: form.categoryId,
        vendorId,
        status: form.status,
      }

      const url = product ? `/api/vendor/products/${product.id}` : '/api/vendor/products'
      const method = product ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error()
      toast({ title: product ? 'Product updated!' : 'Product listed!' })
      router.push('/vendor/products')
      router.refresh()
    } catch {
      toast({ title: 'Failed to save product', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] })
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Samsung Galaxy A55 5G"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5} placeholder="Describe your product in detail — features, condition, what's included..."
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Pricing & Inventory</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (TTD) *</label>
            <input type="number" step="0.01" min="0" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compare-At Price (TTD)</label>
            <input type="number" step="0.01" min="0" value={form.comparePrice}
              onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} placeholder="Original price"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
            <input type="number" min="0" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g. SAM-A55-BLK"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Listing Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]">
            <option value="ACTIVE">Active — visible to shoppers</option>
            <option value="DRAFT">Draft — hidden from shoppers</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Product Images</h2>
        <div className="space-y-3">
          {/* Image previews */}
          {form.imageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {form.imageUrls.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrls: form.imageUrls.filter((_, j) => j !== i) })}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">Main</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Upload button */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
            <UploadButton<OurFileRouter, 'productImageUploader'>
              endpoint="productImageUploader"
              onClientUploadComplete={(res) => {
                const newUrls = res.map((f) => f.ufsUrl)
                setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...newUrls] }))
                toast({ title: `${res.length} image${res.length > 1 ? 's' : ''} uploaded!` })
              }}
              onUploadError={(error) => {
                console.error('Upload error:', error)
                toast({ title: 'Upload failed — try a URL instead', variant: 'destructive' })
              }}
              appearance={{
                button: 'bg-[#C9A84C] hover:bg-[#F0C040] text-black font-semibold rounded-xl px-4 py-2 text-sm ut-uploading:bg-[#8B6914]',
                allowedContent: 'text-xs text-gray-400',
              }}
            />
          </div>
          {/* Manual URL fallback */}
          <details className="text-sm">
            <summary className="text-gray-400 cursor-pointer hover:text-gray-600 select-none">
              Or paste image URLs manually ↓
            </summary>
            <div className="mt-2">
              <textarea
                value={form.images}
                onChange={(e) => {
                  const urls = e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                  setForm({ ...form, images: e.target.value, imageUrls: [...new Set([...form.imageUrls, ...urls])] })
                }}
                rows={3}
                placeholder="https://example.com/photo.jpg"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              />
            </div>
          </details>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Tags</h2>
        <div className="flex gap-2">
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="Add a tag and press Enter"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D62828]" />
          <button type="button" onClick={addTag} className="btn-secondary">Add</button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.push('/vendor/products')} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Saving...' : product ? 'Update Product' : 'List Product'}
        </button>
      </div>
    </form>
  )
}
