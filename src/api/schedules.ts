import apiClient from './axios'

export interface Schedule {
  id: number
  start_date: string
  end_date: string
  status: string
  created_at: string
}

export interface CreateSchedulePayload {
  start_date: string
  end_date: string
  status: string
}

export interface UpdateSchedulePayload {
  start_date?: string
  end_date?: string
  status?: string
}

export interface GeneratePlanningPayload {
  employees_per_shift?: number
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
  payload: GeneratePlanningPayload,
): Promise<void> {
  await apiClient.post(`/planning/generate/${scheduleId}`, payload)
}