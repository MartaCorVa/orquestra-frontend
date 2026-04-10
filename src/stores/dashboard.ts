import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getRecentSchedule, getSummaryMetrics } from '../api/metrics'
import type { RecentSchedule, SummaryMetrics } from '../types/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const summaryMetrics = ref<SummaryMetrics>({
    active_employees: 0,
    weekly_shifts: 0,
    schedules: 0,
    pending_validations: 0,
  })

  const recentSchedule = ref<RecentSchedule | null>(null)

  const isLoadingSummary = ref(false)
  const isLoadingRecentSchedule = ref(false)

  const hasSummaryError = ref(false)
  const hasRecentScheduleError = ref(false)

  const loadSummaryMetrics = async () => {
    isLoadingSummary.value = true
    hasSummaryError.value = false

    try {
      summaryMetrics.value = await getSummaryMetrics()
    } catch {
      hasSummaryError.value = true
    } finally {
      isLoadingSummary.value = false
    }
  }

  const loadRecentSchedule = async () => {
    isLoadingRecentSchedule.value = true
    hasRecentScheduleError.value = false

    try {
      recentSchedule.value = await getRecentSchedule()
    } catch {
      hasRecentScheduleError.value = true
      recentSchedule.value = null
    } finally {
      isLoadingRecentSchedule.value = false
    }
  }

  const loadDashboardData = async () => {
    await Promise.all([
      loadSummaryMetrics(),
      loadRecentSchedule(),
    ])
  }

  const refreshAfterScheduleCreated = async () => {
    await loadDashboardData()
  }

  return {
    summaryMetrics,
    recentSchedule,
    isLoadingSummary,
    isLoadingRecentSchedule,
    hasSummaryError,
    hasRecentScheduleError,
    loadSummaryMetrics,
    loadRecentSchedule,
    loadDashboardData,
    refreshAfterScheduleCreated,
  }
})