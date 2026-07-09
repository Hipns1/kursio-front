export interface Phase {
  id: number
  dbId?: number
  name: string
  icon: string
  isDefault?: boolean
}

export interface CourseSummary {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  color: string
  order: number
  isDefault?: boolean
  prerequisites?: string[]
}

export type LessonBlockType = 'p' | 'code' | 'cmp' | 'tip' | 'list'

export interface LessonBlock {
  t: LessonBlockType
  v?: string
  ts?: string
  cs?: string
  lang?: string
  items?: string[]
}

export interface Lesson {
  id: string
  phase: number
  title: string
  blocks: LessonBlock[]
}

export type ExerciseType = 'multiple-choice' | 'find-bug' | 'know-output' | 'improve-code' | 'complete-code' | 'code-along'

export interface Exercise {
  id: string
  phase: number
  type: ExerciseType
  question: string
  code?: string
  options?: string[]
  correct?: number
  keywords?: string[]
  blanks?: string[]
  explanation: string
}

export interface CoursePhase extends Phase {
  lessons: Lesson[]
  exercises: Array<Exercise & { isDefault?: boolean }>
}

export interface Course extends CourseSummary {
  phases: CoursePhase[]
}

export interface ExerciseRecord {
  type: ExerciseType
  answer?: number
  userAnswer?: string
  answers?: string[]
  autoCorrect: boolean | null
  score?: number
  claudeFeedback?: string
}

export interface LessonProgress {
  [lessonId: string]: boolean
}

export interface Progress {
  __lessons?: LessonProgress
  [exerciseId: string]: ExerciseRecord | LessonProgress | undefined
}

export interface GradeResult {
  autoCorrect: boolean | null
  score: number
  feedback: string
}

export interface CurrentStep {
  phaseId: number
  tab: 'theory' | 'exercises'
}

export interface OnboardingOption {
  id: number
  text: string
  order: number
}

export interface OnboardingQuestion {
  id: number
  text: string
  order: number
  isActive: boolean
  isDefault: boolean
  options: OnboardingOption[]
}

export interface RoadmapCourseItem {
  slug: string
  reason: string
  priority: number
}

export interface StudentRoadmapResult {
  profileSummary: string
  estimatedWeeks: number
  courses: RoadmapCourseItem[]
}
