import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getRecentSchedule,
  getScheduleFairness,
  getSummaryMetrics,
  getWorkloadMetrics,
} from '../../../api/metrics'

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}))

vi.mock('../../../api/axios', () => ({
  default: {
    get: getMock,
  },
}))

describe('metrics api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets schedule fairness metrics', async () => {
    const fairnessResponse = {
      fairness_score: 92,
      workload_balance: 88,
    }

    getMock.mockResolvedValue({
      data: fairnessResponse,
    })

    const result = await getScheduleFairness(1)

    expect(getMock).toHaveBeenCalledWith('/metrics/fairness/1')
    expect(result).toEqual(fairnessResponse)
  })

  it('gets workload metrics', async () => {
    const params = {
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      employee_id: 1,
    }

    const workloadResponse = {
      total_hours: 160,
      overtime_hours: 12,
    }

    getMock.mockResolvedValue({
      data: workloadResponse,
    })

    const result = await getWorkloadMetrics(params)

    expect(getMock).toHaveBeenCalledWith(
      '/metrics/workload',
      { params },
    )

    expect(result).toEqual(workloadResponse)
  })

  it('gets summary metrics', async () => {
    const summaryResponse = {
      total_employees: 15,
      active_schedules: 4,
    }

    getMock.mockResolvedValue({
      data: summaryResponse,
    })

    const result = await getSummaryMetrics()

    expect(getMock).toHaveBeenCalledWith('/metrics/summary')
    expect(result).toEqual(summaryResponse)
  })

  it('gets recent schedule', async () => {
    const recentScheduleResponse = {
      id: 1,
      generated_at: '2026-01-01T10:00:00',
    }

    getMock.mockResolvedValue({
      data: recentScheduleResponse,
    })

    const result = await getRecentSchedule()

    expect(getMock).toHaveBeenCalledWith('/metrics/recent-schedule')
    expect(result).toEqual(recentScheduleResponse)
  })

  it('returns null when recent schedule does not exist', async () => {
    getMock.mockResolvedValue({
      data: null,
    })

    const result = await getRecentSchedule()

    expect(result).toBeNull()
  })
})