export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.vendor.findUnique({ where: { userId: session.user.id } })
  if (existing) return NextResponse.json({ error: 'Already registered as vendor' }, { status: 409 })

  try {
    const contentType = req.headers.get('content-type') ?? ''

    let storeName: string, slug: string, description: string, phone: string, address: string, region: string
    let idDocumentType: string | null = null
    let idDocumentUrl: string | null = null
    let selfieUrl: string | null = null
    let businessRegUrl: string | null = null
    let bankInfo: string | null = null
    let bankName: string | null = null
    let bankAccountName: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      storeName = formData.get('storeName') as string
      slug = formData.get('slug') as string
      description = formData.get('description') as string
      phone = formData.get('phone') as string
      address = formData.get('address') as string
      region = formData.get('region') as string
      idDocumentType = formData.get('idDocumentType') as string | null
      const legalName = formData.get('legalName') as string | null
      bankAccountName = formData.get('bankAccountName') as string | null
      bankName = formData.get('bankName') as string | null
      const businessRegNumber = formData.get('businessRegNumber') as string | null
      const idNumber = formData.get('idNumber') as string | null

      if (bankAccountName && bankName) {
        bankInfo = JSON.stringify({ accountName: bankAccountName, bankName, legalName, idNumber, businessRegNumber })
      }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'vendor-ids')
      await mkdir(uploadDir, { recursive: true })

      const idFile = formData.get('idFile') as File | null
      if (idFile && idFile.size > 0) {
        const ext = idFile.name.split('.').pop() ?? 'jpg'
        const filename = `${session.user.id}-id-${Date.now()}.${ext}`
        const bytes = await idFile.arrayBuffer()
        await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))
        idDocumentUrl = `/uploads/vendor-ids/${filename}`
      }

      const selfieFile = formData.get('selfieFile') as File | null
      if (selfieFile && selfieFile.size > 0) {
        const ext = selfieFile.name.split('.').pop() ?? 'jpg'
        const filename = `${session.user.id}-selfie-${Date.now()}.${ext}`
        const bytes = await selfieFile.arrayBuffer()
        await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))
        selfieUrl = `/uploads/vendor-ids/${filename}`
      }
    } else {
      const body = await req.json()
      storeName = body.storeName
      slug = body.slug
      description = body.description
      phone = body.phone
      address = body.address
      region = body.region
    }

    if (!storeName || !slug) return NextResponse.json({ error: 'Store name required' }, { status: 400 })

    const slugExists = await prisma.vendor.findUnique({ where: { slug } })
    const finalSlug = slugExists ? `${slug}-${Date.now()}` : slug

    const vendor = await prisma.vendor.create({
      data: {
        userId: session.user.id,
        storeName,
        slug: finalSlug,
        description,
        phone,
        address,
        region,
        bankInfo: bankInfo ?? undefined,
        idDocumentType: idDocumentType ?? undefined,
        idDocumentUrl: idDocumentUrl ?? undefined,
        selfieUrl: selfieUrl ?? undefined,
        businessRegUrl: businessRegUrl ?? undefined,
        bankName: bankName ?? undefined,
        bankAccountName: bankAccountName ?? undefined,
        status: 'PENDING',
      },
    })

    // Update user role
    await prisma.user.update({ where: { id: session.user.id }, data: { role: 'VENDOR' } })

    console.log(`\nðª VENDOR APPLICATION: ${storeName} â ${session.user.email ?? session.user.id}\n`)

    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    console.error('[zip.tt API Error]:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
