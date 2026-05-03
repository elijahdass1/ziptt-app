// Share row that sits below Add-to-Cart on the product detail page.
// Two buttons — WhatsApp (primary, brand green) and Copy Link
// (secondary, gold outline). WhatsApp gets a hand-rolled SVG so we
// don't pull in another icon set.
'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface Props {
  product: {
    name: string
    slug: string
    price: number
  }
}

export function ShareRow({ product }: Props) {
  const [copied, setCopied] = useState(false)

  // Build the public product URL. We use window.location.origin when
  // available (client component) so deploy preview / staging links
  // share their own URL, not prod.
  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/products/${product.slug}`
      : `https://ziptt-prod.vercel.app/products/${product.slug}`

  const message = `Check out ${product.name} on zip.tt for $${product.price.toFixed(2)} TTD! ${productUrl}`
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(message)}`

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(productUrl)
      setCopied(true)
      toast({ title: 'Link copied!', description: 'Paste anywhere to share.' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Could not copy', variant: 'destructive' })
    }
  }

  return (
    <div className="flex gap-3">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold rounded-xl transition-colors text-sm"
        aria-label="Share on WhatsApp"
      >
        <WhatsAppIcon />
        Share on WhatsApp
      </a>
      <button
        onClick={onCopy}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 font-semibold rounded-xl transition-colors text-sm"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}

function WhatsAppIcon() {
  // Inline SVG so we don't pull in a new icon dependency just for the
  // brand glyph. Path is the standard WhatsApp logo (CC0 trace).
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/>
    </svg>
  )
}
