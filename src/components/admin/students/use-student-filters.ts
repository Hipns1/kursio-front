import { useMemo, useState } from 'react'
import type { StudentSummary } from '@/services/backend'

export type SortKey = 'name' | 'exercisesDone' | 'averageScore' | 'lastActivity'
export type SortDir = 'asc' | 'desc'
export type StatusFilter = 'all' | 'active' | 'inactive'

function sortValue(student: StudentSummary, key: SortKey): number | string {
  if (key === 'name') return student.name.toLowerCase()
  if (key === 'exercisesDone') return student.exercisesDone
  if (key === 'averageScore') return student.averageScore ?? -1
  return student.lastActivity ?? ''
}

function matchesCourse(student: StudentSummary, courseId: number) {
  const ids = student.allowedCourseIds
  return !ids || ids.length === 0 || ids.includes(courseId)
}

export function filterAndSortStudents(
  students: StudentSummary[],
  {
    filterCourseId,
    filterStatus,
    search,
    sortDir,
    sortKey
  }: {
    search: string
    filterStatus: StatusFilter
    filterCourseId: number | 'all'
    sortKey: SortKey
    sortDir: SortDir
  }
): StudentSummary[] {
  let list = students

  if (search.trim()) {
    const q = search.toLowerCase()
    list = list.filter((s) => s.name.toLowerCase().includes(q) || s.documentNumber.includes(q))
  }

  if (filterStatus !== 'all') {
    list = list.filter((s) => (filterStatus === 'active' ? s.isActive : !s.isActive))
  }

  if (filterCourseId !== 'all') {
    list = list.filter((s) => matchesCourse(s, filterCourseId))
  }

  return [...list].sort((a, b) => {
    const va = sortValue(a, sortKey)
    const vb = sortValue(b, sortKey)
    if (va < vb) return sortDir === 'asc' ? -1 : 1
    if (va > vb) return sortDir === 'asc' ? 1 : -1
    return 0
  })
}

export function useStudentFilters(students: StudentSummary[]) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all')
  const [filterCourseId, setFilterCourseId] = useState<number | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const filteredStudents = useMemo(
    () => filterAndSortStudents(students, { filterCourseId, filterStatus, search, sortDir, sortKey }),
    [students, search, filterStatus, filterCourseId, sortKey, sortDir]
  )

  const toggleSort = (col: SortKey) => {
    if (sortKey === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(col)
    setSortDir('asc')
  }

  const clearFilters = () => {
    setSearch('')
    setFilterStatus('all')
    setFilterCourseId('all')
  }

  return {
    clearFilters,
    filterCourseId,
    filteredStudents,
    filterStatus,
    search,
    setFilterCourseId,
    setFilterStatus,
    setSearch,
    sortDir,
    sortKey,
    toggleSort
  }
}
