'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

export function VendorProductActions({ productId }: { productId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/vendor/products/${productId}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Product deleted' })
        router.refresh()
      } else {
        throw new Error()
      }
    } catch {
      toast({ title: 'Failed to delete product', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
      <Trash2 className="h-3.5 w-3.5" />
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
