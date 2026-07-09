interface FeedbackProps {
  explanation: string
  correct: boolean | null
  claudeFeedback?: string
  score?: number
}

export function Feedback({ claudeFeedback, correct, explanation, score }: FeedbackProps) {
  if (claudeFeedback) {
    const [bg, border, text] =
      correct === true
        ? ['var(--success-bg)', 'var(--success-border)', 'var(--success)']
        : correct === false
          ? ['var(--danger-bg)', 'var(--danger-border)', 'var(--danger)']
          : ['var(--warning-bg)', 'var(--warning-border)', 'var(--warning)']
    const icon = correct === true ? '✅' : correct === false ? '❌' : '⚠️'

    return (
      <div className='mt-3 rounded-xl p-4 text-sm' style={{ background: bg, border: `1px solid ${border}` }}>
        <div className='mb-2 flex items-center justify-between'>
          <span className='flex items-center gap-1.5 text-xs font-semibold' style={{ color: text }}>
            🤖 Calificado por Claude
          </span>
          {score !== undefined && (
            <span
              className='rounded-full px-2.5 py-0.5 font-mono text-xs font-bold'
              style={{
                background: score >= 80 ? 'var(--success-bg)' : score >= 50 ? 'var(--warning-bg)' : 'var(--danger-bg)',
                color: score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)'
              }}
            >
              {score}/100
            </span>
          )}
        </div>
        <p style={{ color: text }}>
          <span className='mr-1'>{icon}</span>
          {claudeFeedback}
        </p>
      </div>
    )
  }

  const [bg, border, text] =
    correct === true
      ? ['var(--success-bg)', 'var(--success-border)', 'var(--success)']
      : correct === false
        ? ['var(--danger-bg)', 'var(--danger-border)', 'var(--danger)']
        : ['var(--primary-glow)', 'var(--primary-glow)', '#A5B4FC']
  const icon = correct === true ? '✅' : correct === false ? '❌' : '📝'

  return (
    <div className='mt-3 rounded-xl p-4 text-sm' style={{ background: bg, border: `1px solid ${border}` }}>
      <span className='mr-1 font-semibold' style={{ color: text }}>
        {icon}
      </span>
      <span style={{ color: text }}>{explanation}</span>
      {correct === null && (
        <p className='text-fg-subtle mt-1.5 text-xs'>
          Guardado. Con API key configurada (⚙️), Claude lo calificará automáticamente.
        </p>
      )}
    </div>
  )
}
