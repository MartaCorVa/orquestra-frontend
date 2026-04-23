import apiClient from './axios'

export interface Employee {
  id: number
  first_name: string
  last_name: string
  phone_number: string
  active: boolean
  user_id: number
  created_at: string
}

export interface EmployeeOnboardingPayload {
  email: string
  password: string
  role: 'employee'
  first_name: string
  last_name: string
  phone_number: string
  active: boolean
}

export interface UpdateEmployeePayload {
  first_name: string
  last_name: string
  phone_number: string
  active: boolean
}

export async function getEmployees(): Promise<Employee[]> {
  const response = await apiClient.get<Employee[]>('/employees/')
  return response.data
}

export async function getEmployeeById(id: number): Promise<Employee> {
  const response = await apiClient.get<Employee>(`/employees/${id}`)
  return response.data
}

export async function createEmployeeOnboarding(
  payload: EmployeeOnboardingPayload,
): Promise<Employee> {
  const response = await apiClient.post<Employee>('/employees/onboarding', payload)
  return response.data
}

export async function updateEmployee(
  id: number,
  payload: UpdateEmployeePayload,
): Promise<Employee> {
  const response = await apiClient.put<Employee>(`/employees/${id}`, payload)
  return response.data
}

export async function deleteEmployee(id: number): Promise<void> {
  await apiClient.delete(`/employees/${id}`)
}