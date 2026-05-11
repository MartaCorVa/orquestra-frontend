import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const { getSummaryMetricsMock, getRecentScheduleMock } = vi.hoisted(() => ({
  getSummaryMetricsMock: vi.fn(),
  getRecentScheduleMock: vi.fn(),
}))

vi.mock('../../../api/metrics', () => ({
  getSummaryMetrics: getSummaryMetricsMock,
  getRecentSchedule: getRecentScheduleMock,
}))

import { useDashboardStore } from '../../../stores/dashboard'

describe('dashboard store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads summary metrics successfully', async () => {
    const summary = {
      active_employees: 5,
      weekly_shifts: 20,
      schedules: 3,
      pending_validations: 1,
    }

    getSummaryMetricsMock.mockResolvedValue(summary)

    const store = useDashboardStore()

    await store.loadSummaryMetrics()

    expect(store.summaryMetrics).toEqual(summary)
    expect(store.hasSummaryError).toBe(false)
    expect(store.isLoadingSummary).toBe(false)
  })

  it('sets summary error when loading summary metrics fails', async () => {
    getSummaryMetricsMock.mockRejectedValue(new Error('Failed'))

    const store = useDashboardStore()

    await store.loadSummaryMetrics()

    expect(store.hasSummaryError).toBe(true)
    expect(store.isLoadingSummary).toBe(false)
  })

  it('loads recent schedule successfully', async () => {
    const recentSchedule = {
      id: 1,
      start_date: '2026-05-01',
      end_date: '2026-05-31',
      status: 'generated',
    }

    getRecentScheduleMock.mockResolvedValue(recentSchedule)

    const store = useDashboardStore()

    await store.loadRecentSchedule()

    expect(store.recentSchedule).toEqual(recentSchedule)
    expect(store.hasRecentScheduleError).toBe(false)
    expect(store.isLoadingRecentSchedule).toBe(false)
  })

  it('sets recent schedule error when loading recent schedule fails', async () => {
    getRecentScheduleMock.mockRejectedValue(new Error('Failed'))

    const store = useDashboardStore()
    store.recentSchedule = {
      id: 1,
      shifts: [
        {
          start_date: '2026-05-01',
          end_date: '2026-05-01',
          start_time: '09:00',
          end_time: '17:00',
          status: 'draft',
          number_of_employees: 2,
        },
      ],
    }
    await store.loadRecentSchedule()

    expect(store.hasRecentScheduleError).toBe(true)
    expect(store.recentSchedule).toBeNull()
    expect(store.isLoadingRecentSchedule).toBe(false)
  })

  it('loads dashboard data', async () => {
    getSummaryMetricsMock.mockResolvedValue({
      active_employees: 5,
      weekly_shifts: 20,
      schedules: 3,
      pending_validations: 1,
    })

    getRecentScheduleMock.mockResolvedValue({
      id: 1,
      start_date: '2026-05-01',
      end_date: '2026-05-31',
      status: 'generated',
    })

    const store = useDashboardStore()

    await store.loadDashboardData()

    expect(getSummaryMetricsMock).toHaveBeenCalled()
    expect(getRecentScheduleMock).toHaveBeenCalled()
  })

  it('refreshes dashboard data after schedule is created', async () => {
    getSummaryMetricsMock.mockResolvedValue({
      active_employees: 5,
      weekly_shifts: 20,
      schedules: 3,
      pending_validations: 1,
    })

    getRecentScheduleMock.mockResolvedValue(null)

    const store = useDashboardStore()

    await store.refreshAfterScheduleCreated()

    expect(getSummaryMetricsMock).toHaveBeenCalled()
    expect(getRecentScheduleMock).toHaveBeenCalled()
  })
})