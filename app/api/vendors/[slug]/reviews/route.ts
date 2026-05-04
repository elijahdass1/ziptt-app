// Vendor-level reviews endpoint — temporarily stubbed.
//
// The original implementation used a `VendorReview` model that has
// since been removed from prisma/schema.prisma (the schema now only
// has product-level Review). Calling this route used to 500 with
// `prisma.vendorReview is not a function`. Until the model is added
// back, GET returns an empty list and POST returns 503 with a
// helpful message.
//
// To restore: re-add the VendorReview model + relation in schema.prisma,
// run `npx prisma migrate dev`, and revert this file from the previous
// commit (look in git history for the full POST flow incl. eligibility
// check, dedupe, and aggregate recompute on the Vendor row).
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  _ctx: { params: { slug: string } }
) {
  return NextResponse.json([])
}

export async function POST(
  _req: NextRequest,
  _ctx: { params: { slug: string } }
) {
  return NextResponse.json(
    { error: 'Vendor reviews are temporarily unavailable. Email support@zip.tt to leave feedback.' },
    { status: 503 }
  )
}
