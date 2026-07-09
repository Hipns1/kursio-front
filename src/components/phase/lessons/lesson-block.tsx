import type { LessonBlock as LessonBlockType } from '@/types/learning'

interface LessonBlockProps {
  block: LessonBlockType
}

export function LessonBlock({ block }: LessonBlockProps) {
  if (block.t === 'p')
    return (
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-2)' }}>
        {block.v}
      </p>
    )

  if (block.t === 'code')
    return (
      <div className="mb-3">
        {block.lang && block.lang !== 'csharp' && block.lang !== 'bash' && (
          <span className="text-xs font-mono mb-1 block uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
            {block.lang}
          </span>
        )}
        <pre
          className="rounded-xl p-3 text-xs overflow-x-auto leading-relaxed font-mono whitespace-pre"
          style={{ background: '#0D1117', color: '#7EE787', border: '1px solid var(--border-subtle)' }}
        >
          {block.v}
        </pre>
      </div>
    )

  if (block.t === 'cmp')
    return (
      <div className="mb-3 space-y-2">
        <div>
          <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--accent)' }}>
            📘 TypeScript
          </div>
          <pre
            className="rounded-xl p-3 text-xs overflow-x-auto leading-relaxed font-mono whitespace-pre"
            style={{ background: 'rgba(14,165,233,0.06)', color: '#93C5FD', border: '1px solid rgba(14,165,233,0.15)' }}
          >
            {block.ts}
          </pre>
        </div>
        <div>
          <div className="text-xs font-semibold mb-1.5" style={{ color: '#A78BFA' }}>
            🟣 C#
          </div>
          <pre
            className="rounded-xl p-3 text-xs overflow-x-auto leading-relaxed font-mono whitespace-pre"
            style={{ background: '#0D1117', color: '#7EE787', border: '1px solid var(--border-subtle)' }}
          >
            {block.cs}
          </pre>
        </div>
      </div>
    )

  if (block.t === 'tip')
    return (
      <div className="rounded-r-xl px-4 py-3 mb-3 border-l-2" style={{ background: 'rgba(255,216,102,0.07)', borderColor: '#ffd866' }}>
        <p className="text-sm" style={{ color: '#ffd866' }}>
          <span className="font-bold">💡 </span>
          {block.v}
        </p>
      </div>
    )

  if (block.t === 'list')
    return (
      <ul className="space-y-1.5 mb-3 pl-1">
        {block.items!.map((item, i) => (
          <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-2)' }}>
            <span className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }}>
              ▸
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )

  return null
}
