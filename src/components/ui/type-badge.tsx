import type { ExerciseType } from '@/types/learning'

const TYPE_META: Record<ExerciseType, { label: string; bg: string; color: string; border: string }> = {
  'multiple-choice': {
    label: 'Selección múltiple',
    bg: 'rgba(171,157,242,0.12)',
    color: '#A5B4FC',
    border: '1px solid rgba(171,157,242,0.25)',
  },
  'find-bug': {
    label: 'Encuentra el bug',
    bg: 'rgba(255,97,136,0.10)',
    color: '#ffb3c6',
    border: '1px solid rgba(255,97,136,0.25)',
  },
  'know-output': {
    label: '¿Cuál es la salida?',
    bg: 'rgba(168,85,247,0.10)',
    color: '#D8B4FE',
    border: '1px solid rgba(168,85,247,0.25)',
  },
  'improve-code': {
    label: 'Mejorá el código',
    bg: 'rgba(249,115,22,0.10)',
    color: '#FED7AA',
    border: '1px solid rgba(249,115,22,0.25)',
  },
  'complete-code': {
    label: 'Completá el código',
    bg: 'rgba(169,220,118,0.10)',
    color: '#6EE7B7',
    border: '1px solid rgba(169,220,118,0.25)',
  },
  'code-along': {
    label: 'Code-Along',
    bg: 'rgba(139,92,246,0.10)',
    color: '#C4B5FD',
    border: '1px solid rgba(139,92,246,0.25)',
  },
}

interface TypeBadgeProps {
  type: ExerciseType
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const meta = TYPE_META[type]
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: meta.bg, color: meta.color, border: meta.border }}
    >
      {meta.label}
    </span>
  )
}
