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
    <div className='bg-surface flex min-h-screen items-center justify-center p-8'>
      <div className='animate-fade-up w-full max-w-sm'>
        <div className='mb-8 flex items-center gap-3'>
          <div
            className='flex h-9 w-9 items-center justify-center rounded-xl text-lg'
            style={{ background: 'var(--grad)', boxShadow: '0 8px 24px var(--primary-glow)' }}
          >
            🛡️
          </div>
          <div>
            <p className='text-fg text-sm font-bold'>Panel Administrador</p>
            <p className='text-fg-subtle text-xs'>.NET Backend Learning</p>
          </div>
        </div>

        <h2 className='text-fg mb-1 font-serif text-2xl font-normal'>Iniciar sesión</h2>
        <p className='text-fg-subtle mb-6 text-sm'>Acceso restringido a administradores.</p>

        <div className='space-y-3'>
          <DarkInput
            value={user}
            onChange={(e) => {
              setUser(e.target.value)
              setError('')
            }}
            placeholder='Usuario'
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <DarkInput
            type='password'
            value={pass}
            onChange={(e) => {
              setPass(e.target.value)
              setError('')
            }}
            placeholder='Contraseña'
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {error && <p className='text-danger mt-2 text-xs'>{error}</p>}

        <div className='mt-4'>
          <PrimaryBtn onClick={handleLogin} disabled={!user.trim() || !pass.trim() || loading}>
            {loading ? 'Verificando...' : 'Ingresar →'}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  )
}
