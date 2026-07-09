import { useState } from 'react'

type Theme = 'dark' | 'light'

function current(): Theme {
  return (document.documentElement.getAttribute('data-theme') as Theme) ?? 'dark'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(current)

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('bkl_theme', next)
    setTheme(next)
  }

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      className="text-sm px-2.5 py-1.5 rounded-lg transition-all"
      style={{
        background: 'rgba(171,157,242,0.10)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-2)',
        lineHeight: 1,
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
