import { useEffect, useState } from 'react'

type Reason = 'disabled' | 'deleted'

interface Props {
  reason: Reason
  onDone: () => void
}

const COUNTDOWN = 8

export function ForcedLogoutModal({ onDone, reason }: Props) {
  const [seconds, setSeconds] = useState(COUNTDOWN)

  useEffect(() => {
    if (seconds <= 0) {
      onDone()
      return
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds, onDone])

  const progress = ((COUNTDOWN - seconds) / COUNTDOWN) * 100

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(0,0,0,0.80)] p-4 backdrop-blur-[12px]'>
      <div
        className='animate-fade-up w-full max-w-sm overflow-hidden rounded-2xl'
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--danger-border)',
          boxShadow: '0 0 60px var(--danger-bg)'
        }}
      >
        <div className='bg-tint-strong h-1 w-full'>
          <div
            className='h-full transition-all duration-1000 ease-linear'
            style={{ background: 'var(--grad)', width: `${progress}%` }}
          />
        </div>

        <div className='p-7'>
          <div className='border-danger-border bg-danger-bg mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border font-serif text-3xl font-normal'>
            {reason === 'disabled' ? '🔒' : '🚫'}
          </div>

          <h2 className='text-fg mb-2 text-center text-xl font-semibold'>
            {reason === 'disabled' ? 'Cuenta desactivada' : 'Cuenta eliminada'}
          </h2>

          <p className='text-fg-subtle mb-6 text-center text-sm leading-relaxed'>
            {reason === 'disabled'
              ? 'Tu cuenta fue desactivada por un administrador. Contactá al equipo para más información.'
              : 'Tu cuenta ya no existe en el sistema. Por favor comunicate con el administrador.'}
          </p>

          <div className='border-hairline bg-tint flex items-center justify-center gap-2 rounded-xl border px-4 py-3'>
            <div className='border-danger-border bg-danger-bg text-danger flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-lg font-semibold'>
              {seconds}
            </div>
            <p className='text-fg-subtle text-xs'>Serás redirigido al inicio de sesión automáticamente</p>
          </div>
        </div>
      </div>
    </div>
  )
}
