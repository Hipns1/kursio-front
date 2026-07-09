export function ToggleSwitch({
  checked,
  disabled,
  onChange
}: {
  checked: boolean
  disabled: boolean
  onChange: () => void
}) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      disabled={disabled}
      title={checked ? 'Click para desactivar' : 'Click para activar'}
      className='relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-200 focus:outline-none disabled:opacity-50'
      style={{
        background: checked ? 'var(--success)' : 'var(--tint-2)',
        border: checked ? '1px solid var(--success-border)' : '1px solid var(--tint-2)'
      }}
    >
      <span
        className='inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200'
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  )
}
