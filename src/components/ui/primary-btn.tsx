type BtnColor = 'primary' | 'green' | 'red' | 'orange' | 'violet'

const gradients: Record<BtnColor, string> = {
  primary: 'linear-gradient(135deg,#ab9df2,#78dce8)',
  green: 'linear-gradient(135deg,#a9dc76,#75a73e)',
  red: 'linear-gradient(135deg,#ff6188,#DC2626)',
  orange: 'linear-gradient(135deg,#F97316,#EA580C)',
  violet: 'linear-gradient(135deg,#8B5CF6,#7C3AED)',
}

const glows: Record<BtnColor, string> = {
  primary: 'rgba(171,157,242,0.35)',
  green: 'rgba(169,220,118,0.30)',
  red: 'rgba(255,97,136,0.30)',
  orange: 'rgba(249,115,22,0.30)',
  violet: 'rgba(139,92,246,0.30)',
}

interface PrimaryBtnProps {
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  color?: BtnColor
  className?: string
}

export function PrimaryBtn({ onClick, disabled, children, color = 'primary', className = '' }: PrimaryBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-[0.98] ${className}`}
      style={
        disabled
          ? {
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text-3)',
              cursor: 'not-allowed',
            }
          : {
              background: gradients[color],
              boxShadow: `0 4px 16px ${glows[color]}`,
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
