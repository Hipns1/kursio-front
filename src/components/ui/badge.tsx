const ACTIVE = 'border border-success-border bg-success-bg text-success'
const INACTIVE = 'border border-danger-border bg-danger-bg text-danger'

export function Badge({ ok }: { ok: boolean }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ok ? ACTIVE : INACTIVE}`}>
      {ok ? 'Activo' : 'Inactivo'}
    </span>
  )
}
