import { useRef } from 'react'

function isImageSrc(icon: string) {
  return icon.startsWith('data:') || icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/')
}

interface CourseIconProps {
  icon: string
  className?: string
  style?: React.CSSProperties
  size?: number
}

export function CourseIcon({ icon, className = '', style, size }: CourseIconProps) {
  if (icon && isImageSrc(icon)) {
    const imgStyle = size ? { width: size, height: size, ...style } : style
    return (
      <img
        src={icon}
        alt=""
        className={`object-cover rounded-lg ${className}`}
        style={imgStyle}
      />
    )
  }
  return (
    <span
      className={`inline-flex items-center justify-center leading-none ${className}`}
      style={{ fontSize: size ? size : undefined, lineHeight: 1, ...style }}
    >
      {icon || '📚'}
    </span>
  )
}

async function resizeToBase64(file: File, px = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = px
      canvas.height = px
      const ctx = canvas.getContext('2d')!
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, px, px)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.80))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')) }
    img.src = url
  })
}

interface IconPickerProps {
  value: string
  onChange: (v: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const isImg = !!(value && isImageSrc(value))

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const b64 = await resizeToBase64(file, 128)
      onChange(b64)
    } catch {
      /* ignore */
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Preview — clicking uploads */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative w-24 h-24 rounded-2xl overflow-hidden transition-all hover:opacity-80 group"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-default)' }}
        title={isImg ? 'Cambiar imagen' : 'Subir imagen'}
      >
        {isImg
          ? <img src={value} alt="" className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <span className="text-4xl">📚</span>
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>Subir imagen</span>
            </div>
          )
        }
        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <span className="text-2xl">🖼</span>
        </div>
      </button>

      {isImg && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs px-3 py-1 rounded-lg transition-all hover:opacity-80"
          style={{ background: 'rgba(255,97,136,0.10)', color: '#ffb3c6', border: '1px solid rgba(255,97,136,0.25)' }}
        >
          ✕ Quitar imagen
        </button>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
