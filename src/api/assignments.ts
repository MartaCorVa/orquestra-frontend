import apiClient from './axios'

export interface Assignment {
  id: number
  employee_id: number
  shift_id: number
  assigned_at: string
}

export interface CreateAssignmentPayload {
  employee_id: number
  shift_id: number
}

export async function getAssignments(): Promise<Assignment[]> {
  const response = await apiClient.get<Assignment[]>('/assignments/')
  return response.data
}

export async function createAssignment(
  payload: CreateAssignmentPayload,
): Promise<Assignment> {
  const response = await apiClient.post<Assignment>('/assignments/', payload)
  return response.data
}

export async function deleteAssignment(id: number): Promise<void> {
  await apiClient.delete(`/assignments/${id}`)
}