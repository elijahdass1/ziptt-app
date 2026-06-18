import { getServerSession, type Session } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

type AdminGuardResult =
  | { ok: true; session: Session }
  | { ok: false; response: NextResponse }

// Shared server-side gate for every /api/admin/* route. The admin UI is
// NOT a security boundary on its own — every route must call this before
// touching data.
export async function requireAdmin(): Promise<AdminGuardResult> {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: session ? 403 : 401 }),
    }
  }
  return { ok: true, session }
}
