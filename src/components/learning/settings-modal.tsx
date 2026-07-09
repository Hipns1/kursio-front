interface SettingsModalProps {
  username: string
  onLogout: () => void
  onClose: () => void
}

export function SettingsModal({ username, onLogout, onClose }: SettingsModalProps) {
  const initials = username
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl animate-fade-up"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-float)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'rgba(171,157,242,0.12)', border: '1px solid var(--border-default)' }}
            >
              ⚙️
            </div>
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>
              Configuración
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xl transition-all hover:opacity-60"
            style={{ color: 'var(--text-3)' }}
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* User info card */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 select-none"
                style={{ background: 'var(--grad)', boxShadow: '0 4px 16px var(--primary-glow)', color: '#fff' }}
              >
                {initials || '?'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: 'var(--text-1)' }}>
                  {username}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--success)' }}
                  />
                  <p className="text-xs font-medium" style={{ color: '#6EE7B7' }}>
                    Sesión activa
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI grading info */}
          <div
            className="text-xs px-4 py-3 rounded-xl flex items-center gap-2.5"
            style={{
              background: 'rgba(171,157,242,0.07)',
              border: '1px solid var(--border-default)',
              color: '#A5B4FC',
            }}
          >
            <span className="text-base">🤖</span>
            <span>Auto-calificación habilitada vía servidor</span>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80 active:scale-95"
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: '#ffb3c6',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
