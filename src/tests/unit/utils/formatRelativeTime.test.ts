import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatRelativeTime } from '../../../utils/formatRelativeTime'

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    vi.setSystemTime(new Date('2026-05-05T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Just now" when difference is less than 60 seconds', () => {
    const timestamp = '2026-05-05T11:59:45'

    expect(formatRelativeTime(timestamp)).toBe('Just now')
  })

  it('returns minutes ago when difference is less than 60 minutes', () => {
    const timestamp = '2026-05-05T11:45:00'

    expect(formatRelativeTime(timestamp)).toBe('15 min ago')
  })

  it('returns hours ago when difference is less than 24 hours', () => {
    const timestamp = '2026-05-05T08:00:00'

    expect(formatRelativeTime(timestamp)).toBe('4 h ago')
  })

  it('returns one day ago correctly', () => {
    const timestamp = '2026-05-04T12:00:00'

    expect(formatRelativeTime(timestamp)).toBe('1 day ago')
  })

  it('returns multiple days ago correctly', () => {
    const timestamp = '2026-05-02T12:00:00'

    expect(formatRelativeTime(timestamp)).toBe('3 days ago')
  })
})