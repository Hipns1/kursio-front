import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminDash } from '@/components/admin/admin-dash'

export function AdminAprendices() {
  const navigate = useNavigate()
  const token = sessionStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) navigate('/admin', { replace: true })
  }, [token, navigate])

  if (!token) return null

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token')
    navigate('/admin', { replace: true })
  }

  return <AdminDash token={token} onLogout={handleLogout} />
}
