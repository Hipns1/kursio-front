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
  isPhaseUnlocked
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
    <div className='bg-grad text-on-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold select-none'>
      {initials || '?'}
    </div>
  )
}

function StatCard({
  badgeColor = 'var(--primary)',
  icon,
  label,
  value
}: {
  icon: string
  value: string
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

function DonutStat({ color, count, label, pct }: { pct: number; label: string; count: string; color: string }) {
  return (
    <div className='flex flex-col items-center gap-2'>
      <div className='relative'>
        <RingProgress pct={pct} size={72} stroke={6} color={color} />
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='text-fg font-mono text-sm font-semibold'>{pct}%</span>
        </div>
      </div>
      <div className='text-center'>
        <div className='text-fg-muted text-xs font-semibold'>{label}</div>
        <div className='text-fg-subtle font-mono text-xs'>{count}</div>
      </div>
    </div>
  )
}

export function Dashboard({ courses, onSettings, progress, username }: DashboardProps) {
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
  const globalPct = totalEx + totalLs > 0 ? Math.round(((answeredEx + readLs) / (totalEx + totalLs)) * 100) : 0

  const completedPhases = PHASES.filter((p) => isPhaseComplete(progress, p.id)).length
  const phasesPct = PHASES.length > 0 ? Math.round((completedPhases / PHASES.length) * 100) : 0
  const lsPct = totalLs > 0 ? Math.round((readLs / totalLs) * 100) : 0
  const exPct = totalEx > 0 ? Math.round((answeredEx / totalEx) * 100) : 0

  const currentStep = getCurrentStep(progress)
  const heroPhase = currentStep ? PHASES.find((p) => p.id === currentStep.phaseId) : PHASES[0]

  const heroCourseData = heroPhase
    ? ALL_COURSES.find((c: { slug: string; phases: { id: number }[] }) => c.phases.some((p) => p.id === heroPhase.id))
    : ALL_COURSES[0]
  const heroCourse = heroCourseData ? courses.find((c) => c.slug === heroCourseData.slug) : courses[0]

  const heroLs = heroPhase ? getPhaseLsStats(progress, heroPhase.id) : { read: 0, total: 0 }
  const heroEx = heroPhase ? getPhaseExStats(progress, heroPhase.id) : { answered: 0, total: 0 }
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
    <div className='bg-surface min-h-screen'>
      <nav className='bg-nav border-hairline sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 backdrop-blur-[20px]'>
        <div>
          <div className='text-fg text-lg leading-tight font-semibold'>Dashboard</div>
          <div className='text-fg-subtle text-xs'>Bienvenido de nuevo, {username}</div>
        </div>
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <button
            onClick={onSettings}
            title='Configuración'
            className='border-hairline bg-tint flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:opacity-70'
          >
            ⚙️
          </button>
          <UserAvatar name={username} />
        </div>
      </nav>

      <div className='animate-fade-up mx-auto max-w-5xl space-y-5 px-4 py-6'>
        <div className='stagger grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <StatCard icon='🎯' value={`${globalPct}%`} label='Progreso Total' badgeColor='var(--accent)' />
          <StatCard icon='🏆' value={String(answeredEx)} label='Ejercicios Resueltos' badgeColor='var(--success)' />
          <StatCard icon='📖' value={`${readLs}/${totalLs}`} label='Lecciones Leídas' badgeColor='var(--primary)' />
          <StatCard
            icon='⚡'
            value={`${completedPhases}/${PHASES.length}`}
            label='Fases Completadas'
            badgeColor='var(--warning)'
          />
        </div>

        {heroPhase && (
          <div className='relative overflow-hidden rounded-2xl p-6' style={{ background: 'var(--grad)' }}>
            <div className='bg-on-primary/10 absolute top-4 right-4 flex h-20 w-20 items-center justify-center rounded-2xl font-serif text-4xl font-normal backdrop-blur-[8px]'>
              {heroPhase.icon}
            </div>
            <span className='bg-on-primary/15 text-on-primary mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold'>
              Continuar Aprendiendo
            </span>
            <h2 className='text-on-primary mb-1 pr-24 text-xl leading-snug font-semibold'>{heroPhase.name}</h2>
            <p className='text-on-primary/70 mb-4 pr-24 text-sm'>
              Fase {heroPhase.id} · {heroLs.total} lecciones · {heroEx.total} ejercicios
            </p>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-on-primary/70 text-xs'>Tu progreso en esta fase</span>
              <span className='text-on-primary text-xs font-bold'>{heroPct}%</span>
            </div>
            <div className='bg-on-primary/15 mb-4 h-1.5 w-full rounded-full'>
              <div
                className='h-1.5 rounded-full'
                style={{
                  background: 'var(--on-primary)',
                  transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  width: barMounted ? `${heroPct}%` : '0%'
                }}
              />
            </div>
            <button
              onClick={handleResume}
              className='bg-on-primary text-primary flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105 hover:opacity-90 active:scale-95'
            >
              ▶ Continuar Lección
            </button>
          </div>
        )}

        <div className='bg-card border-hairline rounded-2xl border p-5'>
          <div className='mb-5 flex items-center justify-between'>
            <div>
              <h3 className='text-fg text-sm font-bold'>Progreso General</h3>
              <p className='text-fg-subtle text-xs'>{courses[0]?.name ?? '.NET Backend Learning'}</p>
            </div>
            <span className='text-primary font-mono text-xl font-semibold'>{globalPct}%</span>
          </div>
          <div className='grid grid-cols-3 gap-4'>
            <DonutStat pct={lsPct} label='Lecciones' count={`${readLs}/${totalLs}`} color='var(--primary)' />
            <DonutStat pct={exPct} label='Ejercicios' count={`${answeredEx}/${totalEx}`} color='var(--primary)' />
            <DonutStat
              pct={phasesPct}
              label='Fases'
              count={`${completedPhases}/${PHASES.length}`}
              color='var(--success)'
            />
          </div>
        </div>

        <div>
          <div className='mb-3 flex items-center justify-between'>
            <div>
              <h3 className='text-fg text-sm font-bold'>Tu Ruta de Aprendizaje</h3>
              <p className='text-fg-subtle text-xs'>{PHASES.length} módulos · Progreso secuencial</p>
            </div>
            <span className='text-success rounded-full border border-[rgba(34,197,94,0.20)] bg-[rgba(34,197,94,0.10)] px-2.5 py-1 text-xs font-semibold'>
              {completedPhases} de {PHASES.length} Completadas
            </span>
          </div>

          <div className='grid grid-cols-2 gap-3 lg:grid-cols-3'>
            {PHASES.map((phase) => {
              const unlocked = isPhaseUnlocked(progress, phase.id)
              const complete = isPhaseComplete(progress, phase.id)
              const ls = getPhaseLsStats(progress, phase.id)
              const ex = getPhaseExStats(progress, phase.id)
              const pct =
                ls.total + ex.total > 0 ? Math.round(((ls.read + ex.answered) / (ls.total + ex.total)) * 100) : 0
              const cData = ALL_COURSES.find((c: { slug: string; phases: { id: number }[] }) =>
                c.phases.some((p) => p.id === phase.id)
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
                  className='rounded-2xl p-4 text-left transition-all hover:scale-[1.02]'
                  style={{
                    background: 'var(--bg-card)',
                    border: isCurrent
                      ? '1px solid var(--primary-glow)'
                      : complete
                        ? '1px solid rgba(34,197,94,0.25)'
                        : '1px solid var(--border-subtle)',
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    opacity: unlocked ? 1 : 0.55
                  }}
                >
                  <div className='mb-1.5 flex items-center gap-1.5'>
                    <span className='text-fg-subtle text-xs font-bold tracking-widest uppercase'>FASE {phase.id}</span>
                    {!unlocked && <span className='text-[0.65rem]'>🔒</span>}
                    {complete && <span className='text-success text-[0.65rem]'>✓</span>}
                  </div>
                  <div className='mb-3 flex items-start gap-2'>
                    <span className='shrink-0 text-xl'>{phase.icon}</span>
                    <p
                      className='text-xs leading-snug font-semibold'
                      style={{ color: unlocked ? 'var(--text-1)' : 'var(--text-3)' }}
                    >
                      {phase.name}
                    </p>
                  </div>
                  <div className='mb-2.5 flex items-center gap-3'>
                    <span className='text-fg-subtle text-xs'>
                      📖 {ls.read}/{ls.total}
                    </span>
                    <span className='text-fg-subtle text-xs'>
                      💻 {ex.answered}/{ex.total}
                    </span>
                  </div>
                  {unlocked ? (
                    <>
                      <div className='bg-tint-strong mb-2 h-1 w-full rounded-full'>
                        <div
                          className='h-1 rounded-full'
                          style={{
                            background: complete ? 'var(--success)' : 'var(--primary)',
                            transition: 'width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            width: barMounted ? `${pct}%` : '0%'
                          }}
                        />
                      </div>
                      <div
                        className='text-xs font-semibold'
                        style={{ color: complete ? 'var(--success)' : 'var(--primary)' }}
                      >
                        {complete ? '✓ Completada' : pct > 0 ? 'Continuar →' : 'Empezar →'}
                      </div>
                    </>
                  ) : (
                    <p className='text-fg-subtle text-xs'>Completá la fase anterior para desbloquear</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className='h-4' />
      </div>
    </div>
  )
}
