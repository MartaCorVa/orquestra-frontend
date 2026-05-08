import { beforeEach, describe, expect, it, vi } from 'vitest'

import { schedulesMock } from '../../mocks/schedules'

import {
  createSchedule,
  deleteSchedule,
  generatePlanning,
  getScheduleById,
  getSchedules,
  updateSchedule,
  type CreateSchedulePayload,
  type ScheduleDetail,
  type UpdateSchedulePayload,
} from '../../../api/schedules'

const { getMock, postMock, putMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
  deleteMock: vi.fn(),
}))

vi.mock('../../../api/axios', () => ({
  default: {
    get: getMock,
    post: postMock,
    put: putMock,
    delete: deleteMock,
  },
}))

describe('schedules api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets schedules', async () => {
    getMock.mockResolvedValue({
      data: schedulesMock,
    })

    const result = await getSchedules()

    expect(getMock).toHaveBeenCalledWith('/schedules/')
    expect(result).toEqual(schedulesMock)
  })

  it('gets schedule by id', async () => {
    const scheduleDetail: ScheduleDetail = {
      id: 1,
      start_date: '2026-05-01',
      end_date: '2026-05-31',
      status: 'draft',
      shifts: [],
    }

    getMock.mockResolvedValue({
      data: scheduleDetail,
    })

    const result = await getScheduleById(1)

    expect(getMock).toHaveBeenCalledWith('/schedules/1')
    expect(result).toEqual(scheduleDetail)
  })

  it('creates a schedule', async () => {
    const payload: CreateSchedulePayload = {
      start_date: '2026-05-01',
      end_date: '2026-05-31',
      status: 'draft',
    }

    postMock.mockResolvedValue({
      data: schedulesMock[0],
    })

    const result = await createSchedule(payload)

    expect(postMock).toHaveBeenCalledWith('/schedules/', payload)
    expect(result).toEqual(schedulesMock[0])
  })

  it('updates a schedule', async () => {
    const payload: UpdateSchedulePayload = {
      status: 'generated',
    }

    const updatedSchedule = {
      ...schedulesMock[0],
      status: 'generated' as const,
    }

    putMock.mockResolvedValue({
      data: updatedSchedule,
    })

    const result = await updateSchedule(1, payload)

    expect(putMock).toHaveBeenCalledWith('/schedules/1', payload)
    expect(result).toEqual(updatedSchedule)
  })

  it('deletes a schedule', async () => {
    deleteMock.mockResolvedValue({})

    await deleteSchedule(1)

    expect(deleteMock).toHaveBeenCalledWith('/schedules/1')
  })

  it('generates planning', async () => {
    const planningResponse = {
      message: 'Planning generated successfully',
      assignments_created: [],
      unfilled_shifts: [],
      employees_below_target: [],
      missing_contract_hours_total: 0,
    }

    postMock.mockResolvedValue({
      data: planningResponse,
    })

    const result = await generatePlanning(1)

    expect(postMock).toHaveBeenCalledWith(
      '/planning/generate/1',
      {},
    )

    expect(result).toEqual(planningResponse)
  })
})