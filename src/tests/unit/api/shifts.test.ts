import { beforeEach, describe, expect, it, vi } from 'vitest'

import { shiftMock, shiftsMock, shiftsTableMock } from '../../mocks/shifts'

import {
  createRecurrentShifts,
  createShift,
  deleteShift,
  getShiftById,
  getShifts,
  getShiftsTable,
  updateShift,
  type CreateRecurrentShiftPayload,
  type CreateShiftPayload,
  type UpdateShiftPayload,
} from '../../../api/shifts'

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

describe('shifts api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets shifts', async () => {
    getMock.mockResolvedValue({ data: shiftsMock })

    const result = await getShifts()

    expect(getMock).toHaveBeenCalledWith('/shifts/')
    expect(result).toEqual(shiftsMock)
  })

  it('gets shifts table', async () => {
    getMock.mockResolvedValue({ data: shiftsTableMock })

    const result = await getShiftsTable()

    expect(getMock).toHaveBeenCalledWith('/shifts/table')
    expect(result).toEqual(shiftsTableMock)
  })

  it('gets shift by id', async () => {
    getMock.mockResolvedValue({ data: shiftMock })

    const result = await getShiftById(1)

    expect(getMock).toHaveBeenCalledWith('/shifts/1')
    expect(result).toEqual(shiftMock)
  })

  it('creates a shift', async () => {
    const payload: CreateShiftPayload = {
      start_datetime: '2026-05-01T09:00:00',
      end_datetime: '2026-05-01T17:00:00',
      creation_type: 'manual',
      status: 'draft',
      schedule_id: 1,
      employee_id: 1,
    }

    postMock.mockResolvedValue({ data: shiftMock })

    const result = await createShift(payload)

    expect(postMock).toHaveBeenCalledWith('/shifts/', payload)
    expect(result).toEqual(shiftMock)
  })

  it('updates a shift', async () => {
    const payload: UpdateShiftPayload = {
      status: 'published',
      employee_id: null,
    }

    const updatedShift = {
      ...shiftMock,
      ...payload,
    }

    putMock.mockResolvedValue({ data: updatedShift })

    const result = await updateShift(1, payload)

    expect(putMock).toHaveBeenCalledWith('/shifts/1', payload)
    expect(result).toEqual(updatedShift)
  })

  it('deletes a shift', async () => {
    deleteMock.mockResolvedValue({})

    await deleteShift(1)

    expect(deleteMock).toHaveBeenCalledWith('/shifts/1')
  })

  it('creates recurrent shifts', async () => {
    const payload: CreateRecurrentShiftPayload = {
      schedule_id: 1,
      start_date: '2026-05-01',
      end_date: '2026-05-31',
      start_time: '09:00',
      end_time: '17:00',
      weekdays: ['monday', 'tuesday'],
      creation_type: 'recurrent',
      status: 'draft',
      employee_id: 1,
    }

    postMock.mockResolvedValue({ data: shiftsMock })

    const result = await createRecurrentShifts(payload)

    expect(postMock).toHaveBeenCalledWith('/shifts/recurrent', payload)
    expect(result).toEqual(shiftsMock)
  })
})