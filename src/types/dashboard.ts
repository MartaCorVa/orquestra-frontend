export interface RecentScheduleShift {
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  status: string
  number_of_employees: number
}

export interface RecentSchedule {
  id: number
  shifts: RecentScheduleShift[]
}

export interface SummaryMetrics {
  active_employees: number
  weekly_shifts: number
  schedules: number
  pending_validations: number
}

export interface SummaryCard {
  label: string
  value: number
}