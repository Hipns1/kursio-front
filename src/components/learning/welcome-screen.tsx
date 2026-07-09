import { useState } from 'react'
import { DarkInput, PrimaryBtn, ThemeToggle } from '@/components/ui'
import type { Course, Progress } from '@/types/learning'
import { fetchContent, fetchProgress, studentLogin } from '@/services/backend'

interface WelcomeScreenProps {
  onEnter: (token: string, name: string, progress: Progress, allowedCourseIds: number[], courses: Course[]) => void
}

const features = [
  { icon: '⚡', label: 'Múltiples cursos', text: 'Accedé a todos los cursos habilitados para tu perfil' },
  { icon: '🤖', label: 'IA integrada', text: 'Auto-calificación instantánea con Claude AI' },
  { icon: '💻', label: 'Práctico', text: 'Editor de código interactivo en cada ejercicio' }
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
    <div className='bg-surface relative flex min-h-screen overflow-hidden'>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div
          style={{
            background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 65%)',
            filter: 'blur(64px)',
            height: '700px',
            left: '10%',
            position: 'absolute',
            top: '-15%',
            width: '700px'
          }}
        />
        <div
          style={{
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 65%)',
            bottom: '-5%',
            filter: 'blur(64px)',
            height: '500px',
            position: 'absolute',
            right: '5%',
            width: '500px'
          }}
        />
        <div
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)',
            filter: 'blur(64px)',
            height: '380px',
            left: '-8%',
            position: 'absolute',
            top: '55%',
            width: '380px'
          }}
        />
      </div>

      <div className='absolute top-5 right-5 z-20'>
        <ThemeToggle />
      </div>

      <div className='border-hairline relative z-10 hidden flex-1 flex-col justify-between border-r px-14 py-12 lg:flex'>
        <div className='flex items-center gap-3'>
          <div
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl'
            style={{ background: 'var(--grad)', boxShadow: '0 8px 24px var(--primary-glow)' }}
          >
            🎓
          </div>
          <div>
            <div className='text-fg text-sm leading-tight font-semibold'>Learning Platform</div>
            <div className='text-fg-subtle text-xs leading-tight'>.NET · React · TypeScript</div>
          </div>
        </div>

        <div>
          <div className='mb-5 flex items-center gap-2.5'>
            <div className='bg-grad h-px w-6' />
            <span className='text-primary text-xs font-bold tracking-widest uppercase'>Cursos intensivos</span>
          </div>

          <h1
            className='mb-5 leading-[1.05] font-semibold'
            style={{ color: 'var(--text-1)', fontSize: '3.5rem', letterSpacing: '-0.04em' }}
          >
            Aprendé
            <br />
            programación <span className='grad-text'>práctica</span>
          </h1>

          <p className='text-fg-muted mb-10 max-w-[420px] text-base leading-relaxed'>
            Ejercicios interactivos, retroalimentación con IA y seguimiento de tu progreso. Todo lo que necesitás para
            avanzar como desarrollador.
          </p>

          <div className='border-hairline mb-10 flex items-center gap-8 border-b pb-10'>
            {[
              { l: 'Calificación', v: 'IA' },
              { l: 'Feedback', v: 'Live' },
              { l: 'Online', v: '100%' }
            ].map((s, i) => (
              <div key={i}>
                <div className='text-fg font-mono text-[1.75rem] leading-none font-semibold'>{s.v}</div>
                <div className='text-fg-subtle mt-1 text-xs'>{s.l}</div>
              </div>
            ))}
          </div>

          <div className='space-y-3.5'>
            {features.map((f, i) => (
              <div key={i} className='flex items-center gap-3.5'>
                <div className='border-line bg-primary-glow flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base'>
                  {f.icon}
                </div>
                <div>
                  <div className='text-fg text-xs leading-tight font-bold'>{f.label}</div>
                  <div className='text-fg-subtle mt-0.5 text-xs leading-tight'>{f.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='text-fg-subtle text-xs'>Plataforma de aprendizaje interno &middot; v3.0</div>
      </div>

      <div className='relative z-10 flex flex-1 items-center justify-center p-8 lg:max-w-120'>
        <div className='animate-fade-up w-full max-w-95'>
          <div className='mb-10 flex items-center gap-2.5 lg:hidden'>
            <div
              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base'
              style={{ background: 'var(--grad)', boxShadow: '0 4px 16px var(--primary-glow)' }}
            >
              🎓
            </div>
            <div>
              <div className='text-fg text-sm leading-tight font-semibold'>Learning Platform</div>
              <div className='text-fg-subtle text-xs leading-tight'>.NET · React · TypeScript</div>
            </div>
          </div>

          <div className='bg-card border-line shadow-float rounded-2xl border p-8'>
            <div className='mb-7'>
              <h2
                className='mb-2 font-serif text-2xl font-normal'
                style={{ color: 'var(--text-1)', letterSpacing: '-0.025em' }}
              >
                Ingresar a la plataforma
              </h2>
              <p className='text-fg-muted text-sm leading-relaxed'>
                Usá la llave de acceso que te proporcionó tu instructor.
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='text-fg-muted mb-1.5 block text-xs font-semibold'>Llave de acceso</label>
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
                  <div className='bg-danger-bg border-danger-border text-danger mt-2 rounded-lg border px-3 py-2 text-xs leading-relaxed'>
                    {error}
                  </div>
                )}
              </div>

              <PrimaryBtn onClick={handleSubmit} disabled={!key.trim() || loading}>
                {loading ? 'Verificando...' : 'Acceder a mis cursos →'}
              </PrimaryBtn>
            </div>

            <p className='text-fg-subtle mt-6 text-center text-xs'>
              Formato:{' '}
              <span className='text-fg-muted border-hairline bg-tint rounded-md border px-1.5 py-0.5 font-mono'>
                NET-XXXXXXXX
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
