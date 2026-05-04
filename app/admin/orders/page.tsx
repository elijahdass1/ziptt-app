export const dynamic = 'force-dynamic'
import { AdminOrdersClient } from './AdminOrdersClient'

export default function AdminOrdersPage() {
  // Layout already gates ADMIN role at app/admin/layout.tsx.
  return <AdminOrdersClient />
}
