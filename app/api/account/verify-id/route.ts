import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const idFile = formData.get('idFile') as File | null
    const idDocumentType = formData.get('idDocumentType') as string | null

    if (!idFile || !idDocumentType) {
      return Response.json({ error: 'Document type and file are required' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (idFile.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(idFile.type)) {
      return Response.json({ error: 'Invalid file type. Use JPG, PNG, WebP or PDF.' }, { status: 400 })
    }

    const ext = idFile.name.split('.').pop() ?? 'jpg'
    const filename = `${session.user.id}-${Date.now()}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ids')

    await mkdir(uploadDir, { recursive: true })
    const bytes = await idFile.arrayBuffer()
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))

    const idDocumentUrl = `/uploads/ids/${filename}`

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        idDocumentUrl,
        idDocumentType,
        idVerified: true,
        idVerifiedAt: new Date(),
      },
    })

    console.log(`[zip.tt] ID uploaded for user ${session.user.id}: ${idDocumentType}`)

    return Response.json({ success: true, idDocumentUrl })
  } catch (error) {
    console.error('[zip.tt API Error]:', error)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
