'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { Loader2, X, Trash2 } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { UploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'

interface Category { id: string; name: string }
interface Vendor { id: string; storeName: string }

interface AdminProductFormProps {
  categories: Category[]
  vendors: Vendor[]
  product?: {
    id: string; name: string; description: string; price: number; comparePrice?: number | null
    images: string[]; stock: number; sku?: string | null; tags: string[]
    categoryId: string; vendorId: string; status: string; featured: boolean
  }
}

export function AdminProductForm({ categories, vendors, product }: AdminProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    comparePrice: product?.comparePrice?.toString() ?? '',
    imageUrls: product?.images ?? [] as string[],
    stock: product?.stock?.toString() ?? '0',
    sku: product?.sku ?? '',
    tags: product?.tags ?? [] as string[],
    categoryId: product?.categoryId ?? categories[0]?.id ?? '',
    vendorId: product?.vendorId ?? vendors[0]?.id ?? '',
    status: product?.status ?? 'ACTIVE',
    featured: product?.featured ?? false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.description || !form.price || !form.categoryId || !form.vendorId) {
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
        images: form.imageUrls,
        stock: parseInt(form.stock) || 0,
        sku: form.sku || null,
        tags: form.tags,
        categoryId: form.categoryId,
        vendorId: form.vendorId,
        status: form.status,
        featured: form.featured,
      }

      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      toast({ title: product ? 'Product updated!' : 'Product created!' })
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      toast({ title: err.message || 'Failed to save product', variant: 'destructive' })
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

  const fieldCls = 'w-full bg-[var(--bg-primary)] border border-[#333] text-[var(--text-primary)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent placeholder:text-[#555]'
  const labelCls = 'block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide'
  const cardCls = 'bg-[var(--bg-secondary)] border border-[#C9A84C]/15 rounded-2xl p-5 space-y-4'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className={cardCls}>
        <h2 className="font-semibold text-[var(--text-primary)]">Basic Information</h2>
        <div>
          <label className={labelCls}>Product Name *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Samsung Galaxy A55 5G" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls}>Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5} placeholder="Describe the product in detail..."
            className={fieldCls} />
        </div>
        <div>
          <label className={labelCls}>Vendor *</label>
          <select value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
            className={fieldCls}>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.storeName}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Category *</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className={fieldCls}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className={cardCls}>
        <h2 className="font-semibold text-[var(--text-primary)]">Pricing & Inventory</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Price (TTD) *</label>
            <input type="number" step="0.01" min="0" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00"
              className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Compare-At Price (TTD)</label>
            <input type="number" step="0.01" min="0" value={form.comparePrice}
              onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} placeholder="Original price"
              className={fieldCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Stock Quantity *</label>
            <input type="number" min="0" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0"
              className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>SKU</label>
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g. SAM-A55-BLK" className={fieldCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Listing Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={fieldCls}>
              <option value="ACTIVE">Active — visible to shoppers</option>
              <option value="DRAFT">Draft — hidden from shoppers</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="featured" checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 accent-[#C9A84C]" />
            <label htmlFor="featured" className="text-sm text-[var(--text-primary)]">Featured product</label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className={cardCls}>
        <h2 className="font-semibold text-[var(--text-primary)]">Product Images</h2>
        {form.imageUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {form.imageUrls.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-[#333] bg-[var(--bg-card)]">
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
        <div className="border-2 border-dashed border-[#333] rounded-xl p-4 text-center">
          <UploadButton<OurFileRouter, 'productImageUploader'>
            endpoint="productImageUploader"
            onClientUploadComplete={(res) => {
              const newUrls = res.map((f) => f.ufsUrl)
              setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...newUrls] }))
              toast({ title: `${res.length} image${res.length > 1 ? 's' : ''} uploaded!` })
            }}
            onUploadError={(error) => {
              console.error('Upload error:', error)
              toast({ title: 'Upload failed', variant: 'destructive' })
            }}
            appearance={{
              button: 'bg-[#C9A84C] hover:bg-[#F0C040] text-black font-semibold rounded-xl px-4 py-2 text-sm ut-uploading:bg-[#8B6914]',
              allowedContent: 'text-xs text-[#888]',
            }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className={cardCls}>
        <h2 className="font-semibold text-[var(--text-primary)]">Tags</h2>
        <div className="flex gap-2">
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="Add a tag and press Enter"
            className={fieldCls} />
          <button type="button" onClick={addTag}
            className="px-4 py-2.5 border border-[#333] text-[var(--text-secondary)] rounded-xl text-sm hover:border-[#C9A84C] transition-colors">
            Add
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 px-2.5 py-1 rounded-full text-xs font-medium">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-[#C9A84C]/60 hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.push('/admin/products')}
          className="flex-1 px-4 py-2.5 border border-[#333] text-[var(--text-secondary)] rounded-xl text-sm hover:border-[#C9A84C] transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#b8963f] text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
