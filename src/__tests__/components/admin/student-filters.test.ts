import { describe, expect, it } from 'vitest'
import type { StudentSummary } from '@/services/backend'
import { filterAndSortStudents } from '@/components/admin/students/use-student-filters'
import { buildStudentsCsv } from '@/utils/helpers/students-csv'

function student(overrides: Partial<StudentSummary> = {}): StudentSummary {
  return {
    accessKey: 'NET-AAA11111',
    averageScore: 50,
    createdAt: '2026-01-01T00:00:00Z',
    documentNumber: '1000',
    exercisesDone: 1,
    id: 1,
    isActive: true,
    lastActivity: null,
    lessonsRead: 0,
    name: 'Ana',
    ...overrides
  }
}

const defaults = {
  filterCourseId: 'all' as const,
  filterStatus: 'all' as const,
  search: '',
  sortDir: 'asc' as const,
  sortKey: 'name' as const
}

describe('filterAndSortStudents', () => {
  const ana = student({ averageScore: 90, documentNumber: '1001', exercisesDone: 5, id: 1, name: 'Ana' })
  const beto = student({ averageScore: null, documentNumber: '1002', exercisesDone: 9, id: 2, name: 'beto' })
  const caro = student({
    averageScore: 70,
    documentNumber: '2003',
    exercisesDone: 1,
    id: 3,
    isActive: false,
    name: 'Caro'
  })
  const all = [ana, beto, caro]

  it('sorts by name case-insensitively', () => {
    expect(filterAndSortStudents(all, defaults).map((s) => s.name)).toEqual(['Ana', 'beto', 'Caro'])
  })

  it('reverses the order when the direction is desc', () => {
    const result = filterAndSortStudents(all, { ...defaults, sortDir: 'desc' })
    expect(result.map((s) => s.name)).toEqual(['Caro', 'beto', 'Ana'])
  })

  it('treats a missing average score as -1 when sorting', () => {
    const result = filterAndSortStudents(all, { ...defaults, sortKey: 'averageScore' })
    expect(result.map((s) => s.name)).toEqual(['beto', 'Caro', 'Ana'])
  })

  it('sorts numerically by exercises done', () => {
    const result = filterAndSortStudents(all, { ...defaults, sortKey: 'exercisesDone' })
    expect(result.map((s) => s.name)).toEqual(['Caro', 'Ana', 'beto'])
  })

  it('searches by name, case-insensitively', () => {
    expect(filterAndSortStudents(all, { ...defaults, search: 'BET' }).map((s) => s.name)).toEqual(['beto'])
  })

  it('searches by document number', () => {
    expect(filterAndSortStudents(all, { ...defaults, search: '2003' }).map((s) => s.name)).toEqual(['Caro'])
  })

  it('filters by active status', () => {
    expect(filterAndSortStudents(all, { ...defaults, filterStatus: 'active' }).map((s) => s.name)).toEqual([
      'Ana',
      'beto'
    ])
    expect(filterAndSortStudents(all, { ...defaults, filterStatus: 'inactive' }).map((s) => s.name)).toEqual(['Caro'])
  })

  it('keeps a student with no explicit course list under any course filter', () => {
    const enrolled = student({ allowedCourseIds: [7], id: 1, name: 'Ana' })
    const everyCourse = student({ allowedCourseIds: [], id: 2, name: 'Beto' })
    const other = student({ allowedCourseIds: [9], id: 3, name: 'Caro' })

    const result = filterAndSortStudents([enrolled, everyCourse, other], { ...defaults, filterCourseId: 7 })

    expect(result.map((s) => s.name)).toEqual(['Ana', 'Beto'])
  })

  it('does not mutate the array it was given', () => {
    const input = [caro, ana]
    filterAndSortStudents(input, defaults)
    expect(input.map((s) => s.name)).toEqual(['Caro', 'Ana'])
  })
})

describe('buildStudentsCsv', () => {
  it('emits a header row followed by one row per student', () => {
    const csv = buildStudentsCsv([student({ allowedCourseIds: [1, 2] })])
    const [header, row] = csv.split('\n')

    expect(header.startsWith('ID,Nombre,Documento,Llave,Activo')).toBe(true)
    expect(row).toContain('"Ana"')
    expect(row).toContain('NET-AAA11111')
  })

  it('quotes the course list and labels an empty one as Todos', () => {
    expect(buildStudentsCsv([student({ allowedCourseIds: [] })])).toContain('"Todos"')
    expect(buildStudentsCsv([student({ allowedCourseIds: [1, 2] })])).toContain('"1, 2"')
  })

  it('renders an active flag in Spanish', () => {
    expect(buildStudentsCsv([student({ isActive: true })])).toContain('Sí')
    expect(buildStudentsCsv([student({ isActive: false })])).toContain('No')
  })

  it('rounds the score and leaves it blank when there is none', () => {
    expect(buildStudentsCsv([student({ averageScore: 82.6 })])).toContain('83')
    const noScore = buildStudentsCsv([student({ averageScore: null })]).split('\n')[1]
    expect(noScore.split(',')).toContain('')
  })
})
