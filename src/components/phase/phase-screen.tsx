import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ExerciseRecord, GradeResult, Progress } from '@/types/learning'
import { ExercisesTab } from '@/components/phase/exercises'
import { LessonsTab } from '@/components/phase/lessons'
import { LESSONS, PHASES } from '@/utils/consts/learning-data'
import { isTheoryComplete } from '@/utils/helpers/learning'

interface PhaseScreenProps {
  phaseId: number
  progress: Progress
  onAnswer: (exerciseId: string, record: ExerciseRecord) => void
  onMarkRead: (lessonId: string) => void
  onBack: () => void
  studentToken: string | null
  onGrade?: (exerciseId: string, result: GradeResult) => void
  onNextPhase: () => void
}

export function PhaseScreen({
  phaseId,
  progress,
  onAnswer,
  onMarkRead,
  onBack,
  studentToken,
  onGrade,
  onNextPhase,
}: PhaseScreenProps) {
  const phase = PHASES.find((p) => p.id === phaseId)
  const theoryDone = isTheoryComplete(progress, phaseId)
  const phaseLessons = LESSONS.filter((l) => l.phase === phaseId)
  const lastLessonIdx = Math.max(0, phaseLessons.length - 1)

  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as 'theory' | 'exercises' | null
  const tab = tabParam ?? (theoryDone ? 'exercises' : 'theory')

  const [lessonStartIdx, setLessonStartIdx] = useState<number | undefined>(undefined)

  const switchTab = (t: 'theory' | 'exercises') => setSearchParams({ tab: t }, { replace: true })

  if (tab === 'theory') {
    return (
      <LessonsTab
        phaseId={phaseId}
        phase={phase}
        progress={progress}
        onMarkRead={onMarkRead}
        onBack={onBack}
        startAt={lessonStartIdx}
        onGoToExercises={() => {
          setLessonStartIdx(undefined)
          switchTab('exercises')
        }}
      />
    )
  }

  return (
    <ExercisesTab
      phaseId={phaseId}
      phase={phase}
      progress={progress}
      onAnswer={onAnswer}
      studentToken={studentToken}
      onGrade={onGrade}
      onNextPhase={onNextPhase}
      onBack={onBack}
      onGoToLastLesson={() => {
        setLessonStartIdx(lastLessonIdx)
        switchTab('theory')
      }}
    />
  )
}
