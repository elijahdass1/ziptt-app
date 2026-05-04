// Typed React helpers for our UploadThing file router. Importing
// `useUploadThing` from here gives us autocomplete on endpoint names
// and on the response shape from onClientUploadComplete.
'use client'

import { generateReactHelpers } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>()
