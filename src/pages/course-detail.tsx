import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { RingProgress } from '@/components/ui'
import { PageHeader, ReadingColumn } from '@/components/layout'
import { useBoundStore } from '@/hooks'
import { EXERCISES, LESSONS, PHASES } from '@/utils/consts/learning-data'
import {
  getCurrentStep,
  getGlobalAvgScore,
  getPhaseAvgScore,
  getPhaseExStats,
  getPhaseLsStats,
  isPhaseUnlocked
} from '@/utils/helpers/learning'
import type { ExerciseRecord } from '@/types/learning'

function ProgressBar({ color, pct }: { pct: number; color?: string }) {
  const grad = color === 'green' ? 'var(--grad-success)' : 'var(--grad)'
  return (
    <div className='bg-tint-strong h-1.5 w-full overflow-hidden rounded-full'>
      <div className='h-1.5 rounded-full transition-all duration-700' style={{ background: grad, width: `${pct}%` }} />
    </div>
  )
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)'
  const bg = score >= 80 ? 'var(--success-bg)' : score >= 50 ? 'var(--warning-bg)' : 'var(--danger-bg)'
  const border = score >= 80 ? 'var(--success-border)' : score >= 50 ? 'var(--warning-border)' : 'var(--danger-border)'
  return (
    <span
      className='rounded-full px-2 py-0.5 font-mono text-xs font-bold'
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      ⭐ {score}
    </span>
  )
}

export function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const {
    activeCourseSlug,
    contentVersion,
    courses,
    forceContentReload,
    progress,
    setActiveCourse,
    studentToken,
    username
  } = useBoundStore(
    useShallow((s) => ({
      activeCourseSlug: s.activeCourseSlug,
      contentVersion: s.contentVersion,
      courses: s.courses,
      forceContentReload: s.forceContentReload,
      progress: s.progress,
      setActiveCourse: s.setActiveCourse,
      studentToken: s.studentToken,
      username: s.username
    }))
  )

  useEffect(() => {
    if (!slug) return
    if (PHASES.length === 0 && contentVersion > 0) {
      forceContentReload()
      return
    }
    if (slug !== activeCourseSlug) setActiveCourse(slug)
  }, [slug, contentVersion])

  if (!username || !studentToken) return <Navigate to='/' replace />
  if (contentVersion === 0) return <Navigate to='/' replace />
  if (!slug || !courses.find((c) => c.slug === slug)) return <Navigate to='/' replace />

  const course = courses.find((c) => c.slug === slug)!

  const totalEx = EXERCISES.length
  const totalLs = LESSONS.length
  const answeredEx = EXERCISES.filter((e) => progress[e.id] !== undefined).length
  const readLs = LESSONS.filter((l) => (progress.__lessons || {})[l.id]).length
  const globalPct = totalEx + totalLs > 0 ? Math.round(((answeredEx + readLs) / (totalEx + totalLs)) * 100) : 0
  const globalScore = getGlobalAvgScore(progress)

  const hasAnyProgress = answeredEx > 0 || readLs > 0
  const step = getCurrentStep(progress)

  const getPhasePending = (phaseId: number) => {
    return EXERCISES.filter((e) => {
      if (e.phase !== phaseId) return false
      const s = progress[e.id] as ExerciseRecord | undefined
      return s?.autoCorrect === null && !s.claudeFeedback
    }).length
  }

  const handlePhase = (phaseId: number) => navigate(`/cursos/${slug}/fases/${phaseId}`)
  const handleResume = (s: { phaseId: number; tab: 'theory' | 'exercises' }) => {
    navigate(`/cursos/${slug}/fases/${s.phaseId}?tab=${s.tab}`)
  }

  return (
    <ReadingColumn width='wide'>
      <PageHeader
        eyebrow='Curso'
        title={course.name}
        subtitle={`${PHASES.length} módulos · ${username}`}
        actions={
          <button
            onClick={() => navigate(`/cursos/${slug}/notas`)}
            className='border-hairline text-fg-muted hover:text-fg rounded border px-3 py-1.5 text-xs font-medium transition-colors'
          >
            Calificaciones
          </button>
        }
      />

      <div className='space-y-5'>
        <div className='bg-card border-line shadow-panel rounded-2xl border p-6'>
          <div className='mb-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end'>
            <div>
              <p className='text-fg-subtle mb-1.5 text-xs font-bold tracking-widest uppercase'>Progreso del curso</p>
              <div className='flex flex-wrap items-baseline gap-3'>
                <span
                  className='font-mono leading-none font-semibold'
                  style={{ color: 'var(--text-1)', fontSize: '3rem', letterSpacing: '-0.04em' }}
                >
                  {globalPct}%
                </span>
                {globalScore !== null && (
                  <span className='text-fg-muted text-sm font-semibold'>
                    Score:{' '}
                    <span
                      className='font-mono font-semibold'
                      style={{
                        color:
                          globalScore >= 80 ? 'var(--success)' : globalScore >= 50 ? 'var(--warning)' : 'var(--danger)'
                      }}
                    >
                      {globalScore}/100
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className='flex items-center gap-6 pb-0.5 sm:gap-8'>
              {[
                { icon: '💻', l: 'Ejercicios', total: totalEx, v: `${answeredEx}` },
                { icon: '📚', l: 'Temas leídos', total: totalLs, v: `${readLs}` }
              ].map((s, i) => (
                <div key={i} className='text-center'>
                  <div className='text-fg font-mono text-xl leading-none font-semibold'>
                    {s.v}
                    <span className='text-fg-subtle text-sm font-bold'>/{s.total}</span>
                  </div>
                  <div className='text-fg-subtle mt-1 text-xs'>
                    {s.icon} {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ProgressBar pct={globalPct} color={globalPct >= 100 ? 'green' : 'primary'} />
        </div>

        {globalPct === 100 ? (
          <div className='bg-success-bg border-success-border flex items-center gap-4 rounded-2xl border p-5'>
            <span className='font-serif text-3xl font-normal'>🏁</span>
            <div>
              <p className='text-success text-sm font-bold'>¡Completaste el curso!</p>
              <p className='text-fg-muted mt-0.5 text-xs'>
                Revisá tus{' '}
                <button
                  onClick={() => navigate(`/cursos/${slug}/notas`)}
                  className='text-success underline underline-offset-2 transition-opacity hover:opacity-70'
                >
                  calificaciones
                </button>
                .
              </p>
            </div>
          </div>
        ) : hasAnyProgress && step ? (
          <div
            className='flex items-center justify-between gap-4 rounded-2xl p-5'
            style={{
              background: 'linear-gradient(135deg, var(--primary-glow), var(--accent-glow))',
              border: '1px solid var(--border-default)'
            }}
          >
            <div className='min-w-0'>
              <p className='text-primary mb-1 text-xs font-bold tracking-wider uppercase'>
                📍 Continuar donde lo dejaste
              </p>
              <p className='text-fg truncate text-base leading-snug font-bold'>
                {PHASES[step.phaseId]?.icon} {PHASES[step.phaseId]?.name}
              </p>
              <p className='text-fg-subtle mt-1 text-xs'>
                {step.tab === 'theory' ? '📚 Teoría pendiente' : '💻 Ejercicios pendientes'}
              </p>
            </div>
            <button
              onClick={() => handleResume(step)}
              className='shrink-0 rounded-xl px-6 py-2.5 text-sm font-bold transition-all hover:opacity-90 active:scale-95'
              style={{
                background: 'var(--grad)',
                boxShadow: '0 4px 16px var(--primary-glow)',
                color: 'var(--on-primary)',
                whiteSpace: 'nowrap'
              }}
            >
              Retomar →
            </button>
          </div>
        ) : !hasAnyProgress ? (
          <div className='border-line bg-primary-glow flex items-center justify-between gap-4 rounded-2xl border p-5'>
            <div>
              <p className='text-fg text-sm font-bold'>Comenzá por el primer módulo</p>
              <p className='text-fg-subtle mt-0.5 text-xs'>Leé la teoría y completá los ejercicios.</p>
            </div>
            <button
              onClick={() => handlePhase(0)}
              className='shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90 active:scale-95'
              style={{
                background: 'var(--grad)',
                boxShadow: '0 4px 16px var(--primary-glow)',
                color: 'var(--on-primary)',
                whiteSpace: 'nowrap'
              }}
            >
              Empezar →
            </button>
          </div>
        ) : null}

        <div>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-fg-subtle text-xs font-bold tracking-widest uppercase'>
              Módulos del curso — {PHASES.length} fases
            </h2>
            <button
              onClick={() => navigate(`/cursos/${slug}/notas`)}
              className='text-fg-subtle flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70 sm:hidden'
            >
              📊 Calificaciones
            </button>
          </div>

          <div className='stagger grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {PHASES.map((ph) => {
              const unlocked = isPhaseUnlocked(progress, ph.id)
              const ex = getPhaseExStats(progress, ph.id)
              const ls = getPhaseLsStats(progress, ph.id)
              const pending = getPhasePending(ph.id)
              const score = getPhaseAvgScore(progress, ph.id)
              const total = ex.total + ls.total
              const done = ex.answered + ls.read
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              const isComplete = done === total && total > 0 && unlocked
              const ringColor = isComplete ? 'var(--success)' : unlocked ? course.color : 'var(--tint-2)'

              return (
                <button
                  key={ph.id}
                  onClick={() => unlocked && handlePhase(ph.id)}
                  disabled={!unlocked}
                  className='w-full rounded-2xl p-5 text-left transition-all'
                  style={{
                    background: unlocked ? 'var(--bg-card)' : 'var(--tint-1)',
                    border: unlocked
                      ? isComplete
                        ? '1px solid var(--success-border)'
                        : '1px solid var(--border-default)'
                      : '1px solid var(--tint-1)',
                    boxShadow: unlocked ? 'var(--shadow-panel)' : 'none',
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    opacity: unlocked ? 1 : 0.45
                  }}
                  onMouseEnter={(e) => {
                    if (unlocked) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.55)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = ''
                    e.currentTarget.style.boxShadow = unlocked ? 'var(--shadow-panel)' : 'none'
                  }}
                >
                  <div className='mb-4 flex items-start justify-between gap-3'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='text-fg-subtle bg-tint-strong rounded-md px-2 py-0.5 font-mono text-xs font-bold'>
                        F{ph.id}
                      </span>
                      {!unlocked && <span className='text-xs'>🔒</span>}
                      {isComplete && (
                        <span className='bg-success-bg border-success-border text-success rounded-full border px-2 py-0.5 text-xs font-bold'>
                          ✓ Completado
                        </span>
                      )}
                      {unlocked && !isComplete && done > 0 && (
                        <span className='text-primary border-line bg-primary-glow rounded-full border px-2 py-0.5 text-xs font-bold'>
                          En curso
                        </span>
                      )}
                      {pending > 0 && (
                        <span className='bg-warning-bg border-warning-border text-warning rounded-full border px-1.5 py-0.5 text-xs font-semibold'>
                          🤖 {pending}
                        </span>
                      )}
                    </div>
                    <div className='relative h-[52px] w-[52px] shrink-0'>
                      <RingProgress pct={unlocked ? pct : 0} size={52} stroke={4} color={ringColor} />
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <span
                          className='font-mono text-xs font-semibold'
                          style={{ color: unlocked ? 'var(--text-1)' : 'var(--text-3)', fontSize: '0.65rem' }}
                        >
                          {unlocked ? `${pct}%` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='text-fg mb-4 text-base leading-snug font-bold'>
                    {ph.icon} {ph.name}
                  </div>

                  <div className='mb-3 flex flex-wrap items-center gap-2.5'>
                    <span className='border-hairline text-fg-muted bg-tint rounded-md border px-2 py-0.5 text-xs'>
                      📚 {ls.read}/{ls.total}
                    </span>
                    <span className='border-hairline text-fg-muted bg-tint rounded-md border px-2 py-0.5 text-xs'>
                      💻 {ex.answered}/{ex.total}
                    </span>
                    {score !== null && <ScorePill score={score} />}
                    {!unlocked && <span className='text-fg-subtle text-xs'>Completá la fase anterior</span>}
                  </div>

                  {unlocked && <ProgressBar pct={pct} color={isComplete ? 'green' : 'primary'} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </ReadingColumn>
  )
}
