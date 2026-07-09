type BtnColor = 'primary' | 'green' | 'red' | 'orange' | 'violet'

const gradients: Record<BtnColor, string> = {
  green: 'var(--grad-success)',
  orange: 'linear-gradient(135deg,#F97316,#EA580C)',
  primary: 'var(--grad)',
  red: 'linear-gradient(135deg,var(--danger),#DC2626)',
  violet: 'linear-gradient(135deg,#8B5CF6,#7C3AED)'
}

const glows: Record<BtnColor, string> = {
  green: 'var(--success-border)',
  orange: 'rgba(249,115,22,0.30)',
  primary: 'var(--primary-glow)',
  red: 'var(--danger-border)',
  violet: 'rgba(139,92,246,0.30)'
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
      className={`w-full rounded-xl py-3 text-sm font-bold text-white transition-all active:scale-[0.98] ${className}`}
      style={
        disabled
          ? {
              background: 'var(--tint-2)',
              color: 'var(--text-3)',
              cursor: 'not-allowed'
            }
          : {
              background: gradients[color],
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
