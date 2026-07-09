import type { LessonBlock as LessonBlockType } from '@/types/learning'

interface LessonBlockProps {
  block: LessonBlockType
}

export function LessonBlock({ block }: LessonBlockProps) {
  if (block.t === 'p') return <p className='text-fg-muted mb-3 text-sm leading-relaxed'>{block.v}</p>

  if (block.t === 'code')
    return (
      <div className='mb-3'>
        {block.lang && block.lang !== 'csharp' && block.lang !== 'bash' && (
          <span className='text-fg-subtle mb-1 block font-mono text-xs tracking-widest uppercase'>{block.lang}</span>
        )}
        <pre className='border-hairline overflow-x-auto rounded-xl border bg-[#0D1117] p-3 font-mono text-xs leading-relaxed whitespace-pre text-[#7EE787]'>
          {block.v}
        </pre>
      </div>
    )

  if (block.t === 'cmp')
    return (
      <div className='mb-3 space-y-2'>
        <div>
          <div className='text-accent mb-1.5 text-xs font-semibold'>📘 TypeScript</div>
          <pre className='overflow-x-auto rounded-xl border border-[rgba(14,165,233,0.15)] bg-[rgba(14,165,233,0.06)] p-3 font-mono text-xs leading-relaxed whitespace-pre text-[#93C5FD]'>
            {block.ts}
          </pre>
        </div>
        <div>
          <div className='text-primary mb-1.5 text-xs font-semibold'>🟣 C#</div>
          <pre className='border-hairline overflow-x-auto rounded-xl border bg-[#0D1117] p-3 font-mono text-xs leading-relaxed whitespace-pre text-[#7EE787]'>
            {block.cs}
          </pre>
        </div>
      </div>
    )

  if (block.t === 'tip')
    return (
      <div className='bg-warning-bg mb-3 rounded-r-xl border-l-2 border-[var(--warning)] px-4 py-3'>
        <p className='text-warning text-sm'>
          <span className='font-bold'>💡 </span>
          {block.v}
        </p>
      </div>
    )

  if (block.t === 'list')
    return (
      <ul className='mb-3 space-y-1.5 pl-1'>
        {block.items!.map((item, i) => (
          <li key={i} className='text-fg-muted flex items-start gap-2 text-sm'>
            <span className='text-primary mt-0.5 shrink-0'>▸</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )

  return null
}
