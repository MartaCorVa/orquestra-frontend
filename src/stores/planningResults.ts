import { defineStore } from 'pinia'
import type { GeneratePlanningResponse } from '../api/schedules'

interface PlanningResultsState {
  results: Record<number, GeneratePlanningResponse>
}

export const usePlanningResultsStore = defineStore('planningResults', {
  state: (): PlanningResultsState => ({
    results: {},
  }),

  actions: {
    setResult(scheduleId: number, result: GeneratePlanningResponse) {
      this.results[scheduleId] = result
    },

    getResult(scheduleId: number): GeneratePlanningResponse | null {
      return this.results[scheduleId] ?? null
    },

    clearResult(scheduleId: number) {
      delete this.results[scheduleId]
    },
  },
})