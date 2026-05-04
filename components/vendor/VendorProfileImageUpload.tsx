// Drag-drop uploader for the vendor's logo OR cover photo.
//
// Uses the `vendorImageUploader` UploadThing endpoint, then PATCHes
// /api/vendor/settings with { [field]: url } so the change persists. The
// parent supplies `field` and the current value; we report the new URL up
// via onComplete so optimistic UI doesn't have to wait for a refetch.
//
// Two visual variants: 'logo' (square) and 'cover' (16:6 wide).
'use client'

import { useCallback, useState } from 'react'
import { Loader2, Upload, ImagePlus } from 'lucide-react'
import { useUploadThing } from '@/lib/uploadthing-client'
import { toast } from '@/components/ui/use-toast'

interface Props {
  field: 'logo' | 'coverImage'
  variant: 'logo' | 'cover'
  currentUrl: string | null
  onComplete?: (newUrl: string) => void
  className?: string
}

export function VendorProfileImageUpload({
  field,
  variant,
  currentUrl,
  onComplete,
  className,
}: Props) {
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)

  const { startUpload, isUploading } = useUploadThing('vendorImageUploader', {
    onClientUploadComplete: async (res) => {
      const uploaded = res?.[0]
      if (!uploaded?.ufsUrl) {
        toast({ title: 'Upload finished but no URL came back', variant: 'destructive' })
        return
      }
      setSaving(true)
      try {
        const apiRes = await fetch('/api/vendor/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: uploaded.ufsUrl }),
        })
        if (!apiRes.ok) throw new Error(await apiRes.text())
        onComplete?.(uploaded.ufsUrl)
        toast({ title: variant === 'logo' ? 'Logo updated' : 'Cover photo updated' })
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
        toast({ title: 'Only image files are accepted', variant: 'destructive' })
        return
      }
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
      e.target.value = ''
    },
    [acceptFiles]
  )

  const busy = isUploading || saving

  // Two shape variants — logo is a square tile, cover stretches wide.
  const shapeCls =
    variant === 'logo'
      ? 'aspect-square w-32 sm:w-40'
      : 'aspect-[16/6] w-full'

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        if (!dragging) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={[
        'relative block cursor-pointer overflow-hidden border-2 border-dashed transition-all',
        variant === 'logo' ? 'rounded-2xl' : 'rounded-xl',
        shapeCls,
        dragging
          ? 'border-[#C9A84C] bg-[#C9A84C]/10 scale-[1.01]'
          : 'border-gray-300 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5',
        className ?? '',
      ].join(' ')}
    >
      {currentUrl && (
        <img
          src={currentUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center px-3 bg-black/10">
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
            <span className="text-xs font-semibold text-[#C9A84C]">Drop to upload</span>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-gray-700 drop-shadow" />
            <span className="text-xs font-semibold text-gray-800 drop-shadow leading-tight">
              {currentUrl ? 'Change' : 'Upload'} {variant === 'logo' ? 'logo' : 'cover photo'}
            </span>
            <span className="text-[10px] text-gray-600 drop-shadow">
              {variant === 'logo' ? 'Square (1:1)' : 'Wide (16:6)'}
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
