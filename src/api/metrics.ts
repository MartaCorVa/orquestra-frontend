import apiClient from './axios'
import type {
  ScheduleFairnessResponse,
  WorkloadMetricsResponse,
} from '../types/metrics'

export async function getScheduleFairness(
  scheduleId: number
): Promise<ScheduleFairnessResponse> {
  const response = await apiClient.get(`/metrics/fairness/${scheduleId}`)
  return response.data
}

export async function getWorkloadMetrics(
  params: {
    start_date: string
    end_date: string
    employee_id?: number
  }
): Promise<WorkloadMetricsResponse> {
  const response = await apiClient.get('/metrics/workload', { params })
  return response.data
}