import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, ScoreChip } from '@/components/ui'
import { formatDate } from '@/utils/helpers/format'
import { is401 } from '@/utils/helpers/http'

describe('Badge', () => {
  it('reads Activo when ok', () => {
    render(<Badge ok />)
    expect(screen.getByText('Activo')).toBeTruthy()
  })

  it('reads Inactivo when not ok', () => {
    render(<Badge ok={false} />)
    expect(screen.getByText('Inactivo')).toBeTruthy()
  })
})

describe('ScoreChip', () => {
  it('renders a dash when there is no score', () => {
    render(<ScoreChip score={null} />)
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('rounds the score it displays', () => {
    render(<ScoreChip score={82.4} />)
    expect(screen.getByText('82')).toBeTruthy()
  })

  it('colours the score by band', () => {
    const { container: high } = render(<ScoreChip score={80} />)
    const { container: mid } = render(<ScoreChip score={50} />)
    const { container: low } = render(<ScoreChip score={49} />)

    expect(high.firstElementChild?.className).toContain('text-success')
    expect(mid.firstElementChild?.className).toContain('text-warning')
    expect(low.firstElementChild?.className).toContain('text-danger')
  })
})

describe('formatDate', () => {
  it('renders a dash for a missing date', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('formats an ISO date in es-CO', () => {
    expect(formatDate('2026-03-15T10:00:00Z')).toMatch(/2026/)
  })
})

describe('is401', () => {
  it('recognises the 401 error thrown by the api wrapper', () => {
    expect(is401(new Error('401: Unauthorized'))).toBe(true)
  })

  it('rejects any other status', () => {
    expect(is401(new Error('500: Server Error'))).toBe(false)
  })

  it('survives a non-Error value', () => {
    expect(is401(null)).toBeFalsy()
    expect(is401(undefined)).toBeFalsy()
  })
})
