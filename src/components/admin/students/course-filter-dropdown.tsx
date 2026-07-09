import { useState } from 'react'
import type { CourseSummary } from '@/services/backend'
import { CourseIcon } from '@/components/ui'

export function CourseFilterDropdown({
  courses,
  onChange,
  value
}: {
  courses: CourseSummary[]
  value: number | 'all'
  onChange: (v: number | 'all') => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = value === 'all' ? null : (courses.find((c) => c.id === value) ?? null)
  const filtered = courses.filter((c) => search.trim() === '' || c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className='relative max-w-[320px] flex-1'>
      <button
        type='button'
        onClick={() => {
          setOpen((o) => !o)
          setSearch('')
        }}
        className='flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs transition-all'
        style={{
          background: 'var(--bg-base)',
          border: selected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
          color: selected ? 'var(--text-1)' : 'var(--text-3)',
          outline: 'none'
        }}
      >
        {selected ? (
          <>
            <CourseIcon icon={selected.icon} size={14} className='shrink-0 rounded' />
            <span className='flex-1 truncate'>{selected.name}</span>
          </>
        ) : (
          <span className='flex-1'>🌐 Todos los cursos</span>
        )}
        <span className='text-fg-subtle'>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          className='absolute right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl'
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-panel)',
            top: '100%'
          }}
        >
          <div className='border-hairline flex items-center gap-2 border-b px-3 py-2'>
            <span className='text-fg-subtle text-xs'>🔍</span>
            <input
              autoFocus
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar...'
              className='text-fg flex-1 bg-transparent text-xs outline-none'
            />
            {search && (
              <button onClick={() => setSearch('')} className='text-fg-subtle text-xs'>
                ✕
              </button>
            )}
          </div>

          <div className='max-h-[240px] overflow-y-auto'>
            {search.trim() === '' && (
              <button
                type='button'
                onClick={() => {
                  onChange('all')
                  setOpen(false)
                }}
                className='flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-all hover:opacity-80'
                style={{
                  background: value === 'all' ? 'var(--primary-glow)' : 'transparent',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: value === 'all' ? 'var(--primary)' : 'var(--text-3)'
                }}
              >
                <span>🌐</span>
                <span>Todos los cursos</span>
                {value === 'all' && <span className='ml-auto'>✓</span>}
              </button>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                type='button'
                onClick={() => {
                  onChange(c.id)
                  setOpen(false)
                }}
                className='flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-all hover:opacity-80'
                style={{
                  background: value === c.id ? `${c.color}12` : 'transparent',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: value === c.id ? c.color : 'var(--text-1)'
                }}
              >
                <CourseIcon icon={c.icon} size={14} className='shrink-0 rounded' />
                <span className='flex-1 truncate'>{c.name}</span>
                {value === c.id && <span className='ml-auto'>✓</span>}
              </button>
            ))}
            {filtered.length === 0 && <p className='text-fg-subtle px-3 py-2 text-xs'>Sin resultados</p>}
          </div>
        </div>
      )}
    </div>
  )
}
