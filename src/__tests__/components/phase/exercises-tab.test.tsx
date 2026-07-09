import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Exercise, Phase } from '@/types/learning'
import { setContentArrays } from '@/utils/consts/learning-data'
import { ExercisesTab } from '@/components/phase/exercises'

const phase: Phase = { icon: '🔤', id: 0, name: 'Fase vacía' }

const exercise: Exercise = {
  explanation: 'e',
  id: 'E0-1',
  phase: 0,
  question: '¿Qué es Task<T>?',
  type: 'find-bug'
}

function renderTab(progress = {}) {
  return render(
    <ExercisesTab
      phaseId={0}
      phase={phase}
      progress={progress}
      onAnswer={vi.fn()}
      studentToken='t'
      onGrade={vi.fn()}
      onNextPhase={vi.fn()}
      onBack={vi.fn()}
      onGoToLastLesson={vi.fn()}
    />
  )
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('ExercisesTab', () => {
  it('renders the current exercise of a phase that has them', () => {
    setContentArrays([phase], [], [exercise])

    renderTab()

    expect(screen.getByText('¿Qué es Task<T>?')).toBeTruthy()
  })

  it('survives a phase that has no exercises at all', () => {
    setContentArrays([phase], [], [])

    expect(() => renderTab()).not.toThrow()
  })

  it('offers a way out of a phase with no exercises', () => {
    setContentArrays([phase], [], [])

    renderTab()

    expect(screen.getByText('Esta fase todavía no tiene ejercicios')).toBeTruthy()
    expect(screen.getByText('← Volver')).toBeTruthy()
    expect(screen.getByText('Continuar')).toBeTruthy()
  })
})
