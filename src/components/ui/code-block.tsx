interface CodeBlockProps {
  code: string
  label?: string
}

export function CodeBlock({ code, label }: CodeBlockProps) {
  return (
    <div className='mb-4'>
      {label && <span className='text-fg-subtle mb-1 block font-mono text-xs tracking-widest uppercase'>{label}</span>}
      <pre className='border-line overflow-x-auto rounded-xl border bg-[#0D1117] p-4 font-mono text-xs leading-relaxed whitespace-pre text-[#7EE787]'>
        {code}
      </pre>
    </div>
  )
}
