import { useState } from 'react'

interface DarkInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  type?: string
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

export function DarkInput({ value, onChange, onKeyDown, placeholder, disabled, type = 'text' }: DarkInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none font-mono transition-all"
      style={isFocused && !disabled ? focused : { ...base, opacity: disabled ? 0.6 : 1 }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  )
}
