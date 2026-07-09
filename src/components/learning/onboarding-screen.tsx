import { useEffect, useState } from 'react'
import type { OnboardingQuestion, StudentRoadmapResult } from '@/types/learning'
import { getOnboardingQuestions, submitOnboarding } from '@/services/backend'

interface Props {
  token: string
  onComplete: (roadmap: StudentRoadmapResult) => void
}

export function OnboardingScreen({ onComplete, token }: Props) {
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getOnboardingQuestions(token)
      .then((qs) => {
        setQuestions(qs.sort((a, b) => a.order - b.order))
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudieron cargar las preguntas.')
        setLoading(false)
      })
  }, [token])

  const total = questions.length
  const current = questions[step]
  const answered = Object.keys(answers).length
  const allAnswered = answered === total && total > 0
  const progress = total > 0 ? (step / total) * 100 : 0

  const handleSelect = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const handleNext = () => {
    if (step < total - 1) setStep((s) => s + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    if (!allAnswered) return
    setSubmitting(true)
    setError('')
    try {
      const payload = Object.entries(answers).map(([qId, oId]) => ({
        optionId: oId,
        questionId: Number(qId)
      }))
      const roadmap = await submitOnboarding(token, payload)
      onComplete(roadmap)
    } catch {
      setError('No se pudo generar tu roadmap. Intenta de nuevo.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='bg-surface flex min-h-screen items-center justify-center'>
        <div className='space-y-3 text-center'>
          <div className='animate-pulse font-serif text-3xl font-normal'>🧭</div>
          <p className='text-fg-subtle animate-pulse text-sm'>Preparando tu onboarding...</p>
        </div>
      </div>
    )
  }

  if (submitting) {
    return (
      <div className='bg-surface flex min-h-screen items-center justify-center'>
        <div className='max-w-sm space-y-4 px-6 text-center'>
          <div className='mb-2 animate-spin font-serif text-4xl font-normal'>🤖</div>
          <h2 className='text-fg text-xl font-semibold'>Analizando tu perfil...</h2>
          <p className='text-fg-subtle text-sm leading-relaxed'>
            Nuestra IA está diseñando tu roadmap personalizado basado en tus respuestas.
          </p>
          <div className='flex justify-center gap-1 pt-2'>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className='h-2 w-2 animate-bounce rounded-full'
                style={{
                  animationDelay: `${i * 0.2}s`,
                  background: 'var(--primary)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-surface flex min-h-screen flex-col'>
      <div className='bg-nav border-hairline sticky top-0 z-10 border-b backdrop-blur-[12px]'>
        <div className='mx-auto max-w-xl px-4 py-4'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div
                className='flex h-8 w-8 items-center justify-center rounded-xl text-base'
                style={{ background: 'var(--grad)', boxShadow: '0 4px 12px var(--primary-glow)' }}
              >
                🧭
              </div>
              <div>
                <p className='text-fg text-xs font-bold'>Onboarding</p>
                <p className='text-fg-subtle text-xs'>
                  {step + 1} de {total}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-primary text-xs font-semibold'>
                {answered}/{total} respondidas
              </p>
            </div>
          </div>

          <div className='bg-tint-strong h-1.5 overflow-hidden rounded-full'>
            <div
              className='h-full rounded-full transition-all duration-500'
              style={{ background: 'var(--grad)', width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className='flex flex-1 items-start justify-center px-4 py-8'>
        <div className='w-full max-w-xl'>
          {error && (
            <div className='border-danger-border bg-danger-bg text-danger mb-4 rounded-xl border px-4 py-3 text-sm'>
              {error}
            </div>
          )}

          {current && (
            <div className='animate-fade-up space-y-5' key={step}>
              <div className='flex justify-center gap-1.5'>
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className='rounded-full transition-all duration-300'
                    style={{
                      background:
                        i === step
                          ? 'var(--primary)'
                          : answers[questions[i]?.id]
                            ? 'var(--primary-glow)'
                            : 'var(--tint-2)',
                      height: '6px',
                      width: i === step ? '20px' : '6px'
                    }}
                  />
                ))}
              </div>

              <div className='bg-card border-hairline rounded-2xl border p-6'>
                <p className='text-fg-subtle mb-3 text-xs font-semibold tracking-wider uppercase'>
                  Pregunta {step + 1}
                </p>
                <h2 className='text-fg mb-5 text-lg leading-snug font-semibold'>{current.text}</h2>

                <div className='space-y-2'>
                  {current.options
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((opt) => {
                      const selected = answers[current.id] === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(current.id, opt.id)}
                          className='w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200'
                          style={{
                            background: selected ? 'var(--primary-glow)' : 'var(--bg-elevated)',
                            border: selected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                            boxShadow: selected ? '0 0 0 3px var(--primary-glow)' : 'none',
                            color: selected ? 'var(--primary)' : 'var(--text-2)',
                            transform: selected ? 'scale(1.01)' : 'scale(1)'
                          }}
                        >
                          <div className='flex items-center gap-3'>
                            <div
                              className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all'
                              style={{
                                background: selected ? 'var(--primary)' : 'transparent',
                                borderColor: selected ? 'var(--primary)' : 'var(--border-default)'
                              }}
                            >
                              {selected && (
                                <svg width='10' height='8' viewBox='0 0 10 8' fill='none'>
                                  <path
                                    d='M1 4L3.5 6.5L9 1'
                                    stroke='white'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  />
                                </svg>
                              )}
                            </div>
                            <span>{opt.text}</span>
                          </div>
                        </button>
                      )
                    })}
                </div>
              </div>

              <div className='flex gap-3'>
                {step > 0 && (
                  <button
                    onClick={handleBack}
                    className='bg-card text-fg-muted border-line rounded-xl border px-5 py-3 text-sm font-semibold transition-all hover:opacity-80'
                  >
                    ← Anterior
                  </button>
                )}

                {step < total - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!answers[current.id]}
                    className='flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all disabled:opacity-40'
                    style={{
                      background: answers[current.id] ? 'var(--grad)' : 'var(--bg-card)',
                      border: answers[current.id] ? 'none' : '1px solid var(--border-default)',
                      boxShadow: answers[current.id] ? '0 4px 14px var(--primary-glow)' : 'none',
                      color: answers[current.id] ? '#fff' : 'var(--text-3)'
                    }}
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className='flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all disabled:opacity-40'
                    style={{
                      background: allAnswered ? 'var(--grad)' : 'var(--bg-card)',
                      border: allAnswered ? 'none' : '1px solid var(--border-default)',
                      boxShadow: allAnswered ? '0 4px 14px var(--primary-glow)' : 'none',
                      color: allAnswered ? '#fff' : 'var(--text-3)'
                    }}
                  >
                    🚀 Generar mi Roadmap
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
