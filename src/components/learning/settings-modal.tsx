interface SettingsModalProps {
  username: string
  onLogout: () => void
  onClose: () => void
}

export function SettingsModal({ onClose, onLogout, username }: SettingsModalProps) {
  const initials = username
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div
      className='animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-[rgba(0,0,0,0.80)] p-4 backdrop-blur-[8px] sm:items-center'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='animate-fade-up bg-card border-line shadow-float w-full max-w-sm rounded-2xl border'>
        <div className='border-hairline flex items-center justify-between border-b px-6 py-4'>
          <div className='flex items-center gap-2.5'>
            <div className='border-line bg-primary-glow flex h-7 w-7 items-center justify-center rounded-lg border text-sm'>
              ⚙️
            </div>
            <h2 className='text-fg text-sm font-bold'>Configuración</h2>
          </div>
          <button
            onClick={onClose}
            className='text-fg-subtle flex h-7 w-7 items-center justify-center rounded-full text-xl transition-all hover:opacity-60'
          >
            ×
          </button>
        </div>

        <div className='space-y-4 p-6'>
          <div className='bg-success-bg border-success-border rounded-xl border p-4'>
            <div className='flex items-center gap-3.5'>
              <div
                className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold select-none'
                style={{
                  background: 'var(--grad)',
                  boxShadow: '0 4px 16px var(--primary-glow)',
                  color: 'var(--on-primary)'
                }}
              >
                {initials || '?'}
              </div>
              <div className='min-w-0'>
                <p className='text-fg truncate text-sm font-bold'>{username}</p>
                <div className='mt-0.5 flex items-center gap-1.5'>
                  <span className='bg-success h-1.5 w-1.5 rounded-full' />
                  <p className='text-success text-xs font-medium'>Sesión activa</p>
                </div>
              </div>
            </div>
          </div>

          <div className='border-line bg-primary-glow flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs text-[#A5B4FC]'>
            <span className='text-base'>🤖</span>
            <span>Auto-calificación habilitada vía servidor</span>
          </div>

          <button
            onClick={onLogout}
            className='bg-danger-bg border-danger-border text-danger w-full rounded-xl border py-3 text-sm font-bold transition-all hover:opacity-80 active:scale-95'
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
