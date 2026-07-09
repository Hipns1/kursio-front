import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CourseSummary, GradeResult, Progress } from '@/types/learning'
import { RingProgress, ThemeToggle } from '@/components/ui'
import { ALL_COURSES, EXERCISES, LESSONS, PHASES } from '@/utils/consts/learning-data'
import {
  getCurrentStep,
  getPhaseExStats,
  getPhaseLsStats,
  isPhaseComplete,
  isPhaseUnlocked,
} from '@/utils/helpers/learning'

interface DashboardProps {
  username: string
  progress: Progress
  courses: CourseSummary[]
  onCourse: (slug: string) => void
  studentToken: string | null
  onGrade: (exerciseId: string, result: GradeResult) => void
  onSettings: () => void
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 select-none"
      style={{ background: 'var(--grad)', color: '#fff' }}
    >
      {initials || '?'}
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  badgeColor = '#ab9df2',
}: {
  icon: string
  value: string
  label: string
  badgeColor?: string
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
        style={{ background: `${badgeColor}18`, border: `1px solid ${badgeColor}30` }}
      >
        {icon}
      </div>
      <div className="font-black text-2xl font-mono leading-none mb-0.5" style={{ color: 'var(--text-1)' }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-3)' }}>
        {label}
      </div>
    </div>
  )
}

function DonutStat({
  pct,
  label,
  count,
  color,
}: {
  pct: number
  label: string
  count: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <RingProgress pct={pct} size={72} stroke={6} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-black text-sm font-mono" style={{ color: 'var(--text-1)' }}>
            {pct}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>
          {label}
        </div>
        <div className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
          {count}
        </div>
      </div>
    </div>
  )
}

export function Dashboard({ username, progress, courses, onSettings }: DashboardProps) {
  const navigate = useNavigate()
  const [barMounted, setBarMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setBarMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const totalEx = EXERCISES.length
  const totalLs = LESSONS.length
  const answeredEx = Object.keys(progress).filter((k) => !k.startsWith('__')).length
  const readLs = Object.keys(progress.__lessons || {}).length
  const globalPct =
    totalEx + totalLs > 0
      ? Math.round(((answeredEx + readLs) / (totalEx + totalLs)) * 100)
      : 0

  const completedPhases = PHASES.filter((p) => isPhaseComplete(progress, p.id)).length
  const phasesPct = PHASES.length > 0 ? Math.round((completedPhases / PHASES.length) * 100) : 0
  const lsPct = totalLs > 0 ? Math.round((readLs / totalLs) * 100) : 0
  const exPct = totalEx > 0 ? Math.round((answeredEx / totalEx) * 100) : 0

  const currentStep = getCurrentStep(progress)
  const heroPhase = currentStep ? PHASES.find((p) => p.id === currentStep.phaseId) : PHASES[0]

  const heroCourseData = heroPhase
    ? ALL_COURSES.find((c: { slug: string; phases: { id: number }[] }) =>
        c.phases.some((p) => p.id === heroPhase.id),
      )
    : ALL_COURSES[0]
  const heroCourse = heroCourseData
    ? courses.find((c) => c.slug === heroCourseData.slug)
    : courses[0]

  const heroLs = heroPhase ? getPhaseLsStats(progress, heroPhase.id) : { total: 0, read: 0 }
  const heroEx = heroPhase ? getPhaseExStats(progress, heroPhase.id) : { total: 0, answered: 0 }
  const heroPct =
    heroLs.total + heroEx.total > 0
      ? Math.round(((heroLs.read + heroEx.answered) / (heroLs.total + heroEx.total)) * 100)
      : 0

  const handleResume = () => {
    if (!heroCourse || !heroPhase) return
    const tab = currentStep?.tab ?? 'theory'
    navigate(`/course/${heroCourse.slug}/phase/${heroPhase.id}?tab=${tab}`)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
        style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div>
          <div className="font-black text-lg leading-tight" style={{ color: 'var(--text-1)' }}>
            Dashboard
          </div>
          <div className="text-xs" style={{ color: 'var(--text-3)' }}>
            Bienvenido de nuevo, {username}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onSettings}
            title="Configuración"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}
          >
            ⚙️
          </button>
          <UserAvatar name={username} />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5 animate-fade-up">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
          <StatCard icon="🎯" value={`${globalPct}%`} label="Progreso Total" badgeColor="#78dce8" />
          <StatCard icon="🏆" value={String(answeredEx)} label="Ejercicios Resueltos" badgeColor="#a9dc76" />
          <StatCard icon="📖" value={`${readLs}/${totalLs}`} label="Lecciones Leídas" badgeColor="#8b5cf6" />
          <StatCard
            icon="⚡"
            value={`${completedPhases}/${PHASES.length}`}
            label="Fases Completadas"
            badgeColor="#ffd866"
          />
        </div>

        {/* ── Hero banner ── */}
        {heroPhase && (
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)' }}
          >
            <div
              className="absolute top-4 right-4 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}
            >
              {heroPhase.icon}
            </div>
            <span
              className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}
            >
              Continuar Aprendiendo
            </span>
            <h2 className="font-black text-xl leading-snug mb-1 pr-24" style={{ color: '#fff' }}>
              {heroPhase.name}
            </h2>
            <p className="text-sm mb-4 pr-24" style={{ color: 'rgba(255,255,255,0.70)' }}>
              Fase {heroPhase.id} · {heroLs.total} lecciones · {heroEx.total} ejercicios
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.70)' }}>
                Tu progreso en esta fase
              </span>
              <span className="text-xs font-bold" style={{ color: '#fff' }}>
                {heroPct}%
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full mb-4"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: barMounted ? `${heroPct}%` : '0%',
                  background: '#fff',
                  transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
            <button
              onClick={handleResume}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ background: '#fff', color: '#7c3aed' }}
            >
              ▶ Continuar Lección
            </button>
          </div>
        )}

        {/* ── Progreso General ── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>
                Progreso General
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {courses[0]?.name ?? '.NET Backend Learning'}
              </p>
            </div>
            <span className="font-black text-xl font-mono" style={{ color: 'var(--primary)' }}>
              {globalPct}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <DonutStat pct={lsPct} label="Lecciones" count={`${readLs}/${totalLs}`} color="#ab9df2" />
            <DonutStat pct={exPct} label="Ejercicios" count={`${answeredEx}/${totalEx}`} color="#8b5cf6" />
            <DonutStat pct={phasesPct} label="Fases" count={`${completedPhases}/${PHASES.length}`} color="#22c55e" />
          </div>
        </div>

        {/* ── Ruta de Aprendizaje ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>
                Tu Ruta de Aprendizaje
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {PHASES.length} módulos · Progreso secuencial
              </p>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(34,197,94,0.10)',
                color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.20)',
              }}
            >
              {completedPhases} de {PHASES.length} Completadas
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {PHASES.map((phase) => {
              const unlocked = isPhaseUnlocked(progress, phase.id)
              const complete = isPhaseComplete(progress, phase.id)
              const ls = getPhaseLsStats(progress, phase.id)
              const ex = getPhaseExStats(progress, phase.id)
              const pct =
                ls.total + ex.total > 0
                  ? Math.round(((ls.read + ex.answered) / (ls.total + ex.total)) * 100)
                  : 0
              const cData = ALL_COURSES.find((c: { slug: string; phases: { id: number }[] }) =>
                c.phases.some((p) => p.id === phase.id),
              )
              const cSummary = cData ? courses.find((c) => c.slug === cData.slug) : null
              const isCurrent = currentStep?.phaseId === phase.id

              return (
                <button
                  key={phase.id}
                  onClick={() => {
                    if (unlocked && cSummary) {
                      navigate(`/course/${cSummary.slug}/phase/${phase.id}?tab=theory`)
                    }
                  }}
                  disabled={!unlocked}
                  className="text-left rounded-2xl p-4 transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--bg-card)',
                    border: isCurrent
                      ? '1px solid rgba(171,157,242,0.50)'
                      : complete
                        ? '1px solid rgba(34,197,94,0.25)'
                        : '1px solid var(--border-subtle)',
                    opacity: unlocked ? 1 : 0.55,
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
                      FASE {phase.id}
                    </span>
                    {!unlocked && <span style={{ fontSize: '0.65rem' }}>🔒</span>}
                    {complete && <span style={{ fontSize: '0.65rem', color: '#22c55e' }}>✓</span>}
                  </div>
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xl shrink-0">{phase.icon}</span>
                    <p
                      className="text-xs font-semibold leading-snug"
                      style={{ color: unlocked ? 'var(--text-1)' : 'var(--text-3)' }}
                    >
                      {phase.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                      📖 {ls.read}/{ls.total}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                      💻 {ex.answered}/{ex.total}
                    </span>
                  </div>
                  {unlocked ? (
                    <>
                      <div
                        className="w-full h-1 rounded-full mb-2"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <div
                          className="h-1 rounded-full"
                          style={{
                            width: barMounted ? `${pct}%` : '0%',
                            background: complete ? '#22c55e' : 'var(--primary)',
                            transition: 'width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          }}
                        />
                      </div>
                      <div
                        className="text-xs font-semibold"
                        style={{ color: complete ? '#22c55e' : 'var(--primary)' }}
                      >
                        {complete ? '✓ Completada' : pct > 0 ? 'Continuar →' : 'Empezar →'}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                      Completá la fase anterior para desbloquear
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
