import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { CourseIcon, RingProgress, ThemeToggle } from '@/components/ui'
import { useBoundStore } from '@/hooks'
import { EXERCISES, LESSONS, PHASES } from '@/utils/consts/learning-data'
import {
  getCurrentStep,
  getGlobalAvgScore,
  getPhaseAvgScore,
  getPhaseExStats,
  getPhaseLsStats,
  isPhaseUnlocked,
} from '@/utils/helpers/learning'
import type { ExerciseRecord } from '@/types/learning'

function ProgressBar({ pct, color }: { pct: number; color?: string }) {
  const grad =
    color === 'green'
      ? 'linear-gradient(90deg,#a9dc76,#75a73e)'
      : 'linear-gradient(90deg,#ab9df2,#78dce8)'
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: grad }} />
    </div>
  )
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? '#6EE7B7' : score >= 50 ? '#ffd866' : '#ffb3c6'
  const bg = score >= 80 ? 'rgba(169,220,118,0.12)' : score >= 50 ? 'rgba(255,216,102,0.12)' : 'rgba(255,97,136,0.12)'
  const border = score >= 80 ? 'rgba(169,220,118,0.25)' : score >= 50 ? 'rgba(255,216,102,0.25)' : 'rgba(255,97,136,0.25)'
  return (
    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full" style={{ background: bg, color, border: `1px solid ${border}` }}>
      ⭐ {score}
    </span>
  )
}

export function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const {
    username,
    studentToken,
    progress,
    contentVersion,
    courses,
    activeCourseSlug,
    setActiveCourse,
    forceContentReload,
  } = useBoundStore(
    useShallow((s) => ({
      username: s.username,
      studentToken: s.studentToken,
      progress: s.progress,
      contentVersion: s.contentVersion,
      courses: s.courses,
      activeCourseSlug: s.activeCourseSlug,
      setActiveCourse: s.setActiveCourse,
      forceContentReload: s.forceContentReload,
    })),
  )

  useEffect(() => {
    if (!slug) return
    if (PHASES.length === 0 && contentVersion > 0) {
      forceContentReload()
      return
    }
    if (slug !== activeCourseSlug) setActiveCourse(slug)
  }, [slug, contentVersion])

  if (!username || !studentToken) return <Navigate to="/" replace />
  if (contentVersion === 0) return <Navigate to="/" replace />
  if (!slug || !courses.find((c) => c.slug === slug)) return <Navigate to="/" replace />

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
      return s && s.autoCorrect === null && !s.claudeFeedback
    }).length
  }

  const handlePhase = (phaseId: number) => navigate(`/course/${slug}/phase/${phaseId}`)
  const handleResume = (s: { phaseId: number; tab: 'theory' | 'exercises' }) => {
    navigate(`/course/${slug}/phase/${s.phaseId}?tab=${s.tab}`)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-10 px-6 py-3.5 flex items-center gap-3"
        style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-70"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}
          title="Volver a cursos"
        >
          ←
        </button>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 overflow-hidden"
          style={{ background: `${course.color}25`, border: `1px solid ${course.color}40` }}
        >
          <CourseIcon icon={course.icon} className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-sm leading-tight truncate" style={{ color: 'var(--text-1)' }}>
            {course.name}
          </div>
          <div className="text-xs leading-tight" style={{ color: 'var(--text-3)' }}>
            {PHASES.length} módulos · {username}
          </div>
        </div>

        <button
          onClick={() => navigate(`/course/${slug}/scores`)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 hidden sm:flex items-center gap-1.5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-2)' }}
        >
          📊 Calificaciones
        </button>

        <ThemeToggle />
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">

        {/* ── Progress hero card ── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-3)' }}>
                Progreso del curso
              </p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span
                  className="font-black font-mono leading-none"
                  style={{ fontSize: '3rem', color: 'var(--text-1)', letterSpacing: '-0.04em' }}
                >
                  {globalPct}%
                </span>
                {globalScore !== null && (
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>
                    Score:{' '}
                    <span
                      className="font-mono font-black"
                      style={{ color: globalScore >= 80 ? 'var(--success)' : globalScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}
                    >
                      {globalScore}/100
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 sm:gap-8 pb-0.5">
              {[
                { v: `${answeredEx}`, total: totalEx, l: 'Ejercicios', icon: '💻' },
                { v: `${readLs}`, total: totalLs, l: 'Temas leídos', icon: '📚' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-black font-mono leading-none text-xl" style={{ color: 'var(--text-1)' }}>
                    {s.v}<span className="text-sm font-bold" style={{ color: 'var(--text-3)' }}>/{s.total}</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{s.icon} {s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <ProgressBar pct={globalPct} color={globalPct >= 100 ? 'green' : 'primary'} />
        </div>

        {/* ── Contextual action banner ── */}
        {globalPct === 100 ? (
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}
          >
            <span className="text-3xl">🏁</span>
            <div>
              <p className="font-bold text-sm" style={{ color: '#6EE7B7' }}>¡Completaste el curso!</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
                Revisá tus{' '}
                <button
                  onClick={() => navigate(`/course/${slug}/scores`)}
                  className="underline underline-offset-2 transition-opacity hover:opacity-70"
                  style={{ color: '#6EE7B7' }}
                >
                  calificaciones
                </button>
                .
              </p>
            </div>
          </div>
        ) : hasAnyProgress && step ? (
          <div
            className="rounded-2xl p-5 flex items-center justify-between gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(171,157,242,0.11), rgba(120,220,232,0.06))',
              border: '1px solid var(--border-default)',
            }}
          >
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--primary)' }}>
                📍 Continuar donde lo dejaste
              </p>
              <p className="font-bold text-base leading-snug truncate" style={{ color: 'var(--text-1)' }}>
                {PHASES[step.phaseId]?.icon} {PHASES[step.phaseId]?.name}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                {step.tab === 'theory' ? '📚 Teoría pendiente' : '💻 Ejercicios pendientes'}
              </p>
            </div>
            <button
              onClick={() => handleResume(step)}
              className="shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--grad)', color: '#fff', boxShadow: '0 4px 16px var(--primary-glow)', whiteSpace: 'nowrap' }}
            >
              Retomar →
            </button>
          </div>
        ) : !hasAnyProgress ? (
          <div
            className="rounded-2xl p-5 flex items-center justify-between gap-4"
            style={{ background: 'rgba(171,157,242,0.06)', border: '1px solid var(--border-default)' }}
          >
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>Comenzá por el primer módulo</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Leé la teoría y completá los ejercicios.</p>
            </div>
            <button
              onClick={() => handlePhase(0)}
              className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--grad)', color: '#fff', boxShadow: '0 4px 16px var(--primary-glow)', whiteSpace: 'nowrap' }}
            >
              Empezar →
            </button>
          </div>
        ) : null}

        {/* ── Phases grid ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
              Módulos del curso — {PHASES.length} fases
            </h2>
            <button
              onClick={() => navigate(`/course/${slug}/scores`)}
              className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70 sm:hidden"
              style={{ color: 'var(--text-3)' }}
            >
              📊 Calificaciones
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
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
              const ringColor = isComplete ? 'var(--success)' : unlocked ? course.color : 'rgba(255,255,255,0.07)'

              return (
                <button
                  key={ph.id}
                  onClick={() => unlocked && handlePhase(ph.id)}
                  disabled={!unlocked}
                  className="w-full text-left rounded-2xl p-5 transition-all"
                  style={{
                    background: unlocked ? 'var(--bg-card)' : 'rgba(255,255,255,0.012)',
                    border: unlocked ? isComplete ? '1px solid var(--success-border)' : '1px solid var(--border-default)' : '1px solid rgba(255,255,255,0.04)',
                    opacity: unlocked ? 1 : 0.45,
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    boxShadow: unlocked ? 'var(--shadow-card)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (unlocked) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.55)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = ''
                    e.currentTarget.style.boxShadow = unlocked ? 'var(--shadow-card)' : 'none'
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-md font-mono"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-3)' }}
                      >
                        F{ph.id}
                      </span>
                      {!unlocked && <span className="text-xs">🔒</span>}
                      {isComplete && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--success-bg)', color: '#6EE7B7', border: '1px solid var(--success-border)' }}
                        >
                          ✓ Completado
                        </span>
                      )}
                      {unlocked && !isComplete && done > 0 && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(171,157,242,0.10)', color: 'var(--primary)', border: '1px solid var(--border-default)' }}
                        >
                          En curso
                        </span>
                      )}
                      {pending > 0 && (
                        <span
                          className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'var(--warning-bg)', color: '#ffd866', border: '1px solid var(--warning-border)' }}
                        >
                          🤖 {pending}
                        </span>
                      )}
                    </div>
                    <div className="relative shrink-0" style={{ width: 52, height: 52 }}>
                      <RingProgress pct={unlocked ? pct : 0} size={52} stroke={4} color={ringColor} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-black font-mono" style={{ color: unlocked ? 'var(--text-1)' : 'var(--text-3)', fontSize: '0.65rem' }}>
                          {unlocked ? `${pct}%` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="font-bold text-base leading-snug mb-4" style={{ color: 'var(--text-1)' }}>
                    {ph.icon} {ph.name}
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-2)' }}>
                      📚 {ls.read}/{ls.total}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-2)' }}>
                      💻 {ex.answered}/{ex.total}
                    </span>
                    {score !== null && <ScorePill score={score} />}
                    {!unlocked && <span className="text-xs" style={{ color: 'var(--text-3)' }}>Completá la fase anterior</span>}
                  </div>

                  {unlocked && <ProgressBar pct={pct} color={isComplete ? 'green' : 'primary'} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
