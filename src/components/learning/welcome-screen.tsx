import { useState } from 'react'
import { DarkInput, PrimaryBtn, ThemeToggle } from '@/components/ui'
import type { Course, Progress } from '@/types/learning'
import { fetchContent, fetchProgress, studentLogin } from '@/services/backend'

interface WelcomeScreenProps {
  onEnter: (
    token: string,
    name: string,
    progress: Progress,
    allowedCourseIds: number[],
    courses: Course[]
  ) => void
}

const features = [
  { icon: '⚡', label: 'Múltiples cursos', text: 'Accedé a todos los cursos habilitados para tu perfil' },
  { icon: '🤖', label: 'IA integrada', text: 'Auto-calificación instantánea con Claude AI' },
  { icon: '💻', label: 'Práctico', text: 'Editor de código interactivo en cada ejercicio' },
]

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const trimmed = key.trim().toUpperCase()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    try {
      const result = await studentLogin(trimmed)
      const [progress, content] = await Promise.all([
        fetchProgress(result.accessToken),
        fetchContent(result.accessToken)
      ])
      onEnter(result.accessToken, result.name, progress, result.allowedCourseIds ?? [], content.courses)
    } catch (e) {
      const msg = (e as Error).message || ''
      if (msg.startsWith('403')) {
        setError('Tu cuenta está desactivada. Contactá al administrador.')
      } else if (msg.startsWith('401') || msg.includes('404')) {
        setError('Llave de acceso inválida. Verificá el código e intentá de nuevo.')
      } else {
        setError('No se pudo conectar al servidor. Verificá tu conexión.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative flex min-h-screen overflow-hidden' style={{ background: 'var(--bg-base)' }}>
      {/* Ambient background orbs */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '10%',
            width: '700px',
            height: '700px',
            background: 'radial-gradient(circle, rgba(171,157,242,0.11) 0%, transparent 65%)',
            filter: 'blur(64px)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-5%',
            right: '5%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(120,220,232,0.08) 0%, transparent 65%)',
            filter: 'blur(64px)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '55%',
            left: '-8%',
            width: '380px',
            height: '380px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)',
            filter: 'blur(64px)'
          }}
        />
      </div>

      {/* Theme toggle */}
      <div className='absolute top-5 right-5 z-20'>
        <ThemeToggle />
      </div>

      {/* ── Left hero panel (lg+) ── */}
      <div
        className='relative z-10 hidden flex-1 flex-col justify-between px-14 py-12 lg:flex'
        style={{ borderRight: '1px solid var(--border-subtle)' }}
      >
        {/* Logo */}
        <div className='flex items-center gap-3'>
          <div
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl'
            style={{ background: 'var(--grad)', boxShadow: '0 8px 24px var(--primary-glow)' }}
          >
            🎓
          </div>
          <div>
            <div className='text-sm leading-tight font-black' style={{ color: 'var(--text-1)' }}>
              Learning Platform
            </div>
            <div className='text-xs leading-tight' style={{ color: 'var(--text-3)' }}>
              .NET · React · TypeScript
            </div>
          </div>
        </div>

        {/* Main hero content */}
        <div>
          <div className='mb-5 flex items-center gap-2.5'>
            <div className='h-px w-6' style={{ background: 'var(--grad)' }} />
            <span className='text-xs font-bold tracking-widest uppercase' style={{ color: 'var(--primary)' }}>
              Cursos intensivos
            </span>
          </div>

          <h1
            className='mb-5 leading-[1.05] font-black'
            style={{ fontSize: '3.5rem', letterSpacing: '-0.04em', color: 'var(--text-1)' }}
          >
            Aprendé<br />
            programación <span className='grad-text'>práctica</span>
          </h1>

          <p className='mb-10 text-base leading-relaxed' style={{ color: 'var(--text-2)', maxWidth: '420px' }}>
            Ejercicios interactivos, retroalimentación con IA y seguimiento de tu progreso.
            Todo lo que necesitás para avanzar como desarrollador.
          </p>

          {/* Stats strip */}
          <div
            className='mb-10 flex items-center gap-8 pb-10'
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            {[
              { v: 'IA', l: 'Calificación' },
              { v: 'Live', l: 'Feedback' },
              { v: '100%', l: 'Online' },
            ].map((s, i) => (
              <div key={i}>
                <div
                  className='font-mono leading-none font-black'
                  style={{ fontSize: '1.75rem', color: 'var(--text-1)' }}
                >
                  {s.v}
                </div>
                <div className='mt-1 text-xs' style={{ color: 'var(--text-3)' }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className='space-y-3.5'>
            {features.map((f, i) => (
              <div key={i} className='flex items-center gap-3.5'>
                <div
                  className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base'
                  style={{ background: 'rgba(171,157,242,0.10)', border: '1px solid var(--border-default)' }}
                >
                  {f.icon}
                </div>
                <div>
                  <div className='text-xs leading-tight font-bold' style={{ color: 'var(--text-1)' }}>
                    {f.label}
                  </div>
                  <div className='mt-0.5 text-xs leading-tight' style={{ color: 'var(--text-3)' }}>
                    {f.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='text-xs' style={{ color: 'var(--text-3)' }}>
          Plataforma de aprendizaje interno &middot; v3.0
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className='relative z-10 flex flex-1 items-center justify-center p-8 lg:max-w-120'>
        <div className='animate-fade-up w-full max-w-95'>
          {/* Mobile logo */}
          <div className='mb-10 flex items-center gap-2.5 lg:hidden'>
            <div
              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base'
              style={{ background: 'var(--grad)', boxShadow: '0 4px 16px var(--primary-glow)' }}
            >
              🎓
            </div>
            <div>
              <div className='text-sm leading-tight font-black' style={{ color: 'var(--text-1)' }}>
                Learning Platform
              </div>
              <div className='text-xs leading-tight' style={{ color: 'var(--text-3)' }}>
                .NET · React · TypeScript
              </div>
            </div>
          </div>

          {/* Login card */}
          <div
            className='rounded-2xl p-8'
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-float)'
            }}
          >
            <div className='mb-7'>
              <h2 className='mb-2 text-2xl font-black' style={{ color: 'var(--text-1)', letterSpacing: '-0.025em' }}>
                Ingresar a la plataforma
              </h2>
              <p className='text-sm leading-relaxed' style={{ color: 'var(--text-2)' }}>
                Usá la llave de acceso que te proporcionó tu instructor.
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-2)' }}>
                  Llave de acceso
                </label>
                <DarkInput
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value.toUpperCase())
                    setError(null)
                  }}
                  placeholder='NET-XXXXXXXX'
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                {error && (
                  <div
                    className='mt-2 rounded-lg px-3 py-2 text-xs leading-relaxed'
                    style={{
                      background: 'var(--danger-bg)',
                      border: '1px solid var(--danger-border)',
                      color: '#ffb3c6'
                    }}
                  >
                    {error}
                  </div>
                )}
              </div>

              <PrimaryBtn onClick={handleSubmit} disabled={!key.trim() || loading}>
                {loading ? 'Verificando...' : 'Acceder a mis cursos →'}
              </PrimaryBtn>
            </div>

            <p className='mt-6 text-center text-xs' style={{ color: 'var(--text-3)' }}>
              Formato:{' '}
              <span
                className='rounded-md px-1.5 py-0.5 font-mono'
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-2)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                NET-XXXXXXXX
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
