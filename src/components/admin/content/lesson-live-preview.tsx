import { LessonBlock } from '@/components/phase/lessons'
import type { EditableBlock } from './types'

export function LessonLivePreview({ blocks, title }: { title: string; blocks: EditableBlock[] }) {
  if (!title.trim() && blocks.length === 0) {
    return (
      <div className='space-y-2 py-8 text-center'>
        <p className='font-serif text-3xl font-normal'>✏️</p>
        <p className='text-fg-subtle text-xs font-semibold'>Empezá a editar para ver la vista previa</p>
      </div>
    )
  }
  return (
    <div>
      {title.trim() && <h2 className='text-fg mb-4 text-base leading-snug font-semibold'>{title}</h2>}
      {blocks.length === 0 ? (
        <p className='text-fg-subtle text-xs'>Agregá bloques de contenido desde la izquierda.</p>
      ) : (
        blocks.map((block, i) => <LessonBlock key={i} block={block as any} />)
      )}
    </div>
  )
}
