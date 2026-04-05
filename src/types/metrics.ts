export interface EmployeeFairnessMetric {
  employee_id: number
  employee_name: string
  assigned_hours: number
  max_weekly_hours: number
  workload_percentage: number
}

export interface ScheduleFairnessResponse {
  schedule_id: number
  total_assigned_hours: number
  employees: EmployeeFairnessMetric[]
  max_assigned_hours: number
  min_assigned_hours: number
  hours_gap: number
}

export interface EmployeeWorkloadMetric {
  employee_id: number
  employee_name: string
  assigned_hours: number
  max_weekly_hours: number
  workload_percentage: number
}

export interface WorkloadMetricsResponse {
  start_date: string
  end_date: string
  total_assigned_hours: number
  employees: EmployeeWorkloadMetric[]
}