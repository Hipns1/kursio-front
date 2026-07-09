function toneFor(score: number) {
  if (score >= 80) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-danger'
}

export function ScoreChip({ score }: { score: number | null }) {
  if (score === null) return <span className='text-fg-subtle'>—</span>

  return <span className={`font-mono font-bold ${toneFor(score)}`}>{Math.round(score)}</span>
}
