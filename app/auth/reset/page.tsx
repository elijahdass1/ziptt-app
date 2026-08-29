export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { ResetPasswordClient } from './ResetPasswordClient'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A84C]" /></div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}
