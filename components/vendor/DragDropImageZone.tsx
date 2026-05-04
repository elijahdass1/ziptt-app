'use client'

// Reusable drag-and-drop zone for replacing a single product's image set.
// On drop or file pick:
//   1. Upload to UploadThing (uses our productImageUploader endpoint)
//   2. POST the resulting URL to /api/vendor/products/[productId]/replace-image
//   3. Call onComplete(newUrl) so the parent can update its UI optimistically
//
// Renders the current image as the background so the vendor sees what they're
// replacing. While uploading, shows a spinner overlay. While dragging, shows
// a highlighted gold border.
import { useCallback, useState } from 'react'
import { Loader2, Upload, ImagePlus } from 'lucide-react'
import { useUploadThing } from '@/lib/uploadthing-client'
import { toast } from '@/components/ui/use-toast'

interface Props {
  productId: string
  currentImage: string | null
  /** Replace existing image set entirely (default) or push to front of it */
  position?: 'replace' | 'prepend'
  /** Fired with the new URL after both upload + DB update succeed */
  onComplete?: (newUrl: string) => void
  className?: string
}

export function DragDropImageZone({
  productId,
  currentImage,
  position = 'replace',
  onComplete,
  className,
}: Props) {
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)

  const { startUpload, isUploading } = useUploadThing('productImageUploader', {
    onClientUploadComplete: async (res) => {
      const uploaded = res?.[0]
      if (!uploaded?.ufsUrl) {
        toast({ title: 'Upload finished but no URL came back', variant: 'destructive' })
        return
      }
      // Persist to the product row.
      setSaving(true)
      try {
        const apiRes = await fetch(`/api/vendor/products/${productId}/replace-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: uploaded.ufsUrl, position }),
        })
        if (!apiRes.ok) throw new Error(await apiRes.text())
        onComplete?.(uploaded.ufsUrl)
        toast({ title: 'Photo updated' })
      } catch (e: any) {
        toast({ title: 'Upload saved, but DB update failed', description: e?.message, variant: 'destructive' })
      } finally {
        setSaving(false)
      }
    },
    onUploadError: (err) => {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' })
    },
  })

  const acceptFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (arr.length === 0) {
        toast({ title: 'Only image files (jpg, png, webp) are accepted', variant: 'destructive' })
        return
      }
      // Upload only the first file — this zone replaces ONE image. Multi-image
      // upload still happens through the existing ProductForm UploadButton.
      startUpload([arr[0]])
    },
    [startUpload]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (e.dataTransfer.files?.length) acceptFiles(e.dataTransfer.files)
    },
    [acceptFiles]
  )

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) acceptFiles(e.target.files)
      // reset so the same file can be chosen twice in a row
      e.target.value = ''
    },
    [acceptFiles]
  )

  const busy = isUploading || saving

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        if (!dragging) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={[
        'relative block aspect-square w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all',
        dragging
          ? 'border-[#C9A84C] bg-[#C9A84C]/10 scale-[1.02]'
          : 'border-gray-300 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5',
        className ?? '',
      ].join(' ')}
    >
      {/* Background: the current (probably bad) image */}
      {currentImage && (
        <img
          src={currentImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      )}

      {/* Foreground content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center px-3">
        {busy ? (
          <>
            <Loader2 className="h-7 w-7 animate-spin text-[#C9A84C]" />
            <span className="text-xs font-medium text-[#C9A84C]">
              {isUploading ? 'Uploading…' : 'Saving…'}
            </span>
          </>
        ) : dragging ? (
          <>
            <Upload className="h-7 w-7 text-[#C9A84C]" />
            <span className="text-xs font-semibold text-[#C9A84C]">
              Drop to replace
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-gray-600" />
            <span className="text-xs font-semibold text-gray-700 leading-tight">
              Drop image here
              <br />
              <span className="text-gray-500 font-normal">or click to browse</span>
            </span>
          </>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onPick}
        disabled={busy}
      />
    </label>
  )
}
