interface RingProgressProps {
  pct: number
  size?: number
  stroke?: number
  color?: string
}

export function RingProgress({ color = 'var(--primary)', pct, size = 52, stroke = 4 }: RingProgressProps) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg width={size} height={size} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill='none' stroke='var(--tint-2)' strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill='none'
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap='round'
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}
