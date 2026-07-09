import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { ScoresView } from '@/components/course-scores'
import { CourseIcon, ThemeToggle } from '@/components/ui'
import { useBoundStore } from '@/hooks'
import { getGlobalAvgScore, isTheoryComplete } from '@/utils/helpers/learning'
import { ALL_COURSES } from '@/utils/consts/learning-data'
import { gradeExercise } from '@/services/backend'
import type { Exercise, ExerciseRecord } from '@/types/learning'

export function CourseScores() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { username, studentToken, progress, contentVersion, courses, applyGrade } = useBoundStore(
    useShallow((s) => ({
      username: s.username,
      studentToken: s.studentToken,
      progress: s.progress,
      contentVersion: s.contentVersion,
      courses: s.courses,
      applyGrade: s.applyGrade,
    })),
  )

  const [batchGrading, setBatchGrading] = useState(false)
  const [batchDone, setBatchDone] = useState(0)

  if (!username || !studentToken) return <Navigate to="/" replace />
  if (contentVersion === 0) return <Navigate to="/" replace />
  if (!slug || !courses.find((c) => c.slug === slug)) return <Navigate to="/" replace />

  const course = courses.find((c) => c.slug === slug)!

  // Derive exercises directly from the full course data (not mutable globals)
  const fullCourse = ALL_COURSES.find((c) => c.slug === slug)
  const courseExercises: Exercise[] = fullCourse
    ? fullCourse.phases.flatMap((p) => p.exercises as Exercise[])
    : []

  const globalScore = getGlobalAvgScore(progress)

  const pendingExercises = courseExercises.filter((e) => {
    const s = progress[e.id] as ExerciseRecord | undefined
    return s && s.autoCorrect === null && !s.claudeFeedback && isTheoryComplete(progress, e.phase)
  })

  const handleBatchGrade = async () => {
    if (!studentToken || batchGrading) return
    setBatchGrading(true)
    setBatchDone(0)
    for (let i = 0; i < pendingExercises.length; i++) {
      const ex = pendingExercises[i]
      const saved = progress[ex.id] as ExerciseRecord
      try {
        const result = await gradeExercise(studentToken, ex, saved.userAnswer!)
        applyGrade(ex.id, result)
      } catch {
        // silent
      }
      setBatchDone(i + 1)
    }
    setBatchGrading(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-10 px-6 py-3.5 flex items-center gap-3"
        style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)' }}
      >
        <button
          onClick={() => navigate(`/course/${slug}`)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-70"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}
          title="Volver al curso"
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
            Calificaciones · {username}
          </div>
        </div>

        {globalScore !== null && (
          <div
            className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono"
            style={{
              background: globalScore >= 80 ? 'rgba(169,220,118,0.12)' : globalScore >= 50 ? 'rgba(255,216,102,0.12)' : 'rgba(255,97,136,0.12)',
              color: globalScore >= 80 ? '#6EE7B7' : globalScore >= 50 ? '#ffd866' : '#ffb3c6',
              border: `1px solid ${globalScore >= 80 ? 'rgba(169,220,118,0.25)' : globalScore >= 50 ? 'rgba(255,216,102,0.25)' : 'rgba(255,97,136,0.25)'}`,
            }}
          >
            ⭐ {globalScore}/100
          </div>
        )}

        <ThemeToggle />
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-black text-xl" style={{ color: 'var(--text-1)' }}>
              📊 Calificaciones
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
              {fullCourse?.phases.length ?? 0} fase{(fullCourse?.phases.length ?? 0) !== 1 ? 's' : ''} · {courseExercises.length} ejercicio{courseExercises.length !== 1 ? 's' : ''}
            </p>
          </div>
          {studentToken && pendingExercises.length > 0 && (
            <button
              onClick={handleBatchGrade}
              disabled={batchGrading}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-80"
              style={{ background: batchGrading ? 'rgba(171,157,242,0.50)' : 'var(--primary)', boxShadow: '0 2px 8px var(--primary-glow)' }}
            >
              {batchGrading ? `🤖 ${batchDone}/${pendingExercises.length}...` : `🤖 Calificar todo (${pendingExercises.length})`}
            </button>
          )}
        </div>

        <ScoresView progress={progress} courseData={fullCourse ?? null} />
      </div>
    </div>
  )
}
