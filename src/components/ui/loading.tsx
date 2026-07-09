export function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-base)' }}>
      <div
        className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: 'var(--border-default)', borderTopColor: 'var(--primary)' }}
      />
      <p className="text-xs font-medium animate-pulse" style={{ color: 'var(--text-3)' }}>
        Cargando...
      </p>
    </div>
  )
}
