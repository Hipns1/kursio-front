import type { StateCreator } from 'zustand'
import type {
  Course,
  CourseSummary,
  ExerciseRecord,
  GradeResult,
  Progress,
  StudentRoadmapResult
} from '@/types/learning'
import { applyGradeResult, saveProgress } from '@/utils/helpers/learning'
import { syncProgress } from '@/services/backend'
import { activateCourse, setCoursesData } from '@/utils/consts/learning-data'

export interface LearningSlice {
  username: string | null
  studentToken: string | null
  progress: Progress
  contentVersion: number
  courses: CourseSummary[]
  allowedCourseIds: number[]
  activeCourseSlug: string | null
  roadmap: StudentRoadmapResult | null
  roadmapChecked: boolean
  roadmapMissing: boolean

  setStudentLogin: (token: string, name: string, progress: Progress, allowedCourseIds: number[]) => void
  setAllowedCourseIds: (ids: number[]) => void
  clearUser: () => void
  setContent: (courses: Course[]) => void
  setActiveCourse: (slug: string) => void
  forceContentReload: () => void
  setRoadmap: (roadmap: StudentRoadmapResult | null) => void
  setRoadmapChecked: (checked: boolean) => void
  setRoadmapMissing: (missing: boolean) => void

  saveExercise: (exerciseId: string, record: ExerciseRecord) => void
  applyGrade: (exerciseId: string, result: GradeResult) => void
  markLessonRead: (lessonId: string) => void
  resetProgress: () => void
}

export const createLearningSlice: StateCreator<LearningSlice> = (set, get) => ({
  activeCourseSlug: null,
  allowedCourseIds: [],
  applyGrade: (exerciseId, result) => {
    const { progress, studentToken, username } = get()
    if (!username) return
    const existing = progress[exerciseId] as ExerciseRecord | undefined
    if (!existing) return
    const updated = applyGradeResult(existing, result)
    const next = { ...progress, [exerciseId]: updated }
    saveProgress(username, next)
    set({ progress: next })
    if (studentToken) syncProgress(studentToken, next).catch(() => {})
  },
  clearUser: () => {
    set({
      activeCourseSlug: null,
      allowedCourseIds: [],
      contentVersion: 0,
      courses: [],
      progress: {},
      roadmap: null,
      roadmapChecked: false,
      roadmapMissing: false,
      studentToken: null,
      username: null
    })
  },
  contentVersion: 0,
  courses: [],
  forceContentReload: () => set({ activeCourseSlug: null, contentVersion: 0, courses: [] }),
  markLessonRead: (lessonId) => {
    const { progress, studentToken, username } = get()
    if (!username) return
    const next: Progress = {
      ...progress,
      __lessons: { ...(progress.__lessons || {}), [lessonId]: true }
    }
    saveProgress(username, next)
    set({ progress: next })
    if (studentToken) syncProgress(studentToken, next).catch(() => {})
  },
  progress: {},
  resetProgress: () => {
    const { studentToken, username } = get()
    if (!username) return
    saveProgress(username, {})
    set({ progress: {} })
    if (studentToken) syncProgress(studentToken, {}).catch(() => {})
  },

  roadmap: null,

  roadmapChecked: false,

  roadmapMissing: false,

  saveExercise: (exerciseId, record) => {
    const { progress, studentToken, username } = get()
    if (!username) return
    const next = { ...progress, [exerciseId]: record }
    saveProgress(username, next)
    set({ progress: next })
    if (studentToken) syncProgress(studentToken, next).catch(() => {})
  },

  setActiveCourse: (slug) => {
    activateCourse(slug)
    set({ activeCourseSlug: slug })
  },

  setAllowedCourseIds: (ids) => set({ allowedCourseIds: ids }),

  setContent: (courses) => {
    setCoursesData(courses)
    const firstSlug = courses[0]?.slug ?? null
    if (firstSlug) activateCourse(firstSlug)
    set((s) => ({
      activeCourseSlug: s.activeCourseSlug ?? firstSlug,
      contentVersion: s.contentVersion + 1,
      courses: courses.map((c) => ({
        color: c.color,
        description: c.description,
        icon: c.icon,
        id: c.id,
        name: c.name,
        order: c.order,
        prerequisites: c.prerequisites,
        slug: c.slug
      }))
    }))
  },

  setRoadmap: (roadmap) => set({ roadmap }),

  setRoadmapChecked: (roadmapChecked) => set({ roadmapChecked }),

  setRoadmapMissing: (roadmapMissing) => set({ roadmapMissing }),

  setStudentLogin: (token, name, progress, allowedCourseIds) => {
    saveProgress(name, progress)
    set({ allowedCourseIds, progress, studentToken: token, username: name })
  },

  studentToken: null,

  username: null
})
