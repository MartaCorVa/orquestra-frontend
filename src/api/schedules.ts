import apiClient from './axios'
export type ScheduleStatus = 'draft' | 'generated' | 'published'

export interface Schedule {
  id: number
  start_date: string
  end_date: string
  status: ScheduleStatus
  created_at: string
}
export interface CreateSchedulePayload {
  start_date: string
  end_date: string
  status: 'draft'
}

export interface UpdateSchedulePayload {
  start_date?: string
  end_date?: string
  status?: ScheduleStatus
}

export interface EmployeeBelowTarget {
  employee_id: number
  employee_name: string
  assigned_hours: number
  contract_hours: number
  missing_hours: number
}

export interface GeneratePlanningResponse {
  message: string
  assignments_created: unknown[]
  unfilled_shifts: unknown[]
  employees_below_target: EmployeeBelowTarget[]
  missing_contract_hours_total: number
}

export interface ScheduleDetailEmployee {
  id: number
  first_name: string
  last_name: string
}

export interface ScheduleDetailAssignment {
  id: number
  employee: ScheduleDetailEmployee
}

export interface ScheduleDetailShift {
  id: number
  date: string
  start_time: string
  end_time: string
  status: string
  assignments: ScheduleDetailAssignment[]
}

export interface ScheduleDetail {
  id: number
  start_date: string
  end_date: string
  status: string
  shifts: ScheduleDetailShift[]
}

export async function getSchedules(): Promise<Schedule[]> {
  const response = await apiClient.get<Schedule[]>('/schedules/')
  return response.data
}

export const getScheduleById = async (id: number): Promise<ScheduleDetail> => {
  const response = await apiClient.get(`/schedules/${id}`)
  return response.data
}

export async function createSchedule(
  payload: CreateSchedulePayload,
): Promise<Schedule> {
  const response = await apiClient.post<Schedule>('/schedules/', payload)
  return response.data
}

export async function updateSchedule(
  id: number,
  payload: UpdateSchedulePayload,
): Promise<Schedule> {
  const response = await apiClient.put<Schedule>(`/schedules/${id}`, payload)
  return response.data
}

export async function deleteSchedule(id: number): Promise<void> {
  await apiClient.delete(`/schedules/${id}`)
}

export async function generatePlanning(
  scheduleId: number,
): Promise<GeneratePlanningResponse> {
  const response = await apiClient.post<GeneratePlanningResponse>(
    `/planning/generate/${scheduleId}`,
    {},
  )
  return response.data
}