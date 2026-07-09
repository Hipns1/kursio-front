import { useEffect, useRef } from 'react'

export type EscapeLayer = readonly [unknown, () => void]

export function useEscapeKey(layers: EscapeLayer[]): void {
  const layersRef = useRef(layers)
  layersRef.current = layers

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const open = layersRef.current.find(([isOpen]) => Boolean(isOpen))
      open?.[1]()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
