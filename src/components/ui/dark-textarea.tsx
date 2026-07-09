import { useState } from 'react'

interface DarkTextareaProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
}

const base = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-1)',
}

const focused = {
  background: 'var(--bg-card)',
  border: '1px solid var(--primary)',
  boxShadow: '0 0 0 3px var(--primary-glow)',
  color: 'var(--text-1)',
}

export function DarkTextarea({ value, onChange, placeholder, disabled, rows = 4 }: DarkTextareaProps) {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none font-mono transition-all resize-none"
      style={isFocused && !disabled ? focused : { ...base, opacity: disabled ? 0.6 : 1 }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  )
}
