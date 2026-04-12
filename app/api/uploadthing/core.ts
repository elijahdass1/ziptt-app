import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const f = createUploadthing()

export const ourFileRouter = {
  productImageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions)
      if (!session || (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN')) {
        throw new Error('Unauthorized')
      }
      return { uploadedBy: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('[ziptt] Upload complete by:', metadata.uploadedBy, 'url:', file.ufsUrl)
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
