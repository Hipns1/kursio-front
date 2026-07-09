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
  confirmLabel = 'Confirmar',
  confirmStyle = 'danger',
  detail,
  loading = false,
  message,
  onClose,
  onConfirm,
  title
}: ConfirmModalProps) {
  const isDanger = confirmStyle === 'danger'
  const confirmColors = isDanger
    ? { bg: 'var(--danger-bg)', border: 'var(--danger-border)', text: 'var(--danger)' }
    : { bg: 'var(--warning-bg)', border: 'var(--warning-border)', text: 'var(--warning)' }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.65)] p-4 backdrop-blur-[8px]'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='animate-fade-up bg-card border-hairline w-full max-w-sm rounded-2xl border'>
        <div className='space-y-4 p-6'>
          <div className='text-center'>
            <div
              className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl font-serif text-2xl font-normal'
              style={{
                background: isDanger ? 'var(--danger-bg)' : 'var(--warning-bg)',
                border: isDanger ? '1px solid var(--danger-border)' : '1px solid var(--warning-border)'
              }}
            >
              {isDanger ? '🗑' : '⚠️'}
            </div>
            <h2 className='text-fg mb-1 text-base font-semibold'>{title}</h2>
            <p className='text-fg-muted text-sm leading-relaxed'>{message}</p>
            {detail && <p className='text-fg-subtle mt-1 text-xs'>{detail}</p>}
          </div>

          <div className='flex gap-3 pt-1'>
            <button
              onClick={onClose}
              disabled={loading}
              className='bg-elevated border-hairline text-fg-muted flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50'
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className='flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:opacity-80 disabled:opacity-50'
              style={{
                background: confirmColors.bg,
                border: `1px solid ${confirmColors.border}`,
                color: confirmColors.text
              }}
            >
              {loading ? 'Procesando...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
