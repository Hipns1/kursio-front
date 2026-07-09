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
  color: 'var(--text-1)'
}

const focused = {
  background: 'var(--bg-card)',
  border: '1px solid var(--primary)',
  boxShadow: '0 0 0 3px var(--primary-glow)',
  color: 'var(--text-1)'
}

export function DarkTextarea({ disabled, onChange, placeholder, rows = 4, value }: DarkTextareaProps) {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className='w-full resize-none rounded-xl px-4 py-3 font-mono text-sm transition-all focus:outline-none'
      style={isFocused && !disabled ? focused : { ...base, opacity: disabled ? 0.6 : 1 }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  )
}
