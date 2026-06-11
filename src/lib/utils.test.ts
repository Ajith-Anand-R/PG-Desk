import { describe, it, expect } from 'vitest'
import { cn, calculateNoticeDays, getDaysRemaining } from './utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should resolve tailwind conflicts', () => {
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
  })
})

describe('calculateNoticeDays', () => {
  it('should calculate correct notice days', () => {
    expect(calculateNoticeDays('2026-06-01', '2026-07-01')).toBe(30)
  })

  it('should return N/A if noticeDate or vacateDate is missing', () => {
    expect(calculateNoticeDays(null, '2026-07-01')).toBe('N/A')
    expect(calculateNoticeDays('2026-06-01', undefined)).toBe('N/A')
  })
})

describe('getDaysRemaining', () => {
  it('should calculate days remaining from reference date', () => {
    const reference = new Date('2026-06-10T12:00:00')
    expect(getDaysRemaining('2026-06-15', reference)).toBe(5)
  })

  it('should return null if vacateDateStr is missing', () => {
    expect(getDaysRemaining(null)).toBeNull()
  })

  it('should handle past vacate dates', () => {
    const reference = new Date('2026-06-10T12:00:00')
    expect(getDaysRemaining('2026-06-05', reference)).toBe(-5)
  })
})

