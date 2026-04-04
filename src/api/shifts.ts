import apiClient from './axios'

export interface Shift {
  id: number
  date: string
  start_time: string
  end_time: string
  creation_type: string
  status: string
  schedule_id: number
  created_at: string
}

export interface CreateShiftPayload {
  date: string
  start_time: string
  end_time: string
  creation_type: string
  status: string
  schedule_id: number
}

export interface UpdateShiftPayload {
  date?: string
  start_time?: string
  end_time?: string
  creation_type?: string
  status?: string
  schedule_id?: number
}

export async function getShifts(): Promise<Shift[]> {
  const response = await apiClient.get<Shift[]>('/shifts/')
  return response.data
}

export async function getShiftById(id: number): Promise<Shift> {
  const response = await apiClient.get<Shift>(`/shifts/${id}`)
  return response.data
}

export async function createShift(
  payload: CreateShiftPayload,
): Promise<Shift> {
  const response = await apiClient.post<Shift>('/shifts/', payload)
  return response.data
}

export async function updateShift(
  id: number,
  payload: UpdateShiftPayload,
): Promise<Shift> {
  const response = await apiClient.put<Shift>(`/shifts/${id}`, payload)
  return response.data
}

export async function deleteShift(id: number): Promise<void> {
  await apiClient.delete(`/shifts/${id}`)
}