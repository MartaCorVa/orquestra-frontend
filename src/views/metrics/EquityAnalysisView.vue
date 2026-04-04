<template>
  <AppShell
    title="Equity analysis"
    subtitle="Analyze workload fairness for a selected schedule."
  >
    <section class="space-y-6">
      <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label
                for="schedule-id"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                Schedule
              </label>
              <select
                id="schedule-id"
                v-model.number="selectedScheduleId"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                :disabled="isLoadingSchedules || isLoadingFairness"
              >
                <option value="">Select a schedule</option>
                <option
                  v-for="schedule in schedules"
                  :key="schedule.id"
                  :value="schedule.id"
                >
                  #{{ schedule.id }} · {{ formatDate(schedule.start_date) }} - {{ formatDate(schedule.end_date) }}
                </option>
              </select>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p class="text-sm text-slate-500">Selected period</p>
              <p class="mt-2 font-medium text-slate-900">
                {{ selectedScheduleLabel }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="isLoadingFairness || !selectedScheduleId"
            @click="loadFairness"
          >
            {{ isLoadingFairness ? 'Loading...' : 'Load fairness' }}
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
        v-if="isLoadingSchedules"
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <p class="text-sm text-slate-500">Loading schedules...</p>
      </section>

      <template v-if="fairnessData">
        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="card in summaryCards"
            :key="card.label"
            class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p class="text-sm text-slate-500">{{ card.label }}</p>
            <p class="mt-3 text-3xl font-semibold text-slate-900">
              {{ card.value }}
            </p>
          </article>
        </section>

        <section class="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-slate-900">Hours by employee</h2>
            <p class="mt-1 text-sm text-slate-500">
              Compare assigned hours and workload percentages across employees.
            </p>

            <div class="mt-6 space-y-4">
              <article
                v-for="employee in fairnessData.employees"
                :key="employee.employee_id"
                class="grid grid-cols-[140px_1fr_72px] items-center gap-4"
              >
                <div>
                  <p class="text-sm font-medium text-slate-900">
                    {{ employee.employee_name }}
                  </p>
                  <p class="mt-1 text-xs text-slate-500">
                    Max {{ employee.max_weekly_hours }}h
                  </p>
                </div>

                <div class="h-4 overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full bg-blue-600"
                    :style="{ width: `${getBarWidth(employee.assigned_hours)}%` }"
                  />
                </div>

                <div class="text-right">
                  <p class="text-sm font-semibold text-slate-900">
                    {{ employee.assigned_hours }}h
                  </p>
                  <p class="mt-1 text-xs text-slate-500">
                    {{ employee.workload_percentage.toFixed(1) }}%
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-slate-900">Detected insights</h2>
            <p class="mt-1 text-sm text-slate-500">
              Quick interpretation of the fairness distribution.
            </p>

            <div class="mt-6 space-y-3">
              <article
                v-for="insight in insights"
                :key="insight.title"
                class="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
              >
                <div>
                  <p class="font-medium text-slate-900">{{ insight.title }}</p>
                  <p class="mt-1 text-sm text-slate-500">{{ insight.description }}</p>
                </div>

                <span
                  class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                  :class="insight.badgeClass"
                >
                  {{ insight.badge }}
                </span>
              </article>
            </div>
          </section>
        </section>
      </template>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'

import AppShell from '../../components/layout/AppShell.vue'
import { getScheduleFairness } from '../../api/metrics'
import { getSchedules, type Schedule } from '../../api/schedules'
import { getBackendErrorMessage } from '../../utils/api'
import type { ScheduleFairnessResponse } from '../../types/metrics'

interface SummaryCard {
  label: string
  value: string
}

interface InsightItem {
  title: string
  description: string
  badge: string
  badgeClass: string
}

const schedules = ref<Schedule[]>([])
const selectedScheduleId = ref<number | null>(null)
const fairnessData = ref<ScheduleFairnessResponse | null>(null)

const isLoadingSchedules = ref<boolean>(false)
const isLoadingFairness = ref<boolean>(false)
const errorMessage = ref<string>('')

const selectedSchedule = computed<Schedule | undefined>(() =>
  schedules.value.find((schedule) => schedule.id === selectedScheduleId.value),
)

const selectedScheduleLabel = computed<string>(() => {
  if (!selectedSchedule.value) {
    return 'No schedule selected'
  }

  return `${formatDate(selectedSchedule.value.start_date)} - ${formatDate(selectedSchedule.value.end_date)}`
})

const summaryCards = computed<SummaryCard[]>(() => {
  if (!fairnessData.value) {
    return []
  }

  return [
    {
      label: 'Total assigned hours',
      value: `${fairnessData.value.total_assigned_hours}h`,
    },
    {
      label: 'Max assigned hours',
      value: `${fairnessData.value.max_assigned_hours}h`,
    },
    {
      label: 'Min assigned hours',
      value: `${fairnessData.value.min_assigned_hours}h`,
    },
    {
      label: 'Hours gap',
      value: `${fairnessData.value.hours_gap}h`,
    },
  ]
})

const insights = computed<InsightItem[]>(() => {
  if (!fairnessData.value || fairnessData.value.employees.length === 0) {
    return []
  }

  const employees = fairnessData.value.employees
  const highest = [...employees].sort(
    (firstEmployee, secondEmployee) => secondEmployee.assigned_hours - firstEmployee.assigned_hours,
  )[0]
  const lowest = [...employees].sort(
    (firstEmployee, secondEmployee) => firstEmployee.assigned_hours - secondEmployee.assigned_hours,
  )[0]

  const isBalanced = fairnessData.value.hours_gap <= 4

  return [
    {
      title: isBalanced ? 'Balanced planning' : 'Uneven distribution',
      description: isBalanced
        ? 'The hours gap is low, which suggests a relatively fair allocation.'
        : 'The difference between the highest and lowest assigned hours should be reviewed.',
      badge: isBalanced ? 'Good' : 'Review',
      badgeClass: isBalanced
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Highest workload',
      description: `${highest.employee_name} has the highest assigned workload with ${highest.assigned_hours}h.`,
      badge: `${highest.assigned_hours}h`,
      badgeClass: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Lowest workload',
      description: `${lowest.employee_name} has the lowest assigned workload with ${lowest.assigned_hours}h.`,
      badge: `${lowest.assigned_hours}h`,
      badgeClass: 'bg-slate-100 text-slate-700',
    },
  ]
})

function formatDate(value: string): string {
  return dayjs(value).format('DD/MM/YYYY')
}

function getBarWidth(assignedHours: number): number {
  if (!fairnessData.value || fairnessData.value.max_assigned_hours === 0) {
    return 0
  }

  return (assignedHours / fairnessData.value.max_assigned_hours) * 100
}

async function loadSchedules(): Promise<void> {
  isLoadingSchedules.value = true
  errorMessage.value = ''

  try {
    schedules.value = await getSchedules()

    if (schedules.value.length > 0 && selectedScheduleId.value === null) {
      selectedScheduleId.value = schedules.value[0].id
    }
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to load schedules. Please try again.',
    )
  } finally {
    isLoadingSchedules.value = false
  }
}

async function loadFairness(): Promise<void> {
  if (!selectedScheduleId.value) {
    return
  }

  isLoadingFairness.value = true
  errorMessage.value = ''

  try {
    fairnessData.value = await getScheduleFairness(selectedScheduleId.value)
  } catch (error: unknown) {
    errorMessage.value = getBackendErrorMessage(
      error,
      'Unable to load fairness metrics. Please try again.',
    )
    fairnessData.value = null
  } finally {
    isLoadingFairness.value = false
  }
}

onMounted(async () => {
  await loadSchedules()

  if (selectedScheduleId.value) {
    await loadFairness()
  }
})
</script>