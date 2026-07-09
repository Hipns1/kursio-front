interface CodeEditorProps {
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
  minHeight?: number
}

export function CodeEditor({ value, onChange, readOnly = false, minHeight = 220 }: CodeEditorProps) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
      <textarea
        value={value}
        onChange={(e) => !readOnly && onChange?.(e.target.value)}
        readOnly={readOnly}
        rows={Math.max(8, Math.ceil(minHeight / 18))}
        className="w-full resize-none text-xs leading-relaxed p-4 focus:outline-none font-mono"
        style={{
          background: '#0D1117',
          color: '#7EE787',
          minHeight,
          opacity: readOnly ? 0.75 : 1,
        }}
        placeholder={readOnly ? '' : 'Pegá o escribí tu código aquí...'}
        spellCheck={false}
      />
    </div>
  )
}
