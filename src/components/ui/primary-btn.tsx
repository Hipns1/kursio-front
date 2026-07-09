type BtnColor = 'primary' | 'green' | 'red' | 'orange' | 'violet'

const fills: Record<BtnColor, string> = {
  green: 'var(--success)',
  orange: 'var(--warning)',
  primary: 'var(--grad)',
  red: 'var(--danger)',
  violet: 'var(--accent)'
}

const glows: Record<BtnColor, string> = {
  green: 'var(--success-border)',
  orange: 'var(--warning-border)',
  primary: 'var(--primary-glow)',
  red: 'var(--danger-border)',
  violet: 'var(--accent-glow)'
}

interface PrimaryBtnProps {
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  color?: BtnColor
  className?: string
}

export function PrimaryBtn({ children, className = '', color = 'primary', disabled, onClick }: PrimaryBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-on-primary w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98] ${className}`}
      style={
        disabled
          ? {
              background: 'var(--tint-2)',
              color: 'var(--text-3)',
              cursor: 'not-allowed'
            }
          : {
              background: fills[color],
              boxShadow: `0 4px 16px ${glows[color]}`
            }
      }
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.opacity = '0.88'
          e.currentTarget.style.boxShadow = `0 6px 24px ${glows[color]}`
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.boxShadow = `0 4px 16px ${glows[color]}`
        }
      }}
    >
      {children}
    </button>
  )
}
