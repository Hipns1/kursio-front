import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ContentTab } from '@/components/admin/content-tab'
import { ThemeToggle } from '@/components/ui'

export function AdminContenido() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = sessionStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) navigate('/admin', { replace: true })
  }, [token, navigate])

  if (!token) return null

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token')
    navigate('/admin', { replace: true })
  }

  return (
    <div className='bg-surface min-h-screen'>
      <nav className='bg-nav border-hairline sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3.5 backdrop-blur-[20px]'>
        <div className='flex items-center gap-3'>
          <div
            className='flex h-8 w-8 items-center justify-center rounded-xl text-base'
            style={{ background: 'var(--grad)', boxShadow: '0 4px 12px var(--primary-glow)' }}
          >
            🛡️
          </div>
          <div>
            <div className='text-fg text-sm leading-tight font-bold'>Panel Admin</div>
            <div className='text-fg-subtle text-xs leading-tight'>.NET Backend Learning</div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className='border-hairline text-fg-muted bg-tint rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className='border-hairline border-b'>
        <div className='mx-auto flex max-w-6xl gap-1 px-4 pt-2'>
          {(
            [
              { label: '👥 Aprendices', to: '/admin/aprendices' },
              { label: '📚 Contenido', to: '/admin/contenido' },
              { label: '🧭 Onboarding', to: '/admin/onboarding' }
            ] as const
          ).map(({ label, to }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className='rounded-t-xl px-4 py-2 text-sm font-semibold transition-all'
                style={
                  active
                    ? {
                        background: 'var(--bg-card)',
                        borderBottom: '2px solid var(--primary)',
                        color: 'var(--primary)'
                      }
                    : { color: 'var(--text-3)' }
                }
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className='mx-auto max-w-6xl px-4 py-8'>
        <ContentTab token={token} onUnauthorized={handleLogout} />
      </div>
    </div>
  )
}
