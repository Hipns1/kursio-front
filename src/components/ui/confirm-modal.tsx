interface ConfirmModalProps {
  title: string
  message: string
  detail?: string
  confirmLabel?: string
  confirmStyle?: 'danger' | 'warning'
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  title,
  message,
  detail,
  confirmLabel = 'Confirmar',
  confirmStyle = 'danger',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const isDanger = confirmStyle === 'danger'
  const confirmColors = isDanger
    ? { bg: 'rgba(255,97,136,0.15)', border: 'rgba(255,97,136,0.30)', text: '#ffb3c6' }
    : { bg: 'rgba(255,216,102,0.15)', border: 'rgba(255,216,102,0.30)', text: '#ffd866' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl animate-fade-up"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{
                background: isDanger ? 'rgba(255,97,136,0.10)' : 'rgba(255,216,102,0.10)',
                border: isDanger ? '1px solid rgba(255,97,136,0.20)' : '1px solid rgba(255,216,102,0.20)',
              }}
            >
              {isDanger ? '🗑' : '⚠️'}
            </div>
            <h2 className="font-black text-base mb-1" style={{ color: 'var(--text-1)' }}>
              {title}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
              {message}
            </p>
            {detail && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                {detail}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-2)' }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: confirmColors.bg, border: `1px solid ${confirmColors.border}`, color: confirmColors.text }}
            >
              {loading ? 'Procesando...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
