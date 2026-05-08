import { beforeEach, describe, expect, it, vi } from 'vitest'

import { contractMock } from '../../mocks/contracts'
import { employeesMock } from '../../mocks/employees'

import {
  createEmployeeOnboarding,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  updateEmployee,
  type EmployeeOnboardingPayload,
  type UpdateEmployeePayload,
} from '../../../api/employees'

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

describe('employees api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets employees', async () => {
    getMock.mockResolvedValue({
      data: employeesMock,
    })

    const result = await getEmployees()

    expect(getMock).toHaveBeenCalledWith('/employees/')
    expect(result).toEqual(employeesMock)
  })

  it('gets employee by id', async () => {
    getMock.mockResolvedValue({
      data: employeesMock[0],
    })

    const result = await getEmployeeById(1)

    expect(getMock).toHaveBeenCalledWith('/employees/1')
    expect(result).toEqual(employeesMock[0])
  })

  it('creates employee onboarding', async () => {
    const payload: EmployeeOnboardingPayload = {
      email: 'marta@example.com',
      password: 'password123',
      role: 'employee',
      first_name: 'Marta',
      last_name: 'Lopez',
      phone_number: '600123123',
      active: true,
      contract: {
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
      },
    }

    const onboardingResponse = {
      user_id: 10,
      employee_id: 1,
      email: payload.email,
      role: 'employee' as const,
      must_change_password: true,
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone_number: payload.phone_number,
      active: true,
      contract: contractMock,
    }

    postMock.mockResolvedValue({
      data: onboardingResponse,
    })

    const result = await createEmployeeOnboarding(payload)

    expect(postMock).toHaveBeenCalledWith(
      '/employees/onboarding',
      payload,
    )

    expect(result).toEqual(onboardingResponse)
  })

  it('updates an employee', async () => {
    const payload: UpdateEmployeePayload = {
      first_name: 'Updated',
      last_name: 'Employee',
      phone_number: '123456789',
      active: true,
    }

    const updatedEmployee = {
      ...employeesMock[0],
      ...payload,
    }

    putMock.mockResolvedValue({
      data: updatedEmployee,
    })

    const result = await updateEmployee(1, payload)

    expect(putMock).toHaveBeenCalledWith('/employees/1', payload)
    expect(result).toEqual(updatedEmployee)
  })

  it('deletes an employee', async () => {
    deleteMock.mockResolvedValue({})

    await deleteEmployee(1)

    expect(deleteMock).toHaveBeenCalledWith('/employees/1')
  })
})