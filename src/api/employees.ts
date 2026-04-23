import apiClient from './axios'
import type { Contract } from './contracts'

export interface Employee {
  id: number
  first_name: string
  last_name: string
  phone_number: string
  active: boolean
  user_id: number
  created_at: string
}

export interface EmployeeOnboardingContractPayload {
  weekly_hours: number
  daily_hours: number
  min_days_off_per_week: number
  work_monday: boolean
  work_tuesday: boolean
  work_wednesday: boolean
  work_thursday: boolean
  work_friday: boolean
  work_saturday: boolean
  work_sunday: boolean
  has_fixed_schedule: boolean
  preferred_start_time: string | null
  preferred_end_time: string | null
  active: boolean
  start_date: string | null
  end_date: string | null
}

export interface EmployeeOnboardingPayload {
  email: string
  password: string
  role: 'employee'
  first_name: string
  last_name: string
  phone_number: string
  active: boolean
  contract: EmployeeOnboardingContractPayload
}

export interface EmployeeOnboardingResponse {
  user_id: number
  employee_id: number
  email: string
  role: 'employee'
  must_change_password: boolean
  first_name: string
  last_name: string
  phone_number: string | null
  active: boolean
  contract: Contract
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
): Promise<EmployeeOnboardingResponse> {
  const response = await apiClient.post<EmployeeOnboardingResponse>(
    '/employees/onboarding',
    payload,
  )
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