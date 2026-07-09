import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '@/services/backend'
import { DarkInput, PrimaryBtn } from '@/components/ui'

export function Admin() {
  const navigate = useNavigate()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem('admin_token')) navigate('/admin/aprendices', { replace: true })
  }, [navigate])

  const handleLogin = async () => {
    if (!user.trim() || !pass.trim()) return
    setLoading(true)
    setError('')
    try {
      const result = await adminLogin(user.trim(), pass)
      sessionStorage.setItem('admin_token', result.accessToken)
      navigate('/admin/aprendices', { replace: true })
    } catch (e) {
      const msg = (e as Error).message || ''
      setError(msg.includes('401') ? 'Credenciales inválidas.' : 'No se pudo conectar al servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--grad)', boxShadow: '0 8px 24px var(--primary-glow)' }}>
            🛡️
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>Panel Administrador</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>.NET Backend Learning</p>
          </div>
        </div>

        <h2 className="font-black text-2xl mb-1" style={{ color: 'var(--text-1)' }}>Iniciar sesión</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>Acceso restringido a administradores.</p>

        <div className="space-y-3">
          <DarkInput
            value={user}
            onChange={(e) => { setUser(e.target.value); setError('') }}
            placeholder="Usuario"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <DarkInput
            type="password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError('') }}
            placeholder="Contraseña"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {error && <p className="text-xs mt-2" style={{ color: '#ffb3c6' }}>{error}</p>}

        <div className="mt-4">
          <PrimaryBtn onClick={handleLogin} disabled={!user.trim() || !pass.trim() || loading}>
            {loading ? 'Verificando...' : 'Ingresar →'}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  )
}
