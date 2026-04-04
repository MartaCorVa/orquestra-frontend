<template>
  <AppShell
    title="Equity analysis"
    subtitle="Analyze workload fairness for a selected schedule."
  >
    <section class="space-y-6">
      <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div>
            <label
              for="schedule-id"
              class="mb-2 block text-sm font-medium text-slate-700"
            >
              Schedule ID
            </label>
            <input
              id="schedule-id"
              v-model.number="scheduleId"
              type="number"
              min="1"
              class="w-40 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
            />
          </div>

          <button
            type="button"
            class="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="isLoading"
            @click="loadFairness"
          >
            {{ isLoading ? 'Loading...' : 'Load fairness' }}
          </button>
        </div>
      </section>

      <section
        v-if="errorMessage"
        class="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </section>

      <section
        v-if="fairnessData"
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div class="mb-6 grid gap-4 md:grid-cols-4">
          <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm text-slate-500">Total assigned hours</p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">
              {{ fairnessData.total_assigned_hours }}h
            </p>
          </article>

          <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm text-slate-500">Max assigned hours</p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">
              {{ fairnessData.max_assigned_hours }}h
            </p>
          </article>

          <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm text-slate-500">Min assigned hours</p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">
              {{ fairnessData.min_assigned_hours }}h
            </p>
          </article>

          <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm text-slate-500">Hours gap</p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">
              {{ fairnessData.hours_gap }}h
            </p>
          </article>
        </div>

        <div class="space-y-3">
          <article
            v-for="employee in fairnessData.employees"
            :key="employee.employee_id"
            class="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
          >
            <div>
              <p class="font-medium text-slate-900">
                {{ employee.employee_name }}
              </p>
              <p class="mt-1 text-sm text-slate-500">
                Max weekly hours: {{ employee.max_weekly_hours }}h
              </p>
            </div>

            <div class="text-right">
              <p class="font-semibold text-slate-900">
                {{ employee.assigned_hours }}h
              </p>
              <p class="mt-1 text-sm text-slate-500">
                {{ employee.workload_percentage.toFixed(2) }}%
              </p>
            </div>
          </article>
        </div>
      </section>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import AppShell from '../../components/layout/AppShell.vue'
import { getScheduleFairness } from '../../api/metrics'
import { getBackendErrorMessage } from '../../utils/api'
import type { ScheduleFairnessResponse } from '../../types/metrics'

const scheduleId = ref<number>(1)
const fairnessData = ref<ScheduleFairnessResponse | null>(null)
const isLoading = ref<boolean>(false)
const errorMessage = ref<string>('')

async function loadFairness(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    fairnessData.value = await getScheduleFairness(scheduleId.value)
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to load fairness metrics. Please check the schedule ID and try again.',
    )
    fairnessData.value = null
  } finally {
    isLoading.value = false
  }
}
</script>