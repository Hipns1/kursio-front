export function StatCard({
  badgeColor = 'var(--primary)',
  icon,
  label,
  value
}: {
  icon: string
  value: string | number
  label: string
  badgeColor?: string
}) {
  return (
    <div className='bg-card border-hairline rounded-2xl border p-4'>
      <div
        className='mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-lg'
        style={{ background: `${badgeColor}18`, border: `1px solid ${badgeColor}30` }}
      >
        {icon}
      </div>
      <div className='text-fg mb-0.5 font-mono font-serif text-2xl leading-none font-normal'>{value}</div>
      <div className='text-fg-subtle text-xs'>{label}</div>
    </div>
  )
}
