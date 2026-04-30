import { vi } from 'vitest'
import type { Contract } from '../../api/contracts'

export const contractMock: Contract = {
  id: 1,
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
  created_at: '2026-04-01T10:00:00',
  updated_at: '2026-04-01T10:00:00',
}

export const activeContractMock: Contract = {
  id: 1,
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
  created_at: '2026-04-01T00:00:00',
  updated_at: '2026-04-01T00:00:00',
}

export const getActiveContractByEmployeeMock = vi.fn()