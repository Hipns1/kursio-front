import { useEffect, useState } from 'react'
import type { OnboardingQuestion, StudentRoadmapResult } from '@/types/learning'
import { getOnboardingQuestions, submitOnboarding } from '@/services/backend'

interface Props {
  token: string
  onComplete: (roadmap: StudentRoadmapResult) => void
}

export function OnboardingScreen({ token, onComplete }: Props) {
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
  const progress = total > 0 ? ((step) / total) * 100 : 0

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
        questionId: Number(qId),
        optionId: oId,
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
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center space-y-3">
          <div className="text-3xl animate-pulse">🧭</div>
          <p className="text-sm animate-pulse" style={{ color: 'var(--text-3)' }}>Preparando tu onboarding...</p>
        </div>
      </div>
    )
  }

  if (submitting) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="text-4xl mb-2 animate-spin">🤖</div>
          <h2 className="font-black text-xl" style={{ color: 'var(--text-1)' }}>Analizando tu perfil...</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
            Nuestra IA está diseñando tu roadmap personalizado basado en tus respuestas.
          </p>
          <div className="flex justify-center gap-1 pt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full animate-bounce"
                style={{
                  background: 'var(--primary)',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10"
        style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="mx-auto max-w-xl px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-base"
                style={{ background: 'var(--grad)', boxShadow: '0 4px 12px var(--primary-glow)' }}
              >
                🧭
              </div>
              <div>
                <p className="font-bold text-xs" style={{ color: 'var(--text-1)' }}>Onboarding</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {step + 1} de {total}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                {answered}/{total} respondidas
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'var(--grad)' }}
            />
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {error && (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(255,97,136,0.10)', color: '#ffb3c6', border: '1px solid rgba(255,97,136,0.25)' }}
            >
              {error}
            </div>
          )}

          {current && (
            <div className="animate-fade-up space-y-5" key={step}>
              {/* Step indicator dots */}
              <div className="flex gap-1.5 justify-center">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: i === step ? '20px' : '6px',
                      height: '6px',
                      background: i === step
                        ? 'var(--primary)'
                        : answers[questions[i]?.id]
                        ? 'rgba(171,157,242,0.4)'
                        : 'rgba(255,255,255,0.12)',
                    }}
                  />
                ))}
              </div>

              {/* Question */}
              <div
                className="rounded-2xl p-6"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>
                  Pregunta {step + 1}
                </p>
                <h2 className="font-black text-lg leading-snug mb-5" style={{ color: 'var(--text-1)' }}>
                  {current.text}
                </h2>

                {/* Options */}
                <div className="space-y-2">
                  {current.options
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((opt) => {
                      const selected = answers[current.id] === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(current.id, opt.id)}
                          className="w-full text-left rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
                          style={{
                            background: selected ? 'rgba(171,157,242,0.15)' : 'var(--bg-elevated)',
                            color: selected ? 'var(--primary)' : 'var(--text-2)',
                            border: selected
                              ? '1.5px solid var(--primary)'
                              : '1px solid var(--border-subtle)',
                            transform: selected ? 'scale(1.01)' : 'scale(1)',
                            boxShadow: selected ? '0 0 0 3px var(--primary-glow)' : 'none',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all"
                              style={{
                                borderColor: selected ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                                background: selected ? 'var(--primary)' : 'transparent',
                              }}
                            >
                              {selected && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

              {/* Navigation */}
              <div className="flex gap-3">
                {step > 0 && (
                  <button
                    onClick={handleBack}
                    className="rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:opacity-80"
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-2)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    ← Anterior
                  </button>
                )}

                {step < total - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!answers[current.id]}
                    className="flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all disabled:opacity-40"
                    style={{
                      background: answers[current.id] ? 'var(--grad)' : 'var(--bg-card)',
                      color: answers[current.id] ? '#fff' : 'var(--text-3)',
                      border: answers[current.id] ? 'none' : '1px solid var(--border-default)',
                      boxShadow: answers[current.id] ? '0 4px 14px var(--primary-glow)' : 'none',
                    }}
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all disabled:opacity-40"
                    style={{
                      background: allAnswered ? 'var(--grad)' : 'var(--bg-card)',
                      color: allAnswered ? '#fff' : 'var(--text-3)',
                      border: allAnswered ? 'none' : '1px solid var(--border-default)',
                      boxShadow: allAnswered ? '0 4px 14px var(--primary-glow)' : 'none',
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
