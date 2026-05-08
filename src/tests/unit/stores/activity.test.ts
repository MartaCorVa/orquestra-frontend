import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useActivityStore } from '../../../stores/activity'

describe('activity store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    localStorage.clear()

    vi.restoreAllMocks()
  })

  it('loads empty activities when storage is empty', () => {
    const store = useActivityStore()

    store.loadActivities()

    expect(store.activities).toEqual([])
  })

  it('loads activities from localStorage', () => {
    const activities = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Schedule created',
        description: 'A new schedule was created',
        timestamp: '2026-05-05T10:00:00',
      },
    ]

    localStorage.setItem(
      'recent-activity',
      JSON.stringify(activities),
    )

    const store = useActivityStore()

    store.loadActivities()

    expect(store.activities).toEqual(activities)
  })

  it('loads empty activities when storage contains invalid json', () => {
    localStorage.setItem('recent-activity', 'invalid-json')

    const store = useActivityStore()

    store.loadActivities()

    expect(store.activities).toEqual([])
  })

  it('adds a new activity', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '123e4567-e89b-12d3-a456-426614174000',
    )

    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(
      '2026-05-05T12:00:00',
    )

    const store = useActivityStore()

    store.addActivity(
      'Shift created',
      'A new shift was created',
    )

    expect(store.activities).toHaveLength(1)

    expect(store.activities[0]).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Shift created',
      description: 'A new shift was created',
      timestamp: '2026-05-05T12:00:00',
    })
  })

  it('keeps only the last three activities', () => {
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('123e4567-e89b-12d3-a456-426614174001')
      .mockReturnValueOnce('123e4567-e89b-12d3-a456-426614174002')
      .mockReturnValueOnce('123e4567-e89b-12d3-a456-426614174003')
      .mockReturnValueOnce('123e4567-e89b-12d3-a456-426614174004')

    const store = useActivityStore()

    store.addActivity('1', 'description 1')
    store.addActivity('2', 'description 2')
    store.addActivity('3', 'description 3')
    store.addActivity('4', 'description 4')

    expect(store.activities).toHaveLength(3)

    expect(store.activities.map((activity) => activity.title)).toEqual([
      '4',
      '3',
      '2',
    ])
  })

  it('clears activities', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '123e4567-e89b-12d3-a456-426614174000',
    )

    const store = useActivityStore()

    store.addActivity(
      'Shift created',
      'A new shift was created',
    )

    store.clearActivities()

    expect(store.activities).toEqual([])

    expect(
      JSON.parse(localStorage.getItem('recent-activity') ?? '[]'),
    ).toEqual([])
  })

  it('returns recent activities', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '123e4567-e89b-12d3-a456-426614174000',
    )

    const store = useActivityStore()

    store.addActivity(
      'Shift created',
      'A new shift was created',
    )

    expect(store.recentActivities).toEqual(store.activities)
  })
})