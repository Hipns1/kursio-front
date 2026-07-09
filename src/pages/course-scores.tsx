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

  const { applyGrade, contentVersion, courses, progress, studentToken, username } = useBoundStore(
    useShallow((s) => ({
      applyGrade: s.applyGrade,
      contentVersion: s.contentVersion,
      courses: s.courses,
      progress: s.progress,
      studentToken: s.studentToken,
      username: s.username
    }))
  )

  const [batchGrading, setBatchGrading] = useState(false)
  const [batchDone, setBatchDone] = useState(0)

  if (!username || !studentToken) return <Navigate to='/' replace />
  if (contentVersion === 0) return <Navigate to='/' replace />
  if (!slug || !courses.find((c) => c.slug === slug)) return <Navigate to='/' replace />

  const course = courses.find((c) => c.slug === slug)!

  const fullCourse = ALL_COURSES.find((c) => c.slug === slug)
  const courseExercises: Exercise[] = fullCourse ? fullCourse.phases.flatMap((p) => p.exercises as Exercise[]) : []

  const globalScore = getGlobalAvgScore(progress)

  const pendingExercises = courseExercises.filter((e) => {
    const s = progress[e.id] as ExerciseRecord | undefined
    return s?.autoCorrect === null && !s.claudeFeedback && isTheoryComplete(progress, e.phase)
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
      } catch {}
      setBatchDone(i + 1)
    }
    setBatchGrading(false)
  }

  return (
    <div className='bg-surface min-h-screen'>
      <nav className='bg-nav border-hairline sticky top-0 z-10 flex items-center gap-3 border-b px-6 py-3.5 backdrop-blur-[20px]'>
        <button
          onClick={() => navigate(`/course/${slug}`)}
          className='border-hairline bg-tint flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-all hover:opacity-70'
          title='Volver al curso'
        >
          ←
        </button>
        <div
          className='flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl text-base'
          style={{ background: `${course.color}25`, border: `1px solid ${course.color}40` }}
        >
          <CourseIcon icon={course.icon} className='h-8 w-8' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='text-fg truncate text-sm leading-tight font-semibold'>{course.name}</div>
          <div className='text-fg-subtle text-xs leading-tight'>Calificaciones · {username}</div>
        </div>

        {globalScore !== null && (
          <div
            className='rounded-xl px-3 py-1.5 font-mono text-xs font-bold'
            style={{
              background:
                globalScore >= 80 ? 'var(--success-bg)' : globalScore >= 50 ? 'var(--warning-bg)' : 'var(--danger-bg)',
              border: `1px solid ${globalScore >= 80 ? 'var(--success-border)' : globalScore >= 50 ? 'var(--warning-border)' : 'var(--danger-border)'}`,
              color: globalScore >= 80 ? 'var(--success)' : globalScore >= 50 ? 'var(--warning)' : 'var(--danger)'
            }}
          >
            ⭐ {globalScore}/100
          </div>
        )}

        <ThemeToggle />
      </nav>

      <div className='mx-auto max-w-3xl px-4 py-8'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-fg text-xl font-semibold'>📊 Calificaciones</h1>
            <p className='text-fg-subtle mt-1 text-xs'>
              {fullCourse?.phases.length ?? 0} fase{(fullCourse?.phases.length ?? 0) !== 1 ? 's' : ''} ·{' '}
              {courseExercises.length} ejercicio{courseExercises.length !== 1 ? 's' : ''}
            </p>
          </div>
          {studentToken && pendingExercises.length > 0 && (
            <button
              onClick={handleBatchGrade}
              disabled={batchGrading}
              className='rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-80'
              style={{
                background: batchGrading ? 'var(--primary-glow)' : 'var(--primary)',
                boxShadow: '0 2px 8px var(--primary-glow)'
              }}
            >
              {batchGrading
                ? `🤖 ${batchDone}/${pendingExercises.length}...`
                : `🤖 Calificar todo (${pendingExercises.length})`}
            </button>
          )}
        </div>

        <ScoresView progress={progress} courseData={fullCourse ?? null} />
      </div>
    </div>
  )
}
