interface CodeBlockProps {
  code: string
  label?: string
}

export function CodeBlock({ code, label }: CodeBlockProps) {
  return (
    <div className="mb-4">
      {label && (
        <span className="text-xs font-mono mb-1 block uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
          {label}
        </span>
      )}
      <pre
        className="rounded-xl p-4 text-xs overflow-x-auto leading-relaxed font-mono whitespace-pre"
        style={{ background: '#0D1117', color: '#7EE787', border: '1px solid rgba(171,157,242,0.12)' }}
      >
        {code}
      </pre>
    </div>
  )
}
