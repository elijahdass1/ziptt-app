import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dispute = await prisma.dispute.findUnique({
    where: { id: params.id },
    include: {
      order: { select: { orderNumber: true, total: true, status: true } },
      vendor: { select: { storeName: true } },
    },
  })
  if (!dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })

  // Only allow the customer or their vendor to view
  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id }, select: { id: true } })
  const isCustomer = dispute.customerId === session.user.id
  const isVendor = vendor ? dispute.vendorId === vendor.id : false
  const isAdmin = session.user.role === 'ADMIN'

  if (!isCustomer && !isVendor && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(dispute)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dispute = await prisma.dispute.findUnique({ where: { id: params.id } })
  if (!dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })

  const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id }, select: { id: true } })
  const isCustomer = dispute.customerId === session.user.id
  const isVendor = vendor ? dispute.vendorId === vendor.id : false
  const isAdmin = session.user.role === 'ADMIN'

  if (!isCustomer && !isVendor && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { message } = await req.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const senderName = session.user.name ?? 'User'
  const timestamp = new Date().toLocaleString('en-TT')
  const appendedNote = `\n\n[${timestamp} - ${senderName}]: ${message.trim()}`

  const updated = await prisma.dispute.update({
    where: { id: params.id },
    data: {
      description: dispute.description + appendedNote,
    },
  })

  return NextResponse.json(updated)
}
