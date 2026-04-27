import apiClient from './axios'

export interface Shift {
  id: number
  start_datetime: string
  end_datetime: string
  creation_type: string
  status: string
  schedule_id: number
  created_at: string
  employee_id: number | null
  employee_name: string | null
}

export interface CreateShiftPayload {
  start_datetime: string
  end_datetime: string
  creation_type: string
  status: string
  schedule_id: number
  employee_id?: number | null
}

export interface UpdateShiftPayload {
  start_datetime?: string
  end_datetime?: string
  creation_type?: string
  status?: string
  schedule_id?: number
  employee_id?: number | null
}

export type ShiftTableItem = {
  id: number
  start_datetime: string
  end_datetime: string
  creation_type: string
  status: string
  employee_id: number | null
  employee_name: string | null
}

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface CreateRecurrentShiftPayload {
  schedule_id: number
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  weekdays: Weekday[]
  creation_type: string
  status: string
  employee_id?: number | null
}

export async function getShifts(): Promise<Shift[]> {
  const response = await apiClient.get<Shift[]>('/shifts/')
  return response.data
}

export async function getShiftsTable(): Promise<ShiftTableItem[]> {
  const response = await apiClient.get<ShiftTableItem[]>('/shifts/table')
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

export async function createRecurrentShifts(
  payload: CreateRecurrentShiftPayload,
): Promise<Shift[]> {
  const response = await apiClient.post<Shift[]>('/shifts/recurrent', payload)
  return response.data
}