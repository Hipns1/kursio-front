import type { StateCreator } from 'zustand'
import type { Course, CourseSummary, ExerciseRecord, GradeResult, Progress, StudentRoadmapResult } from '@/types/learning'
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
  username: null,
  studentToken: null,
  progress: {},
  contentVersion: 0,
  courses: [],
  allowedCourseIds: [],
  activeCourseSlug: null,
  roadmap: null,
  roadmapChecked: false,
  roadmapMissing: false,

  setStudentLogin: (token, name, progress, allowedCourseIds) => {
    saveProgress(name, progress)
    set({ studentToken: token, username: name, progress, allowedCourseIds })
  },

  setAllowedCourseIds: (ids) => set({ allowedCourseIds: ids }),

  clearUser: () => {
    set({
      username: null,
      studentToken: null,
      progress: {},
      contentVersion: 0,
      courses: [],
      allowedCourseIds: [],
      activeCourseSlug: null,
      roadmap: null,
      roadmapChecked: false,
      roadmapMissing: false,
    })
  },

  setRoadmap: (roadmap) => set({ roadmap }),

  setRoadmapChecked: (roadmapChecked) => set({ roadmapChecked }),

  setRoadmapMissing: (roadmapMissing) => set({ roadmapMissing }),

  setContent: (courses) => {
    setCoursesData(courses)
    const firstSlug = courses[0]?.slug ?? null
    if (firstSlug) activateCourse(firstSlug)
    set((s) => ({
      courses: courses.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        icon: c.icon,
        color: c.color,
        order: c.order,
        prerequisites: c.prerequisites,
      })),
      activeCourseSlug: s.activeCourseSlug ?? firstSlug,
      contentVersion: s.contentVersion + 1,
    }))
  },

  setActiveCourse: (slug) => {
    activateCourse(slug)
    set({ activeCourseSlug: slug })
  },

  forceContentReload: () => set({ contentVersion: 0, courses: [], activeCourseSlug: null }),

  saveExercise: (exerciseId, record) => {
    const { username, studentToken, progress } = get()
    if (!username) return
    const next = { ...progress, [exerciseId]: record }
    saveProgress(username, next)
    set({ progress: next })
    if (studentToken) syncProgress(studentToken, next).catch(() => {})
  },

  applyGrade: (exerciseId, result) => {
    const { username, studentToken, progress } = get()
    if (!username) return
    const existing = progress[exerciseId] as ExerciseRecord | undefined
    if (!existing) return
    const updated = applyGradeResult(existing, result)
    const next = { ...progress, [exerciseId]: updated }
    saveProgress(username, next)
    set({ progress: next })
    if (studentToken) syncProgress(studentToken, next).catch(() => {})
  },

  markLessonRead: (lessonId) => {
    const { username, studentToken, progress } = get()
    if (!username) return
    const next: Progress = {
      ...progress,
      __lessons: { ...(progress.__lessons || {}), [lessonId]: true },
    }
    saveProgress(username, next)
    set({ progress: next })
    if (studentToken) syncProgress(studentToken, next).catch(() => {})
  },

  resetProgress: () => {
    const { username, studentToken } = get()
    if (!username) return
    saveProgress(username, {})
    set({ progress: {} })
    if (studentToken) syncProgress(studentToken, {}).catch(() => {})
  },
})
