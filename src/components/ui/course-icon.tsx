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

export function CourseIcon({ className = '', icon, size, style }: CourseIconProps) {
  if (icon && isImageSrc(icon)) {
    const imgStyle = size ? { height: size, width: size, ...style } : style
    return <img src={icon} alt='' className={`rounded-lg object-cover ${className}`} style={imgStyle} />
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
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('load failed'))
    }
    img.src = url
  })
}

interface IconPickerProps {
  value: string
  onChange: (v: string) => void
}

export function IconPicker({ onChange, value }: IconPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const isImg = !!(value && isImageSrc(value))

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const b64 = await resizeToBase64(file, 128)
      onChange(b64)
    } catch {
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className='flex flex-col items-center gap-3'>
      <button
        type='button'
        onClick={() => fileRef.current?.click()}
        className='group border-line bg-tint relative h-24 w-24 overflow-hidden rounded-2xl border transition-all hover:opacity-80'
        title={isImg ? 'Cambiar imagen' : 'Subir imagen'}
      >
        {isImg ? (
          <img src={value} alt='' className='h-full w-full object-cover' />
        ) : (
          <div className='flex h-full w-full flex-col items-center justify-center gap-1'>
            <span className='font-serif text-4xl font-normal'>📚</span>
            <span className='text-fg-subtle text-xs'>Subir imagen</span>
          </div>
        )}
        <div className='absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.45)] opacity-0 transition-opacity group-hover:opacity-100'>
          <span className='font-serif text-2xl font-normal'>🖼</span>
        </div>
      </button>

      {isImg && (
        <button
          type='button'
          onClick={() => onChange('')}
          className='border-danger-border bg-danger-bg text-danger rounded-lg border px-3 py-1 text-xs transition-all hover:opacity-80'
        >
          ✕ Quitar imagen
        </button>
      )}

      <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={handleFile} />
    </div>
  )
}
