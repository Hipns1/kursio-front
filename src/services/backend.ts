import type {
  Course,
  CourseSummary,
  Exercise,
  GradeResult,
  Lesson,
  OnboardingQuestion,
  Phase,
  Progress,
  StudentRoadmapResult
} from '@/types/learning'

const BASE_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:5100/v1'

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { headers: initHeaders, ...rest } = init
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...(initHeaders as Record<string, string>) }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${res.status}${text ? ': ' + text : ''}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function bearer(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

export interface StudentLoginResult {
  accessToken: string
  studentId: number
  name: string
  allowedCourseIds: number[]
}

export interface AdminLoginResult {
  accessToken: string
}

export interface StudentSummary {
  id: number
  name: string
  documentNumber: string
  accessKey: string
  isActive: boolean
  exercisesDone: number
  lessonsRead: number
  averageScore: number | null
  createdAt: string
  lastActivity: string | null
  lastLessonAt?: string | null
  allowedCourseIds?: number[]
}

export interface CreatedStudent {
  id: number
  name: string
  documentNumber: string
  accessKey: string
}

export function studentLogin(accessKey: string): Promise<StudentLoginResult> {
  return api('/learning/auth/student/login', {
    body: JSON.stringify({ accessKey }),
    method: 'POST'
  })
}

export function adminLogin(username: string, password: string): Promise<AdminLoginResult> {
  return api('/learning/auth/admin/login', {
    body: JSON.stringify({ password, username }),
    method: 'POST'
  })
}

export function validateStudentSession(token: string): Promise<{ isActive: boolean; allowedCourseIds: number[] }> {
  return api('/learning/auth/student/validate', {
    headers: bearer(token)
  })
}

export async function fetchProgress(token: string): Promise<Progress> {
  const data = await api<{ progressData: string }>('/learning/progress', {
    headers: bearer(token)
  })
  try {
    return JSON.parse(data.progressData) as Progress
  } catch {
    return {}
  }
}

export function syncProgress(token: string, progress: Progress): Promise<void> {
  return api('/learning/progress', {
    body: JSON.stringify({ progressData: JSON.stringify(progress) }),
    headers: bearer(token),
    method: 'PUT'
  })
}

export function gradeExercise(token: string, exercise: Exercise, userAnswer: string): Promise<GradeResult> {
  return api('/learning/grade', {
    body: JSON.stringify({
      code: exercise.code ?? null,
      exerciseId: exercise.id,
      exerciseType: exercise.type,
      explanation: exercise.explanation,
      question: exercise.question,
      userAnswer
    }),
    headers: bearer(token),
    method: 'POST'
  })
}

export function getStudents(token: string): Promise<StudentSummary[]> {
  return api('/learning/admin/students', {
    headers: bearer(token)
  })
}

export function getCourses(token: string): Promise<CourseSummary[]> {
  return api('/learning/admin/courses', {
    headers: bearer(token)
  })
}

export function createStudent(
  token: string,
  name: string,
  documentNumber: string,
  allowedCourseIds: number[] = []
): Promise<CreatedStudent> {
  return api('/learning/admin/students', {
    body: JSON.stringify({ allowedCourseIds, documentNumber, name }),
    headers: bearer(token),
    method: 'POST'
  })
}

export interface CourseContent {
  courses: Course[]
}

export function fetchContent(token: string): Promise<CourseContent> {
  return api('/learning/content', { headers: bearer(token) })
}

export interface AddExercisePayload {
  courseId: number
  phaseOrder: number
  exerciseType: string
  question: string
  code?: string
  options?: string[]
  correct?: number
  keywords?: string[]
  blanks?: string[]
  explanation: string
}

export interface AdminExercise extends Exercise {
  isDefault: boolean
}

export function addExercise(token: string, payload: AddExercisePayload): Promise<AdminExercise> {
  return api('/learning/admin/content/exercises', {
    body: JSON.stringify(payload),
    headers: bearer(token),
    method: 'POST'
  })
}

export function deleteExercise(token: string, slugId: string): Promise<void> {
  return api(`/learning/admin/content/exercises/${slugId}`, {
    headers: bearer(token),
    method: 'DELETE'
  })
}

export function updateExercise(
  token: string,
  slugId: string,
  payload: Omit<AddExercisePayload, 'courseId' | 'phaseOrder'>
): Promise<AdminExercise> {
  return api(`/learning/admin/content/exercises/${slugId}`, {
    body: JSON.stringify(payload),
    headers: bearer(token),
    method: 'PUT'
  })
}

export function updateLesson(
  token: string,
  slugId: string,
  payload: { title: string; blocksJson: string }
): Promise<Lesson> {
  return api(`/learning/admin/content/lessons/${slugId}`, {
    body: JSON.stringify(payload),
    headers: bearer(token),
    method: 'PUT'
  })
}

export function deleteLesson(token: string, slugId: string): Promise<void> {
  return api(`/learning/admin/content/lessons/${slugId}`, {
    headers: bearer(token),
    method: 'DELETE'
  })
}

export function resetStudentProgress(token: string, studentId: number): Promise<void> {
  return api(`/learning/admin/students/${studentId}/reset-progress`, {
    headers: bearer(token),
    method: 'POST'
  })
}

export interface StudentProgressEntry {
  exerciseId: string
  score: number
  feedback?: string
  answeredAt?: string
}

export interface StudentProgressDetail {
  exercises: StudentProgressEntry[]
  lessonsRead: string[]
}

export function getStudentProgress(token: string, studentId: number): Promise<StudentProgressDetail> {
  return api(`/learning/admin/students/${studentId}/progress`, {
    headers: bearer(token)
  })
}

export interface CreateCoursePayload {
  name: string
  description: string
  icon: string
  color: string
  slug: string
  order: number
}

export function createCourse(token: string, payload: CreateCoursePayload): Promise<CourseSummary> {
  return api('/learning/admin/courses', {
    body: JSON.stringify(payload),
    headers: bearer(token),
    method: 'POST'
  })
}

export interface CreatePhasePayload {
  courseId: number
  name: string
  icon: string
  order: number
}

export function createPhase(token: string, payload: CreatePhasePayload): Promise<Phase> {
  return api('/learning/admin/phases', {
    body: JSON.stringify(payload),
    headers: bearer(token),
    method: 'POST'
  })
}

export interface AddLessonPayload {
  courseId: number
  phaseOrder: number
  title: string
  blocksJson: string
}

export function addLesson(token: string, payload: AddLessonPayload): Promise<Lesson> {
  return api('/learning/admin/content/lessons', {
    body: JSON.stringify(payload),
    headers: bearer(token),
    method: 'POST'
  })
}

export interface UpdateCoursePayload {
  name: string
  description: string
  icon: string
  color: string
  slug: string
  order: number
  prerequisites?: string[]
}

export function updateCourse(token: string, id: number, payload: UpdateCoursePayload): Promise<CourseSummary> {
  return api(`/learning/admin/courses/${id}`, {
    body: JSON.stringify(payload),
    headers: bearer(token),
    method: 'PUT'
  })
}

export function updatePhase(token: string, id: number, payload: { name: string; icon: string }): Promise<void> {
  return api(`/learning/admin/phases/${id}`, {
    body: JSON.stringify(payload),
    headers: bearer(token),
    method: 'PUT'
  })
}

export interface UpdateStudentPayload {
  name: string
  documentNumber: string
  allowedCourseIds: number[]
  isActive: boolean
}

export function updateStudent(token: string, id: number, payload: UpdateStudentPayload): Promise<StudentSummary> {
  return api(`/learning/admin/students/${id}`, {
    body: JSON.stringify(payload),
    headers: bearer(token),
    method: 'PUT'
  })
}

export function deleteStudent(token: string, id: number): Promise<void> {
  return api(`/learning/admin/students/${id}`, {
    headers: bearer(token),
    method: 'DELETE'
  })
}

export function toggleStudentActive(token: string, id: number): Promise<StudentSummary> {
  return api(`/learning/admin/students/${id}/toggle`, {
    headers: bearer(token),
    method: 'PATCH'
  })
}

export function deleteCourse(token: string, id: number): Promise<void> {
  return api(`/learning/admin/courses/${id}`, {
    headers: bearer(token),
    method: 'DELETE'
  })
}

export function deletePhase(token: string, id: number): Promise<void> {
  return api(`/learning/admin/phases/${id}`, {
    headers: bearer(token),
    method: 'DELETE'
  })
}

export function getOnboardingQuestions(token: string): Promise<OnboardingQuestion[]> {
  return api('/learning/onboarding/questions', { headers: bearer(token) })
}

export interface OnboardingAnswerItem {
  questionId: number
  optionId: number
}

export function submitOnboarding(token: string, answers: OnboardingAnswerItem[]): Promise<StudentRoadmapResult> {
  return api('/learning/onboarding/submit', {
    body: JSON.stringify({ answers }),
    headers: bearer(token),
    method: 'POST'
  })
}

export function getRoadmap(token: string): Promise<StudentRoadmapResult> {
  return api('/learning/onboarding/roadmap', { headers: bearer(token) })
}

export function getAdminOnboardingQuestions(token: string): Promise<OnboardingQuestion[]> {
  return api('/learning/admin/onboarding/questions', { headers: bearer(token) })
}

export interface CreateOnboardingQuestionPayload {
  text: string
  order: number
  isActive: boolean
  options: string[]
}

export function createOnboardingQuestion(
  token: string,
  payload: CreateOnboardingQuestionPayload
): Promise<OnboardingQuestion> {
  return api('/learning/admin/onboarding/questions', {
    body: JSON.stringify(payload),
    headers: bearer(token),
    method: 'POST'
  })
}

export interface UpdateOnboardingQuestionPayload {
  text: string
  order: number
  isActive: boolean
  options: string[]
}

export function updateOnboardingQuestion(
  token: string,
  id: number,
  payload: UpdateOnboardingQuestionPayload
): Promise<OnboardingQuestion> {
  return api(`/learning/admin/onboarding/questions/${id}`, {
    body: JSON.stringify(payload),
    headers: bearer(token),
    method: 'PUT'
  })
}

export function deleteOnboardingQuestion(token: string, id: number): Promise<void> {
  return api(`/learning/admin/onboarding/questions/${id}`, {
    headers: bearer(token),
    method: 'DELETE'
  })
}

export type { Course, CourseSummary, Phase, Lesson, Exercise, Progress, OnboardingQuestion, StudentRoadmapResult }
