import type { StudentSummary } from '@/services/backend'

const HEADERS = [
  'ID',
  'Nombre',
  'Documento',
  'Llave',
  'Activo',
  'Cursos',
  'Ejercicios',
  'Score',
  'Último acceso',
  'Últ. lección'
]

function shortDate(iso: string | null | undefined) {
  return iso ? new Date(iso).toLocaleDateString('es-CO') : ''
}

export function buildStudentsCsv(students: StudentSummary[]): string {
  const rows = students.map((s) => [
    s.id,
    `"${s.name}"`,
    s.documentNumber,
    s.accessKey,
    s.isActive ? 'Sí' : 'No',
    `"${(s.allowedCourseIds ?? []).join(', ') || 'Todos'}"`,
    s.exercisesDone,
    s.averageScore !== null ? Math.round(s.averageScore) : '',
    shortDate(s.lastActivity),
    shortDate(s.lastLessonAt)
  ])

  return [HEADERS.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

export function downloadStudentsCsv(students: StudentSummary[]): void {
  const blob = new Blob([buildStudentsCsv(students)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aprendices-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
