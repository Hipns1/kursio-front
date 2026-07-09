import { DarkInput, DarkTextarea } from '@/components/ui'
import type { EditableBlock } from './types'

const BLOCK_LABELS: Record<string, string> = {
  cmp: '⚖️ Comparación C# / TypeScript',
  code: '💻 Bloque de código',
  list: '📋 Lista de puntos',
  p: '📝 Párrafo',
  tip: '💡 Consejo'
}

export function LessonBlockEditor({
  blocks,
  onChange
}: {
  blocks: EditableBlock[]
  onChange: (b: EditableBlock[]) => void
}) {
  const update = (i: number, block: EditableBlock) => {
    const next = [...blocks]
    next[i] = block
    onChange(next)
  }
  const remove = (i: number) => onChange(blocks.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const next = [...blocks]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const addBlock = (t: string) => {
    const newBlock: EditableBlock =
      t === 'p'
        ? { t: 'p', v: '' }
        : t === 'code'
          ? { lang: 'csharp', t: 'code', v: '' }
          : t === 'cmp'
            ? { cs: '', t: 'cmp', ts: '' }
            : t === 'tip'
              ? { t: 'tip', v: '' }
              : { items: [''], t: 'list' }
    onChange([...blocks, newBlock])
  }

  return (
    <div className='space-y-2'>
      {blocks.length === 0 && (
        <div
          className='rounded-xl py-5 text-center text-xs'
          style={{
            background: 'var(--tint-1)',
            border: '1px dashed var(--border-default)',
            color: 'var(--text-3)'
          }}
        >
          No hay bloques. Agregá uno abajo.
        </div>
      )}

      {blocks.map((block, i) => (
        <div key={i} className='bg-elevated border-hairline space-y-2 rounded-xl border p-3'>
          <div className='flex items-center gap-1.5'>
            <span className='text-fg-muted flex-1 text-xs font-semibold'>{BLOCK_LABELS[block.t]}</span>
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className='text-fg-subtle border-hairline bg-tint rounded border px-1.5 py-0.5 text-xs transition-all disabled:opacity-25'
            >
              ↑
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === blocks.length - 1}
              className='text-fg-subtle border-hairline bg-tint rounded border px-1.5 py-0.5 text-xs transition-all disabled:opacity-25'
            >
              ↓
            </button>
            <button
              onClick={() => remove(i)}
              className='border-danger-border bg-danger-bg text-danger rounded border px-2 py-0.5 text-xs transition-all'
            >
              ✕
            </button>
          </div>

          {block.t === 'p' && (
            <DarkTextarea
              value={block.v}
              onChange={(e) => update(i, { ...block, v: e.target.value })}
              placeholder='Escribí el texto del párrafo...'
              rows={3}
            />
          )}
          {block.t === 'code' && (
            <>
              <div className='flex items-center gap-2'>
                <label className='text-fg-subtle shrink-0 text-xs'>Lenguaje:</label>
                <select
                  value={block.lang ?? 'csharp'}
                  onChange={(e) => update(i, { ...block, lang: e.target.value })}
                  className='bg-surface text-fg border-line rounded-lg border px-2 py-1 text-xs'
                >
                  <option value='csharp'>C#</option>
                  <option value='typescript'>TypeScript</option>
                  <option value='bash'>Bash / Terminal</option>
                  <option value='json'>JSON</option>
                </select>
              </div>
              <DarkTextarea
                value={block.v}
                onChange={(e) => update(i, { ...block, v: e.target.value })}
                placeholder='Pegá o escribí el código...'
                rows={6}
              />
            </>
          )}
          {block.t === 'cmp' && (
            <div className='space-y-2'>
              <div>
                <label className='mb-1 block text-xs font-semibold text-[#93C5FD]'>📘 TypeScript</label>
                <DarkTextarea
                  value={block.ts}
                  onChange={(e) => update(i, { ...block, ts: e.target.value })}
                  placeholder='Código TypeScript...'
                  rows={4}
                />
              </div>
              <div>
                <label className='text-primary mb-1 block text-xs font-semibold'>🟣 C#</label>
                <DarkTextarea
                  value={block.cs}
                  onChange={(e) => update(i, { ...block, cs: e.target.value })}
                  placeholder='Código C#...'
                  rows={4}
                />
              </div>
            </div>
          )}
          {block.t === 'tip' && (
            <DarkTextarea
              value={block.v}
              onChange={(e) => update(i, { ...block, v: e.target.value })}
              placeholder='Escribí el consejo o nota importante...'
              rows={2}
            />
          )}
          {block.t === 'list' && (
            <div className='space-y-1.5'>
              {block.items.map((item, j) => (
                <div key={j} className='flex gap-2'>
                  <DarkInput
                    value={item}
                    onChange={(e) => {
                      const items = [...block.items]
                      items[j] = e.target.value
                      update(i, { ...block, items })
                    }}
                    placeholder={`Punto ${j + 1}...`}
                  />
                  <button
                    onClick={() => {
                      const items = block.items.filter((_, idx) => idx !== j)
                      update(i, { ...block, items })
                    }}
                    className='border-danger-border bg-danger-bg text-danger shrink-0 rounded border px-2 text-xs'
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => update(i, { ...block, items: [...block.items, ''] })}
                className='text-primary border-line bg-primary-glow rounded-lg border px-3 py-1.5 text-xs font-medium'
              >
                + Agregar punto
              </button>
            </div>
          )}
        </div>
      ))}

      <div className='pt-1'>
        <p className='text-fg-subtle mb-2 text-xs font-semibold'>Agregar bloque:</p>
        <div className='flex flex-wrap gap-2'>
          {Object.entries(BLOCK_LABELS).map(([t, label]) => (
            <button
              key={t}
              onClick={() => addBlock(t)}
              className='text-primary border-line bg-primary-glow rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80'
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
