import type { ExerciseType } from '@/types/learning'

const TYPE_META: Record<ExerciseType, { label: string; bg: string; color: string; border: string }> = {
  'code-along': {
    bg: 'rgba(139,92,246,0.10)',
    border: '1px solid rgba(139,92,246,0.25)',
    color: '#C4B5FD',
    label: 'Code-Along'
  },
  'complete-code': {
    bg: 'var(--success-bg)',
    border: '1px solid var(--success-border)',
    color: 'var(--success)',
    label: 'Completá el código'
  },
  'find-bug': {
    bg: 'var(--danger-bg)',
    border: '1px solid var(--danger-border)',
    color: 'var(--danger)',
    label: 'Encuentra el bug'
  },
  'improve-code': {
    bg: 'rgba(249,115,22,0.10)',
    border: '1px solid rgba(249,115,22,0.25)',
    color: '#FED7AA',
    label: 'Mejorá el código'
  },
  'know-output': {
    bg: 'rgba(168,85,247,0.10)',
    border: '1px solid rgba(168,85,247,0.25)',
    color: '#D8B4FE',
    label: '¿Cuál es la salida?'
  },
  'multiple-choice': {
    bg: 'var(--primary-glow)',
    border: '1px solid var(--primary-glow)',
    color: '#A5B4FC',
    label: 'Selección múltiple'
  }
}

interface TypeBadgeProps {
  type: ExerciseType
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const meta = TYPE_META[type]
  return (
    <span
      className='rounded-full px-2.5 py-1 text-xs font-semibold'
      style={{ background: meta.bg, border: meta.border, color: meta.color }}
    >
      {meta.label}
    </span>
  )
}
