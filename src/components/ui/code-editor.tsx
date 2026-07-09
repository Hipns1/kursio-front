interface CodeEditorProps {
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
  minHeight?: number
}

export function CodeEditor({ minHeight = 220, onChange, readOnly = false, value }: CodeEditorProps) {
  return (
    <div className='border-line overflow-hidden rounded-xl border'>
      <textarea
        value={value}
        onChange={(e) => !readOnly && onChange?.(e.target.value)}
        readOnly={readOnly}
        rows={Math.max(8, Math.ceil(minHeight / 18))}
        className='w-full resize-none p-4 font-mono text-xs leading-relaxed focus:outline-none'
        style={{
          background: '#0D1117',
          color: '#7EE787',
          minHeight,
          opacity: readOnly ? 0.75 : 1
        }}
        placeholder={readOnly ? '' : 'Pegá o escribí tu código aquí...'}
        spellCheck={false}
      />
    </div>
  )
}
