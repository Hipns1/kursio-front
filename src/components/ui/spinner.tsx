export function Spinner() {
  return (
    <div
      className="w-5 h-5 rounded-full border-2 animate-spin"
      style={{ borderColor: 'var(--border-default)', borderTopColor: 'var(--primary)' }}
    />
  )
}
