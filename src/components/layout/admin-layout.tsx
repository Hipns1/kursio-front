import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui'
import { Brand } from './brand'
import { TopBar, TopBarButton } from './top-bar'

const SECTIONS = [
  { label: 'Aprendices', to: '/admin/aprendices' },
  { label: 'Contenido', to: '/admin/contenido' },
  { label: 'Onboarding', to: '/admin/onboarding' }
]

export function useAdminSession() {
  const navigate = useNavigate()
  const token = sessionStorage.getItem('admin_token')

  const logout = () => {
    sessionStorage.removeItem('admin_token')
    navigate('/admin/login', { replace: true })
  }

  return { logout, token }
}

export function AdminLayout() {
  const { logout, token } = useAdminSession()

  if (!token) return <Navigate to='/admin/login' replace />

  return (
    <div className='bg-surface min-h-screen'>
      <TopBar
        actions={
          <>
            <ThemeToggle />
            <TopBarButton onClick={logout}>Cerrar sesión</TopBarButton>
          </>
        }
      >
        <Brand to='/admin/aprendices' subtitle='Administración' />
        <nav className='ml-4 hidden items-center gap-1 sm:flex'>
          {SECTIONS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-fg bg-tint-strong' : 'text-fg-subtle hover:text-fg-muted'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </TopBar>

      <Outlet />
    </div>
  )
}
