interface FeedbackProps {
  explanation: string
  correct: boolean | null
  claudeFeedback?: string
  score?: number
}

export function Feedback({ explanation, correct, claudeFeedback, score }: FeedbackProps) {
  if (claudeFeedback) {
    const [bg, border, text] =
      correct === true
        ? ['rgba(169,220,118,0.08)', 'rgba(169,220,118,0.30)', '#6EE7B7']
        : correct === false
          ? ['rgba(255,97,136,0.08)', 'rgba(255,97,136,0.30)', '#ffb3c6']
          : ['rgba(255,216,102,0.08)', 'rgba(255,216,102,0.30)', '#ffd866']
    const icon = correct === true ? '✅' : correct === false ? '❌' : '⚠️'

    return (
      <div
        className="rounded-xl p-4 mt-3 text-sm"
        style={{ background: bg, border: `1px solid ${border}` }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-xs flex items-center gap-1.5" style={{ color: text }}>
            🤖 Calificado por Claude
          </span>
          {score !== undefined && (
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full font-mono"
              style={{
                background: score >= 80 ? 'rgba(169,220,118,0.15)' : score >= 50 ? 'rgba(255,216,102,0.15)' : 'rgba(255,97,136,0.15)',
                color: score >= 80 ? '#6EE7B7' : score >= 50 ? '#ffd866' : '#ffb3c6',
              }}
            >
              {score}/100
            </span>
          )}
        </div>
        <p style={{ color: text }}>
          <span className="mr-1">{icon}</span>
          {claudeFeedback}
        </p>
      </div>
    )
  }

  const [bg, border, text] =
    correct === true
      ? ['rgba(169,220,118,0.08)', 'rgba(169,220,118,0.25)', '#6EE7B7']
      : correct === false
        ? ['rgba(255,97,136,0.08)', 'rgba(255,97,136,0.25)', '#ffb3c6']
        : ['rgba(171,157,242,0.08)', 'rgba(171,157,242,0.25)', '#A5B4FC']
  const icon = correct === true ? '✅' : correct === false ? '❌' : '📝'

  return (
    <div className="rounded-xl p-4 mt-3 text-sm" style={{ background: bg, border: `1px solid ${border}` }}>
      <span className="font-semibold mr-1" style={{ color: text }}>
        {icon}
      </span>
      <span style={{ color: text }}>{explanation}</span>
      {correct === null && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
          Guardado. Con API key configurada (⚙️), Claude lo calificará automáticamente.
        </p>
      )}
    </div>
  )
}
