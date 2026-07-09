import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { OnboardingTab } from '@/components/admin/onboarding-tab'
import { ThemeToggle } from '@/components/ui'

export function AdminOnboarding() {
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
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-10 px-6 py-3.5 flex items-center justify-between"
        style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
            style={{ background: 'var(--grad)', boxShadow: '0 4px 12px var(--primary-glow)' }}
          >
            🛡️
          </div>
          <div>
            <div className="font-bold text-sm leading-tight" style={{ color: 'var(--text-1)' }}>Panel Admin</div>
            <div className="text-xs leading-tight" style={{ color: 'var(--text-3)' }}>.NET Backend Learning</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-2)' }}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* ── Section nav ── */}
      <div className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto px-4 flex gap-1 pt-2">
          {([
            { to: '/admin/aprendices', label: '👥 Aprendices' },
            { to: '/admin/contenido', label: '📚 Contenido' },
            { to: '/admin/onboarding', label: '🧭 Onboarding' },
          ] as const).map(({ to, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className="text-sm font-semibold px-4 py-2 rounded-t-xl transition-all"
                style={active
                  ? { background: 'var(--bg-card)', color: 'var(--primary)', borderBottom: '2px solid var(--primary)' }
                  : { color: 'var(--text-3)' }
                }
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <OnboardingTab token={token} />
      </div>
    </div>
  )
}
