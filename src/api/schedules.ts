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

export async function getSchedules(): Promise<Schedule[]> {
  const response = await apiClient.get<Schedule[]>('/schedules/')
  return response.data
}

export async function getScheduleById(id: number): Promise<Schedule> {
  const response = await apiClient.get<Schedule>(`/schedules/${id}`)
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