import apiClient from './axios'

export interface Contract {
  id: number
  employee_id: number
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
  created_at: string
  updated_at: string
}

export interface CreateContractPayload {
  employee_id: number
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

export async function getContractsByEmployee(employeeId: number): Promise<Contract[]> {
  const response = await apiClient.get(`/contracts/employee/${employeeId}`)
  return response.data
}

export async function getActiveContractByEmployee(employeeId: number): Promise<Contract | null> {
  const contracts = await getContractsByEmployee(employeeId)
  return contracts.find((contract) => contract.active) ?? null
}

export async function createContract(payload: CreateContractPayload): Promise<Contract> {
  const response = await apiClient.post<Contract>('/contracts/', payload)
  return response.data
}