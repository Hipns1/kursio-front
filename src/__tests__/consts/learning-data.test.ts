import { beforeEach, describe, expect, it } from 'vitest'
import type { Course } from '@/types/learning'
import {
  ALL_COURSES,
  COURSES,
  EXERCISES,
  LESSONS,
  PHASES,
  activateCourse,
  setCoursesData
} from '@/utils/consts/learning-data'
import { getPhaseExercises } from '@/utils/helpers/learning'

function course(slug: string, phaseId: number): Course {
  return {
    color: '#abc',
    description: 'desc',
    icon: '🏗️',
    id: phaseId + 1,
    name: `Curso ${slug}`,
    order: phaseId,
    phases: [
      {
        dbId: 100 + phaseId,
        exercises: [
          { explanation: 'e', id: `E${slug}-1`, phase: phaseId, question: 'q', type: 'find-bug' },
          { explanation: 'e', id: `E${slug}-2`, phase: phaseId, question: 'q', type: 'find-bug' }
        ],
        icon: 'x',
        id: phaseId,
        lessons: [{ blocks: [], id: `L${slug}-1`, phase: phaseId, title: 't' }],
        name: `Fase ${phaseId}`
      }
    ],
    prerequisites: [],
    slug
  }
}

const netBackend = course('net-backend', 0)
const react = course('react', 1)

beforeEach(() => {
  setCoursesData([netBackend, react])
  activateCourse('net-backend')
})

describe('setCoursesData', () => {
  it('keeps the full course tree in ALL_COURSES', () => {
    expect(ALL_COURSES).toHaveLength(2)
    expect(ALL_COURSES[0].phases[0].exercises).toHaveLength(2)
  })

  it('projects COURSES down to the summary fields, dropping the phase tree', () => {
    expect(COURSES).toHaveLength(2)
    expect(COURSES[0]).toEqual({
      color: '#abc',
      description: 'desc',
      icon: '🏗️',
      id: 1,
      name: 'Curso net-backend',
      order: 0,
      prerequisites: [],
      slug: 'net-backend'
    })
    expect(COURSES[0]).not.toHaveProperty('phases')
  })

  it('replaces the previous course list rather than appending to it', () => {
    setCoursesData([react])

    expect(COURSES.map((c) => c.slug)).toEqual(['react'])
  })
})

describe('activateCourse', () => {
  it('flattens the phases of the active course into PHASES, LESSONS and EXERCISES', () => {
    expect(PHASES).toEqual([{ dbId: 100, icon: 'x', id: 0, name: 'Fase 0' }])
    expect(LESSONS.map((l) => l.id)).toEqual(['Lnet-backend-1'])
    expect(EXERCISES.map((e) => e.id)).toEqual(['Enet-backend-1', 'Enet-backend-2'])
  })

  it('swaps the content arrays when a different course is activated', () => {
    activateCourse('react')

    expect(PHASES.map((p) => p.id)).toEqual([1])
    expect(EXERCISES.map((e) => e.id)).toEqual(['Ereact-1', 'Ereact-2'])
  })

  it('leaves the active content untouched for an unknown slug', () => {
    activateCourse('no-existe')

    expect(EXERCISES.map((e) => e.id)).toEqual(['Enet-backend-1', 'Enet-backend-2'])
  })

  it('does nothing before setCoursesData has populated ALL_COURSES', () => {
    setCoursesData([])
    const before = EXERCISES.map((e) => e.id)

    activateCourse('net-backend')

    expect(EXERCISES.map((e) => e.id)).toEqual(before)
  })
})

describe('live bindings', () => {
  it('propagates a course switch to consumers that imported the arrays directly', () => {
    expect(getPhaseExercises(0).map((e) => e.id)).toEqual(['Enet-backend-1', 'Enet-backend-2'])

    activateCourse('react')

    expect(getPhaseExercises(0)).toEqual([])
    expect(getPhaseExercises(1).map((e) => e.id)).toEqual(['Ereact-1', 'Ereact-2'])
  })
})
