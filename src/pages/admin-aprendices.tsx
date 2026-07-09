import { AdminDash } from '@/components/admin/admin-dash'
import { useAdminSession } from '@/components/layout'

export function AdminAprendices() {
  const { logout, token } = useAdminSession()

  return <AdminDash token={token ?? ''} onLogout={logout} />
}
