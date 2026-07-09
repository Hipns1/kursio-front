import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { type EscapeLayer, useEscapeKey } from '@/hooks/use-escape-key'

function pressEscape() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
}

function pressEnter() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
}

describe('useEscapeKey', () => {
  it('closes the only open layer', () => {
    const close = vi.fn()
    renderHook(() => useEscapeKey([[true, close]]))

    pressEscape()

    expect(close).toHaveBeenCalledTimes(1)
  })

  it('ignores keys other than Escape', () => {
    const close = vi.fn()
    renderHook(() => useEscapeKey([[true, close]]))

    pressEnter()

    expect(close).not.toHaveBeenCalled()
  })

  it('closes only the first open layer', () => {
    const inner = vi.fn()
    const outer = vi.fn()
    renderHook(() =>
      useEscapeKey([
        [true, inner],
        [true, outer]
      ])
    )

    pressEscape()

    expect(inner).toHaveBeenCalledTimes(1)
    expect(outer).not.toHaveBeenCalled()
  })

  it('skips closed layers to reach the first open one', () => {
    const closed = vi.fn()
    const open = vi.fn()
    renderHook(() =>
      useEscapeKey([
        [null, closed],
        [{ id: 3 }, open]
      ])
    )

    pressEscape()

    expect(closed).not.toHaveBeenCalled()
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('does nothing when every layer is closed', () => {
    const close = vi.fn()
    renderHook(() =>
      useEscapeKey([
        [false, close],
        [null, close],
        [undefined, close]
      ])
    )

    pressEscape()

    expect(close).not.toHaveBeenCalled()
  })

  it('uses the layers from the latest render', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = renderHook(({ layers }: { layers: EscapeLayer[] }) => useEscapeKey(layers), {
      initialProps: { layers: [[true, first]] as EscapeLayer[] }
    })

    rerender({
      layers: [
        [false, first],
        [true, second]
      ] as EscapeLayer[]
    })
    pressEscape()

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('removes its listener on unmount', () => {
    const close = vi.fn()
    const { unmount } = renderHook(() => useEscapeKey([[true, close]]))

    unmount()
    pressEscape()

    expect(close).not.toHaveBeenCalled()
  })
})
