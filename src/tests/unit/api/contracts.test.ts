import { beforeEach, describe, expect, it, vi } from 'vitest'

import { activeContractMock, contractMock } from '../../mocks/contracts'
import {
  createContract,
  getActiveContractByEmployee,
  getContractsByEmployee,
  type CreateContractPayload,
} from '../../../api/contracts'

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}))

vi.mock('../../../api/axios', () => ({
  default: {
    get: getMock,
    post: postMock,
  },
}))

describe('contracts api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets contracts by employee', async () => {
    getMock.mockResolvedValue({ data: [contractMock] })

    const result = await getContractsByEmployee(1)

    expect(getMock).toHaveBeenCalledWith('/contracts/employee/1')
    expect(result).toEqual([contractMock])
  })

  it('gets active contract by employee', async () => {
    getMock.mockResolvedValue({ data: activeContractMock })

    const result = await getActiveContractByEmployee(1)

    expect(getMock).toHaveBeenCalledWith('/contracts/employee/1/active')
    expect(result).toEqual(activeContractMock)
  })

  it('creates a contract', async () => {
    const payload: CreateContractPayload = {
      employee_id: 1,
      weekly_hours: 40,
      daily_hours: 8,
      min_days_off_per_week: 2,
      work_monday: true,
      work_tuesday: true,
      work_wednesday: true,
      work_thursday: true,
      work_friday: true,
      work_saturday: false,
      work_sunday: false,
      has_fixed_schedule: true,
      preferred_start_time: '09:00',
      preferred_end_time: '17:00',
      active: true,
      start_date: '2026-04-01',
      end_date: null,
    }

    getMock.mockResolvedValue({ data: contractMock })
    postMock.mockResolvedValue({ data: contractMock })

    const result = await createContract(payload)

    expect(postMock).toHaveBeenCalledWith('/contracts/', payload)
    expect(result).toEqual(contractMock)
  })
})