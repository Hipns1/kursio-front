import { useEffect, useState } from 'react'

type Reason = 'disabled' | 'deleted'

interface Props {
  reason: Reason
  onDone: () => void
}

const COUNTDOWN = 8

export function ForcedLogoutModal({ reason, onDone }: Props) {
  const [seconds, setSeconds] = useState(COUNTDOWN)

  useEffect(() => {
    if (seconds <= 0) { onDone(); return }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds, onDone])

  const progress = ((COUNTDOWN - seconds) / COUNTDOWN) * 100

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden animate-fade-up"
        style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,97,136,0.35)', boxShadow: '0 0 60px rgba(255,97,136,0.18)' }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #ff6188, #ab9df2)' }}
          />
        </div>

        <div className="p-7">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 mx-auto"
            style={{ background: 'rgba(255,97,136,0.12)', border: '1px solid rgba(255,97,136,0.30)' }}
          >
            {reason === 'disabled' ? '🔒' : '🚫'}
          </div>

          {/* Title */}
          <h2 className="font-black text-xl text-center mb-2" style={{ color: 'var(--text-1)' }}>
            {reason === 'disabled' ? 'Cuenta desactivada' : 'Cuenta eliminada'}
          </h2>

          {/* Message */}
          <p className="text-sm text-center leading-relaxed mb-6" style={{ color: 'var(--text-3)' }}>
            {reason === 'disabled'
              ? 'Tu cuenta fue desactivada por un administrador. Contactá al equipo para más información.'
              : 'Tu cuenta ya no existe en el sistema. Por favor comunicate con el administrador.'}
          </p>

          {/* Countdown */}
          <div
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-lg shrink-0"
              style={{ background: 'rgba(255,97,136,0.12)', color: '#ff6188', border: '1px solid rgba(255,97,136,0.25)' }}
            >
              {seconds}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Serás redirigido al inicio de sesión automáticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
